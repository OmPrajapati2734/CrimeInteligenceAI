import React, { useState, useEffect } from 'react';
import { FileSearch, RefreshCw, AlertCircle, FileText, User, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { submitSimilarCases } from '../utils/api';

interface MatchResult {
  id: string;
  title: string;
  confidence: number;
  crimeType: string;
  mo: string;
  io: string;
  station: string;
  description: string;
}

interface SuspectResult {
  id: string;
  name: string;
  alias: string;
  riskScore: number;
  mo: string;
  status: string;
}

interface SimilarCaseFinderProps {
  currentOfficer: string;
  currentRole: string;
  initialFilter?: string;
}

export const SimilarCaseFinder: React.FC<SimilarCaseFinderProps> = ({ currentOfficer, currentRole, initialFilter }) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanTime, setScanTime] = useState(0);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [suspects, setSuspects] = useState<SuspectResult[]>([]);
  const [searched, setSearched] = useState(false);
  
  // Table sorting, filtering, pagination
  const [globalSearch, setGlobalSearch] = useState("");
  const [colFilterId, setColFilterId] = useState("");
  const [colFilterType, setColFilterType] = useState("");
  const [sortField, setSortField] = useState<keyof MatchResult | ''>('confidence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Panel sizing state (resizable scanner panel)
  const [scannerWidth, setScannerWidth] = useState(33); // in percentage

  const handleScan = async (overrideText?: string) => {
    const textToScan = overrideText || description;
    if (!textToScan.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const data = await submitSimilarCases(textToScan, currentOfficer, currentRole);
      setMatches(data.matches);
      setSuspects(data.suspects);
      setScanTime(data.scanTimeMs);
      setSearched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (type: 'burglary' | 'snatching') => {
    let sample = "";
    if (type === 'burglary') {
      sample = "A lock was picked cleanly at Jayanagar. Gated community house break-in. Alarm panel bypassed. Stolen gold valuables. Black hatchback getaway vehicle spotted nearby.";
    } else {
      sample = "Two men riding a high-speed Pulsar motorbike grabbed a gold necklace from an elderly lady walking near the park gate in the morning hours. Fled on the national highway.";
    }
    setDescription(sample);
    return sample;
  };

  // Handle Initial Filter from dashboard KPI clicks
  useEffect(() => {
    if (initialFilter) {
      const sampleText = loadSample(initialFilter === 'burglary' ? 'burglary' : 'snatching');
      handleScan(sampleText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilter]);

  // Filtering local results
  const filteredMatches = matches.filter(m => {
    const matchesGlobal = 
      m.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.io.toLowerCase().includes(globalSearch.toLowerCase());
      
    const matchesColId = m.id.toLowerCase().includes(colFilterId.toLowerCase());
    const matchesColType = m.crimeType.toLowerCase().includes(colFilterType.toLowerCase());

    return matchesGlobal && matchesColId && matchesColType;
  });

  // Sorting local results
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination local results
  const totalPages = Math.ceil(sortedMatches.length / pageSize);
  const paginatedMatches = sortedMatches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof MatchResult) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-7xl mx-auto h-[600px]">
      
      {/* Resizable Sidebar Scanner Panel */}
      <div 
        className="glass-panel p-5 border-border-color flex flex-col gap-4 overflow-y-auto"
        style={{ width: `${scannerWidth}%`, minWidth: '280px', maxWidth: '450px' }}
      >
        <div className="flex items-center justify-between border-b border-border-color pb-3 mb-1">
          <div className="flex items-center gap-2">
            <FileSearch className="text-accent w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-outfit text-text-primary">Narrative Scanner</h2>
          </div>
          {/* Panel resizing helpers */}
          <div className="hidden md:flex gap-1">
            <button onClick={() => setScannerWidth(25)} className={`w-3 h-3 rounded-full ${scannerWidth === 25 ? 'bg-accent' : 'bg-bg-tertiary border border-border-color'}`} title="Slim Panel" />
            <button onClick={() => setScannerWidth(33)} className={`w-3 h-3 rounded-full ${scannerWidth === 33 ? 'bg-accent' : 'bg-bg-tertiary border border-border-color'}`} title="Medium Panel" />
            <button onClick={() => setScannerWidth(40)} className={`w-3 h-3 rounded-full ${scannerWidth === 40 ? 'bg-accent' : 'bg-bg-tertiary border border-border-color'}`} title="Wide Panel" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <label className="text-[11px] font-bold text-text-secondary">Incident statement / FIR description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 w-full bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-3 outline-none focus:border-accent resize-none leading-relaxed"
            placeholder="Paste raw complaint description, suspect statements, or MO tags here..."
          />

          <div className="flex gap-2">
            <button
              onClick={() => loadSample('burglary')}
              className="flex-1 py-1.5 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color text-text-secondary hover:text-accent rounded text-[10px] font-bold transition"
            >
              Load Burglary
            </button>
            <button
              onClick={() => loadSample('snatching')}
              className="flex-1 py-1.5 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color text-text-secondary hover:text-accent rounded text-[10px] font-bold transition"
            >
              Load Snatching
            </button>
          </div>
        </div>

        <button
          onClick={() => handleScan()}
          disabled={loading || !description.trim()}
          className="w-full bg-[#143D73] hover:bg-[#1b4b8c] text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-[#1b4b8c]"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin text-accent" size={14} /> Scanning Database...
            </>
          ) : (
            <>
              <FileSearch size={14} className="text-accent" /> Search Similar Cases
            </>
          )}
        </button>
      </div>

      {/* Main Results Table Panel */}
      <div className="flex-1 flex flex-col gap-5 h-full min-w-0">
        {loading ? (
          <div className="glass-panel p-6 border-border-color flex-1 flex flex-col items-center justify-center text-center text-text-muted gap-4">
            <RefreshCw className="w-10 h-10 text-accent animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-1">Scanning Crime Records database</h3>
              <p className="text-xs max-w-xs text-text-secondary leading-relaxed">Mapping text tokens, suspect profiles, and vehicle registrations using secure QuickML pipelines...</p>
            </div>
          </div>
        ) : searched ? (
          <div className="flex-1 flex flex-col md:flex-row gap-5 min-h-0">
            {/* Matches Table */}
            <div className="flex-1 glass-panel p-5 border-border-color flex flex-col min-h-0 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color pb-3 mb-3.5">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                  <FileText size={15} /> Scanned Incident Matches
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted font-mono">{scanTime}ms Scan Time</span>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Global search..."
                      value={globalSearch}
                      onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
                      className="bg-bg-primary text-text-primary text-[10px] pl-6 pr-2.5 py-1 rounded border border-border-color outline-none focus:border-accent w-36"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Table Container */}
              <div className="flex-1 overflow-auto border border-border-color rounded-lg">
                <table className="w-full text-left text-xs border-collapse relative">
                  <thead className="sticky top-0 bg-bg-tertiary text-text-secondary border-b border-border-color z-10">
                    <tr>
                      <th className="py-2 px-3 font-semibold w-24">
                        <div className="flex flex-col gap-1">
                          <button className="flex items-center gap-1 hover:text-accent font-semibold" onClick={() => handleSort('id')}>
                            Case ID <ArrowUpDown size={10} />
                          </button>
                          <input
                            type="text"
                            placeholder="Filter ID..."
                            value={colFilterId}
                            onChange={(e) => { setColFilterId(e.target.value); setCurrentPage(1); }}
                            className="bg-bg-primary text-text-primary text-[9px] px-1 py-0.5 rounded border border-border-color outline-none font-normal"
                          />
                        </div>
                      </th>
                      <th className="py-2 px-3 font-semibold">Title & Details</th>
                      <th className="py-2 px-3 font-semibold w-28">
                        <div className="flex flex-col gap-1">
                          <button className="flex items-center gap-1 hover:text-accent font-semibold" onClick={() => handleSort('crimeType')}>
                            Type <ArrowUpDown size={10} />
                          </button>
                          <input
                            type="text"
                            placeholder="Filter Type..."
                            value={colFilterType}
                            onChange={(e) => { setColFilterType(e.target.value); setCurrentPage(1); }}
                            className="bg-bg-primary text-text-primary text-[9px] px-1 py-0.5 rounded border border-border-color outline-none font-normal"
                          />
                        </div>
                      </th>
                      <th className="py-2 px-3 font-semibold text-center w-24 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('confidence')}>
                        <span className="flex items-center justify-center gap-1">Match % <ArrowUpDown size={10} /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMatches.length > 0 ? (
                      paginatedMatches.map(m => (
                        <tr key={m.id} className="border-b border-border-color/30 hover:bg-bg-tertiary transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-accent align-top">{m.id}</td>
                          <td className="py-3 px-3 align-top">
                            <h4 className="font-bold text-text-primary mb-1">{m.title}</h4>
                            <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2 mb-1.5">{m.description}</p>
                            <div className="flex items-center gap-2 text-[9px] text-text-muted font-mono">
                              <span>IO: {m.io}</span>
                              <span>•</span>
                              <span>STN: {m.station}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 align-top font-semibold text-text-secondary">{m.crimeType}</td>
                          <td className="py-3 px-3 text-center align-top font-bold text-success font-mono">{m.confidence}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-text-muted">No matching cases.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 border-t border-border-color pt-3 text-[10px] text-text-secondary">
                  <span>Page {currentPage} of {totalPages} ({filteredMatches.length} cases found)</span>
                  <div className="flex items-center gap-3">
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                      className="bg-bg-primary border border-border-color rounded px-1.5 py-0.5 text-text-primary outline-none"
                    >
                      <option value={3}>3 per page</option>
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                    </select>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded bg-bg-tertiary border border-border-color hover:text-accent disabled:opacity-40"
                      >
                        <ChevronLeft size={12} />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded bg-bg-tertiary border border-border-color hover:text-accent disabled:opacity-40"
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suspect Identification Sidebar Panel */}
            <div className="w-full md:w-64 glass-panel p-5 border-border-color flex flex-col h-full shrink-0 overflow-y-auto">
              <div className="flex items-center border-b border-border-color pb-3 mb-3.5 gap-1.5">
                <User className="text-accent w-4 h-4" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-outfit">AI-Flagged Suspects</h3>
              </div>

              <div className="flex-1 flex flex-col gap-3.5">
                {suspects.length > 0 ? (
                  suspects.map(s => (
                    <div key={s.id} className="p-3 bg-bg-primary rounded-lg border border-border-color flex flex-col gap-1.5 hover:border-accent transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-text-primary">{s.name}</h4>
                          <span className="text-[9px] text-text-muted">Alias: {s.alias}</span>
                        </div>
                        <span className="badge badge-danger text-[8px] px-1 py-0.5 rounded font-mono">
                          Risk: {s.riskScore}%
                        </span>
                      </div>
                      <div className="text-[10px] text-text-secondary">
                        Status: <span className="font-semibold text-accent">{s.status}</span>
                      </div>
                      <p className="p-2 bg-bg-tertiary rounded text-[9px] text-text-secondary leading-relaxed border border-border-color/30">
                        <strong className="text-text-primary block font-semibold mb-0.5">Modus Operandi:</strong>
                        {s.mo}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-muted text-xs gap-2 py-10">
                    <AlertCircle className="w-8 h-8 text-border-color" />
                    <span>No suspected offenders matched.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 border-border-color flex-1 flex flex-col items-center justify-center text-center text-text-muted">
            <FileSearch className="w-12 h-12 mb-3 text-border-color" />
            <h3 className="text-base font-bold text-text-primary mb-1">Incident Similarity Finder</h3>
            <p className="text-xs max-w-sm text-text-secondary leading-relaxed">Provide complaint details in the Narrative Scanner panel and execute scanning to match records in the SCRB state database index.</p>
          </div>
        )}
      </div>
    </div>
  );
};
