import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, RefreshCw, AlertTriangle, Cpu, Layers, Trash2, FilePlus } from 'lucide-react';
import { submitOcrScan, postNewCase } from '../utils/api';

interface ExtractedData {
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
  sections: string;
  victim: string;
  accused: string;
  witness: string;
  address: string;
  phone: string;
  weapon: string;
  location: string;
  officer: string;
  latitude: number;
  longitude: number;
}

interface OCRResult {
  fileName: string;
  detectedLanguage: string;
  confidence: number;
  ocrTimestamp: string;
  structuredData: ExtractedData;
  confidences: { [key: string]: number };
  originalText: string;
  isSaved?: boolean;
}

interface FIRDigitizerProps {
  onSuccess: () => void;
  showNotification: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const FIRDigitizer: React.FC<FIRDigitizerProps> = ({ onSuccess, showNotification }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<string>("general");
  const [isDragOver, setIsDragOver] = useState(false);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Run AI OCR Batch
  const runDigitization = async () => {
    if (uploadedFiles.length === 0) return;
    setLoading(true);
    try {
      const results = await submitOcrScan(uploadedFiles);
      setOcrResults(results);
      if (results.length > 0) {
        setSelectedResultIndex(0);
      }
      showNotification(`Successfully processed ${results.length} files in batch mode.`, 'success');
    } catch (e) {
      console.error(e);
      showNotification("Error running AI digitizer.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Input Handlers for editable extracted fields
  const handleFieldChange = (field: keyof ExtractedData, value: any) => {
    if (selectedResultIndex === null) return;
    setOcrResults(prev => {
      const updated = [...prev];
      const target = updated[selectedResultIndex];
      target.structuredData = {
        ...target.structuredData,
        [field]: value
      };
      return updated;
    });
  };

  // Save Verified Incident
  const saveVerifiedFIR = async () => {
    if (selectedResultIndex === null) return;
    const currentResult = ocrResults[selectedResultIndex];
    const dataToSave = currentResult.structuredData;

    try {
      await postNewCase(dataToSave);
      
      // Update local state to show verified tag
      setOcrResults(prev => {
        const updated = [...prev];
        updated[selectedResultIndex] = {
          ...updated[selectedResultIndex],
          isSaved: true
        };
        return updated;
      });

      showNotification(`FIR ${dataToSave.id} verified and synchronized with KSP ledger.`, 'success');
      onSuccess(); // Re-trigger metrics counts
    } catch (e) {
      console.error(e);
      showNotification("Error saving case file.", "danger");
    }
  };

  // Helper for confidence color rendering
  const getConfidenceBadge = (score: number) => {
    if (!score) return { color: 'bg-danger text-danger border-danger/20', text: 'Low Confidence' };
    if (score >= 80) {
      return { color: 'bg-success/10 text-success border-success/20', text: `High (${score}%)` };
    } else if (score >= 50) {
      return { color: 'bg-warning/10 text-warning border-warning/20', text: `Medium (${score}%)` };
    }
    return { color: 'bg-danger/10 text-danger border-danger/20', text: `Low (${score}%)` };
  };

  const getConfidenceDot = (score: number) => {
    if (!score) return 'bg-danger';
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const selectedOCR = selectedResultIndex !== null ? ocrResults[selectedResultIndex] : null;

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 max-w-7xl mx-auto h-[600px] min-h-0">
      
      {/* Left Workspace Panel (Uploads / Transcription Viewer) */}
      <div className="flex-1 card-panel p-5 flex flex-col min-h-0 min-w-0">
        
        {/* Upload state view */}
        {ocrResults.length === 0 ? (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="border-b border-border-color pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                <UploadCloud size={15} /> Upload Scanned FIR Documents
              </h3>
              <span className="text-[10px] text-text-muted font-mono uppercase">Batch Processing Enclave</span>
            </div>

            {/* Drag & Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition ${
                isDragOver ? 'border-accent bg-[#143D73]/5' : 'border-border-color bg-bg-tertiary/40'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-text-muted mb-3 animate-pulse" />
              <p className="text-xs font-bold text-text-primary mb-1">Drag & Drop files here, or browse files</p>
              <p className="text-[10px] text-text-muted max-w-xs leading-relaxed mb-4">
                Supports batch uploading of scanned FIR PDFs, camera photos, or handwritten complaint images. (Kannada & English).
              </p>
              <label className="py-2 px-4 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded-lg text-xs font-bold transition border border-[#1b4b8c] cursor-pointer">
                Select Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
              </label>
            </div>

            {/* Batch Files Queue */}
            {uploadedFiles.length > 0 && (
              <div className="h-44 border border-border-color rounded-lg bg-bg-tertiary/40 flex flex-col min-h-0">
                <div className="border-b border-border-color px-3 py-2 bg-bg-tertiary flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                  <span>Batch Queue ({uploadedFiles.length} files)</span>
                  <button onClick={() => setUploadedFiles([])} className="text-danger hover:underline">Clear All</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-bg-secondary border border-border-color/60 rounded-md text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-accent flex-shrink-0" />
                        <span className="truncate text-text-primary font-semibold font-mono">{file.name}</span>
                        <span className="text-[9px] text-text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-text-muted hover:text-danger">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-border-color bg-bg-tertiary">
                  <button
                    onClick={runDigitization}
                    disabled={loading}
                    className="w-full py-2 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition border border-[#1b4b8c]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin text-accent" size={13} /> Analyzing Document Layouts...
                      </>
                    ) : (
                      <>
                        <Cpu size={13} className="text-accent" /> Run AI Digitization
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Side-by-Side: Left Side OCR text viewer
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="border-b border-border-color pb-3 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                <Layers size={15} /> Batch OCR Results
              </h3>
              <button 
                onClick={() => {
                  setOcrResults([]);
                  setUploadedFiles([]);
                  setSelectedResultIndex(null);
                }} 
                className="text-[10px] text-text-muted hover:text-danger font-bold uppercase"
              >
                Scan New Batch
              </button>
            </div>

            {/* Batch Selector Tab chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0">
              {ocrResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedResultIndex(i)}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition flex items-center gap-1.5 shrink-0 ${
                    selectedResultIndex === i 
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-bg-tertiary text-text-secondary border-border-color hover:bg-bg-secondary'
                  }`}
                >
                  <FileText size={11} />
                  <span className="truncate max-w-[80px] font-mono">{result.fileName}</span>
                  {result.isSaved ? (
                    <CheckCircle size={10} className="text-success" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Document Details & Transcribed Text */}
            {selectedOCR && (
              <div className="flex-1 flex flex-col min-h-0 gap-3 border border-border-color rounded-xl p-4 bg-bg-tertiary/20">
                <div className="flex items-center justify-between border-b border-border-color/55 pb-2 text-[10px] text-text-secondary font-bold uppercase">
                  <span>File: <strong className="text-text-primary font-mono">{selectedOCR.fileName}</strong></span>
                  <span>Lang: <strong className="text-accent">{selectedOCR.detectedLanguage}</strong></span>
                </div>
                <div className="flex-1 overflow-y-auto bg-bg-primary p-3 rounded-lg border border-border-color/60 text-xs leading-relaxed font-sans text-text-primary select-text whitespace-pre-line">
                  {selectedOCR.originalText}
                </div>
                <div className="border-t border-border-color/55 pt-2 flex items-center justify-between text-[9px] text-text-muted font-mono uppercase">
                  <span>Confidence: {selectedOCR.confidence}%</span>
                  <span>Timestamp: {new Date(selectedOCR.ocrTimestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Editable Preview Form */}
      <div className="w-full xl:w-[480px] card-panel p-5 flex flex-col h-full min-h-0 shrink-0">
        {selectedOCR ? (
          <div className="flex-1 flex flex-col min-h-0 gap-4">
            
            {/* Form Header */}
            <div className="border-b border-border-color pb-3 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="text-success w-4.5 h-4.5" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-outfit">Extracted Fields</h3>
              </div>

              {/* Verified Tag */}
              {selectedOCR.isSaved ? (
                <span className="badge badge-success text-[9px] font-bold uppercase px-2 py-0.5 rounded">Verified & Saved</span>
              ) : (
                <span className={`badge ${
                  getConfidenceBadge(selectedOCR.confidence).color
                } text-[9px] font-bold uppercase px-2 py-0.5 rounded border`}>
                  {getConfidenceBadge(selectedOCR.confidence).text}
                </span>
              )}
            </div>

            {/* Tab selection for form segments */}
            <div className="flex border-b border-border-color/60 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
              {[
                { id: "general", label: "General Details" },
                { id: "parties", label: "Parties Involved" },
                { id: "evidence", label: "Weapons & Location" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id)}
                  className={`py-2 px-3 border-b-2 transition-all ${
                    activeFormTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Editable Form Inputs Container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 min-h-0">
              
              {/* TAB 1: General Details */}
              {activeFormTab === "general" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.id)}`}></span>
                        FIR Number
                      </label>
                      <input
                        type="text"
                        value={selectedOCR.structuredData.id}
                        onChange={(e) => handleFieldChange("id", e.target.value)}
                        className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent font-mono font-bold"
                        disabled={selectedOCR.isSaved}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.crimeType)}`}></span>
                        Crime Type
                      </label>
                      <select
                        value={selectedOCR.structuredData.crimeType}
                        onChange={(e) => handleFieldChange("crimeType", e.target.value)}
                        className="bg-bg-primary border border-border-color rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                        disabled={selectedOCR.isSaved}
                      >
                        <option value="Burglary">Burglary</option>
                        <option value="Theft">Vehicle Theft</option>
                        <option value="Chain Snatching">Chain Snatching</option>
                        <option value="Cyber Crime">Cyber Crime</option>
                        <option value="Organized Crime">Organized Crime</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.title)}`}></span>
                      Incident Title
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-semibold outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.district)}`}></span>
                        District
                      </label>
                      <input
                        type="text"
                        value={selectedOCR.structuredData.district}
                        onChange={(e) => handleFieldChange("district", e.target.value)}
                        className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                        disabled={selectedOCR.isSaved}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.station)}`}></span>
                        Police Station
                      </label>
                      <input
                        type="text"
                        value={selectedOCR.structuredData.station}
                        onChange={(e) => handleFieldChange("station", e.target.value)}
                        className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                        disabled={selectedOCR.isSaved}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.sections)}`}></span>
                      BNS Sections Charged
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.sections}
                      onChange={(e) => handleFieldChange("sections", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent font-mono"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.description)}`}></span>
                      Incident Summary (OCR Extracted)
                    </label>
                    <textarea
                      value={selectedOCR.structuredData.description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-accent min-h-[70px] resize-none leading-relaxed"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.mo)}`}></span>
                      Modus Operandi Description
                    </label>
                    <textarea
                      value={selectedOCR.structuredData.mo}
                      onChange={(e) => handleFieldChange("mo", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-accent min-h-[45px] resize-none leading-relaxed font-mono"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>
                </>
              )}

              {/* TAB 2: Parties Involved */}
              {activeFormTab === "parties" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.victim)}`}></span>
                      Victim / Complainant Name
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.victim}
                      onChange={(e) => handleFieldChange("victim", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.accused)}`}></span>
                      Accused Suspect Name
                    </label>
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={selectedOCR.structuredData.accused}
                        onChange={(e) => handleFieldChange("accused", e.target.value)}
                        className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                        disabled={selectedOCR.isSaved}
                      />
                      {selectedOCR.confidences.accused < 50 && (
                        <div className="p-2 bg-danger/5 border border-danger/15 text-[10px] text-danger rounded flex items-center gap-1">
                          <AlertTriangle size={11} className="flex-shrink-0 animate-bounce" />
                          <span><b>OCR Flag:</b> Accused matching carries high phonetic error risk. Verify manually.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.witness)}`}></span>
                      Witness Account Name
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.witness}
                      onChange={(e) => handleFieldChange("witness", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.address)}`}></span>
                      Address Location details
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.phone)}`}></span>
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent font-mono"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>
                </>
              )}

              {/* TAB 3: Weapons & Evidence */}
              {activeFormTab === "evidence" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.weapon)}`}></span>
                      Weapon / Tool Used
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.weapon}
                      onChange={(e) => handleFieldChange("weapon", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.location)}`}></span>
                      Specific Scene Location Category
                    </label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.latitude)}`}></span>
                        Scene Latitude
                      </label>
                      <input
                        type="number"
                        value={selectedOCR.structuredData.latitude}
                        onChange={(e) => handleFieldChange("latitude", parseFloat(e.target.value))}
                        className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent font-mono"
                        disabled={selectedOCR.isSaved}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getConfidenceDot(selectedOCR.confidences.longitude)}`}></span>
                        Scene Longitude
                      </label>
                      <input
                        type="number"
                        value={selectedOCR.structuredData.longitude}
                        onChange={(e) => handleFieldChange("longitude", parseFloat(e.target.value))}
                        className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent font-mono"
                        disabled={selectedOCR.isSaved}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary">Extracted Evidence Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.evidence.join(", ")}
                      onChange={(e) => handleFieldChange("evidence", e.target.value.split(",").map(ev => ev.trim()))}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                      disabled={selectedOCR.isSaved}
                      placeholder="e.g. Iron crowbar, shoe prints"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-secondary font-mono">Linked Vehicles (Comma-separated)</label>
                    <input
                      type="text"
                      value={selectedOCR.structuredData.connectedVehicles.join(", ")}
                      onChange={(e) => handleFieldChange("connectedVehicles", e.target.value.split(",").map(v => v.trim()))}
                      className="bg-bg-primary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent font-mono"
                      disabled={selectedOCR.isSaved}
                      placeholder="e.g. KA-01-MC-4592"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Form Save Button */}
            <div className="border-t border-border-color pt-3 flex-shrink-0">
              <button
                onClick={saveVerifiedFIR}
                disabled={selectedOCR.isSaved}
                className="w-full bg-[#143D73] hover:bg-[#1b4b8c] text-white py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border border-[#1b4b8c] disabled:bg-success/20 disabled:text-success disabled:border-transparent"
              >
                {selectedOCR.isSaved ? (
                  <>
                    <CheckCircle size={14} /> Saved & Verified
                  </>
                ) : (
                  <>
                    <FilePlus size={14} className="text-accent" /> Verify and Save FIR
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-20">
            <Cpu className="w-10 h-10 mb-2 text-border-color animate-pulse" />
            <h3 className="text-xs font-bold text-text-primary mb-1">Verify Extracted Data</h3>
            <p className="text-[10px] text-text-muted max-w-xs leading-relaxed">
              Upload scanned documents on the left and run AI Digitization to view extracted structures here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
