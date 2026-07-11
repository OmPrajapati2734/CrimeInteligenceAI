import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Search, Sparkles, RefreshCw, User, ArrowRight } from 'lucide-react';
import { submitSearch } from '../utils/api';

interface Criminal {
  id: string;
  name: string;
  alias: string;
  age: number;
  aadhaar: string;
  phone: string;
  gang: string;
  mo: string;
  status: string;
  riskScore: number;
  vehicles: string[];
}

interface Case {
  id: string;
  title: string;
  date: string;
  district: string;
  station: string;
  crimeType: string;
  status: string;
  io: string;
  description: string;
  mo: string;
  suspects: string[];
  connectedVehicles: string[];
  evidence: string[];
}

interface Vehicle {
  regNumber: string;
  type: string;
  color: string;
  owner: string;
  status: string;
  connection: string;
}

interface SearchResponse {
  query: string;
  responseText: string;
  matchedData: {
    criminals: Criminal[];
    cases: Case[];
    vehicles: Vehicle[];
  };
  suggestedQueries: string[];
}

interface CopilotProps {
  currentOfficer: string;
  currentRole: string;
  maskPII: boolean;
  triggerLogsReload: () => void;
}

// Declaring speech recognition types for TS compiler
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const Copilot: React.FC<CopilotProps> = ({
  currentOfficer,
  currentRole,
  maskPII,
  triggerLogsReload
}) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: SearchResponse['matchedData'] }>>([
    {
      sender: 'assistant',
      text: "Hello, Officer. I am the **KSP Investigator Copilot**. I can search police intelligence records, link suspects to vehicle numbers, trace gangs, and summarize patterns. \n\nYou can talk to me in **English** or **Kannada** (ಕನ್ನಡ). Type a query below or click the microphone icon for voice inputs.",
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'en' ? 'en-IN' : 'kn-IN';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language === 'en' ? 'en-IN' : 'kn-IN';
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await submitSearch(textToSend, currentOfficer, currentRole);
      triggerLogsReload();
      
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: response.responseText,
        data: response.matchedData
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "Apologies, Officer. I encountered an error communicating with the Catalyst Serverless engine. Reconnecting..."
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestedChips = language === 'en' ? [
    "Show all burglary cases connected with Yashas Kumar",
    "Who is the registered owner of KA-01-MC-4592?",
    "Find Lakeside Gang criminal associates"
  ] : [
    "ಜಯನಗರ ಕಳವು ಪ್ರಕರಣದಲ್ಲಿ ಶಂಕಿತ ಯಾರು?",
    "KA-01-MC-4592 ವಾಹನದ ಮಾಲೀಕ ಯಾರು?",
    "ಇತ್ತೀಚಿನ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳ ವಿವರ ನೀಡಿ"
  ];

  return (
    <div className="flex flex-col h-[560px] glass-panel border-cyan-500/20 rounded-xl overflow-hidden p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400 w-5 h-5 animate-pulse" />
          <h2 className="text-lg font-semibold font-outfit">Investigator Copilot AI</h2>
          <span className="badge-cyan px-2 py-0.5 rounded text-[10px] uppercase font-semibold">Active Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${
              language === 'en' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-bg-tertiary text-text-secondary'
            }`}
          >
            ENG
          </button>
          <button
            onClick={() => setLanguage('kn')}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${
              language === 'kn' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-bg-tertiary text-text-secondary'
            }`}
          >
            ಕನ್ನಡ (KAN)
          </button>
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3.5 text-sm leading-relaxed border ${
              msg.sender === 'user' 
                ? 'bg-cyan-500/10 text-cyan-100 border-cyan-500/25 rounded-tr-none'
                : 'bg-bg-secondary text-text-primary border-border-color rounded-tl-none'
            }`}>
              {/* Parse Markdown-like bold formats */}
              <p className="whitespace-pre-line">
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong className="text-cyan-400 font-semibold" key={i}>{part}</strong> : part)}
              </p>

              {/* Data Cards Injection */}
              {msg.data && (
                <div className="mt-4 flex flex-col gap-3">
                  {/* Cases Cards */}
                  {msg.data.cases.map(c => (
                    <div key={c.id} className="p-3 bg-bg-primary/60 rounded-lg border border-border-color hover:border-cyan-500/30 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="badge-pink text-[10px] px-2 py-0.5 rounded font-mono font-semibold">{c.id}</span>
                        <span className="text-[10px] text-text-muted">{c.station} • {new Date(c.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary mb-1">{c.title}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2 mb-2">{c.description}</p>
                      <div className="text-[10px] text-text-muted flex justify-between border-t border-white/5 pt-1.5">
                        <span>IO: {c.io}</span>
                        <span className="text-cyan-400 font-semibold">{c.crimeType}</span>
                      </div>
                    </div>
                  ))}

                  {/* Criminal Profiles */}
                  {msg.data.criminals.map(c => (
                    <div key={c.id} className="p-3 bg-bg-primary/60 rounded-lg border border-border-color hover:border-cyan-500/30 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-cyan-400" />
                          <h4 className="text-xs font-bold text-text-primary">{c.name}</h4>
                          <span className="text-[9px] text-text-muted">({c.alias})</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          c.riskScore > 80 ? 'badge-pink' : 'badge-amber'
                        }`}>
                          Risk: {c.riskScore}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-text-secondary mb-2">
                        <div>Age: <span className="text-text-primary">{c.age}</span></div>
                        <div>Status: <span className="text-accent-amber font-semibold">{c.status}</span></div>
                        <div>Phone: <span className={maskPII ? "blur-[2.5px] select-none" : "text-text-primary"}>{c.phone}</span></div>
                        <div>Aadhaar: <span className={maskPII ? "blur-[2.5px] select-none" : "text-text-primary"}>{c.aadhaar}</span></div>
                      </div>
                      <div className="text-[10px] border-t border-white/5 pt-1.5 text-text-muted">
                        <span className="text-text-secondary font-medium">Gang:</span> {c.gang}
                      </div>
                    </div>
                  ))}

                  {/* Vehicles Cards */}
                  {msg.data.vehicles.map(v => (
                    <div key={v.regNumber} className="p-3 bg-bg-primary/60 rounded-lg border border-border-color">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-xs font-bold text-cyan-400">{v.regNumber}</span>
                        <span className="badge-cyan text-[9px] px-1.5 py-0.5 rounded">{v.type}</span>
                      </div>
                      <div className="text-[10px] text-text-secondary">
                        Owner: <span className="text-text-primary font-medium">{v.owner}</span> | Status: <span className="text-pink-400 font-semibold">{v.status}</span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-1 font-mono italic">
                        {v.connection}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 bg-bg-secondary border border-border-color rounded-xl p-3.5 max-w-[40%] text-xs text-text-secondary self-start">
            <RefreshCw size={14} className="animate-spin text-cyan-400" />
            <span>Analyzing multi-hop connections...</span>
          </div>
        )}
      </div>

      {/* Suggested Queries Chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-[11px] text-cyan-300 bg-cyan-900/15 border border-cyan-800/30 px-2.5 py-1 rounded-full hover:bg-cyan-900/25 hover:border-cyan-600/40 transition flex items-center gap-1"
          >
            {chip}
            <ArrowRight size={10} />
          </button>
        ))}
      </div>

      {/* Input Tray */}
      <div className="flex gap-2.5">
        <button
          onClick={toggleRecording}
          className={`p-3 rounded-lg border flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-pink-600/20 text-pink-400 border-pink-500/40 pulse-glow'
              : 'bg-bg-secondary text-text-secondary border-border-color hover:border-cyan-500/30'
          }`}
          title={isRecording ? "Stop voice input" : "Record voice query"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(query);
          }}
          className="flex-1 flex gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRecording ? "Listening to voice input..." : "Ask Sentinel AI... (e.g. Yashas associates)"}
              className="w-full h-full bg-bg-secondary text-text-primary text-sm rounded-lg border border-border-color px-3 pr-10 outline-none focus:border-cyan-500/50"
            />
            <Search className="absolute right-3 top-3.5 text-text-muted" size={16} />
          </div>
          <button
            type="submit"
            className="p-3 bg-cyan-600 hover:bg-cyan-500 text-bg-primary font-bold rounded-lg transition"
            title="Send query"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
