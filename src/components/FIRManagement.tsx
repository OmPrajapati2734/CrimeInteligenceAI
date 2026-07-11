import React, { useState, useEffect } from 'react';
import { FileText, Search, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, MapPin, User, RefreshCw } from 'lucide-react';
import { fetchCases, fetchCrimeTypes } from '../utils/api';

interface FIRCase {
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

interface FIRManagementProps {
  initialFilter?: string;
}

export const FIRManagement: React.FC<FIRManagementProps> = ({ initialFilter }) => {
  const [cases, setCases] = useState<FIRCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<FIRCase | null>(null);

  // Table states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [districtFilter] = useState("All");
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  
  const [sortField, setSortField] = useState<keyof FIRCase | "">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases();
      setCases(data);
      if (data.length > 0) {
        setSelectedCase(data[0]);
      }
      const types = await fetchCrimeTypes();
      setCrimeTypes(types);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  // Sync dashboard filters
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter === "Active") {
        setStatusFilter("Active"); // Custom handling below for Open + Under Investigation
      } else if (initialFilter === "Under Investigation") {
        setStatusFilter("Under Investigation");
      }
      setCurrentPage(1);
    }
  }, [initialFilter]);

  // Filtering cases
  const filteredCases = cases.filter(c => {
    const text = searchQuery.toLowerCase();
    const matchesSearch = 
      c.id.toLowerCase().includes(text) ||
      c.title.toLowerCase().includes(text) ||
      c.description.toLowerCase().includes(text) ||
      c.io.toLowerCase().includes(text) ||
      c.station.toLowerCase().includes(text);

    let matchesStatus = true;
    if (statusFilter === "Active") {
      // Active = Under Investigation or Open
      matchesStatus = c.status === "Under Investigation" || c.status === "Open";
    } else if (statusFilter !== "All") {
      matchesStatus = c.status === statusFilter;
    }

    const matchesType = typeFilter === "All" || c.crimeType === typeFilter;
    const matchesDistrict = districtFilter === "All" || c.district === districtFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDistrict;
  });

  // Sorting cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (Array.isArray(aVal) || Array.isArray(bVal)) return 0;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination cases
  const totalPages = Math.ceil(sortedCases.length / pageSize);
  const paginatedCases = sortedCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof FIRCase) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Under Investigation':
        return 'badge-warning';
      case 'Open':
        return 'badge-info';
      case 'Arrest Made':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 max-w-7xl mx-auto h-[600px] min-h-0">
      {/* Cases List Table (Resizable grid) */}
      <div className="flex-1 card-panel p-5 flex flex-col min-h-0 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-color pb-3 mb-4">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
            <FileText size={15} /> FIR Case Registry
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
              <input
                type="text"
                placeholder="Global search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-bg-primary text-text-primary text-[10px] pl-7 pr-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent w-36"
              />
            </div>

            {/* Filter controls */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-bg-primary text-text-primary text-[10px] px-2 py-1.5 rounded border border-border-color outline-none focus:border-accent"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Cases</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Open">Open</option>
              <option value="Arrest Made">Arrest Made</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-bg-primary text-text-primary text-[10px] px-2 py-1.5 rounded border border-border-color outline-none focus:border-accent"
            >
              <option value="All">All Crime Types</option>
              {crimeTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="flex-1 overflow-auto border border-border-color rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-muted text-xs gap-2">
              <RefreshCw className="animate-spin text-accent" size={14} /> Loading case files...
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse relative">
              <thead className="sticky top-0 bg-bg-tertiary text-text-secondary border-b border-border-color z-10 font-bold">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-24 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('id')}>
                    Case ID <ArrowUpDown size={10} className="inline ml-0.5" />
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Incident Details</th>
                  <th className="py-2.5 px-3 font-semibold w-28 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('crimeType')}>
                    Type <ArrowUpDown size={10} className="inline ml-0.5" />
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center w-24 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('status')}>
                    Status <ArrowUpDown size={10} className="inline ml-0.5" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCases.length > 0 ? (
                  paginatedCases.map(c => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedCase(c)}
                      className={`border-b border-border-color/30 hover:bg-bg-tertiary transition-colors cursor-pointer ${
                        selectedCase?.id === c.id ? 'bg-primary-light border-l-2 border-accent' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-accent align-top">{c.id}</td>
                      <td className="py-3 px-3 align-top">
                        <h4 className="font-bold text-text-primary mb-1">{c.title}</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-1 mb-1">{c.description}</p>
                        <div className="flex gap-2 text-[9px] text-text-muted font-mono">
                          <span>STN: {c.station}</span>
                          <span>•</span>
                          <span>DATE: {new Date(c.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top font-semibold text-text-secondary">{c.crimeType}</td>
                      <td className="py-3 px-3 text-center align-top">
                        <span className={`badge ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted">No case files matched.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 border-t border-border-color pt-3 text-[10px] text-text-secondary">
            <span>Page {currentPage} of {totalPages} ({filteredCases.length} records found)</span>
            <div className="flex items-center gap-1.5">
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
        )}
      </div>

      {/* Case Details Drawer Panel (Drilldown Detail) */}
      <div className="w-full xl:w-96 card-panel p-5 flex flex-col h-full overflow-y-auto shrink-0">
        {selectedCase ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <span className={`badge ${getStatusBadge(selectedCase.status)}`}>
                {selectedCase.status}
              </span>
              <span className="text-[10px] text-text-muted font-mono font-bold">{selectedCase.id}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-primary font-outfit mb-1">{selectedCase.title}</h3>
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <Calendar size={11} /> {new Date(selectedCase.date).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-xs border-y border-border-color py-3 my-1">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="flex items-center gap-1"><MapPin size={11} /> Station District:</span>
                <span className="font-bold text-text-primary">{selectedCase.district} ({selectedCase.station})</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span className="flex items-center gap-1"><User size={11} /> Investigating Officer:</span>
                <span className="font-bold text-text-primary">{selectedCase.io}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Crime Category:</span>
                <span className="font-bold text-accent">{selectedCase.crimeType}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary font-outfit">Incident Narrative</h4>
              <p className="p-2.5 bg-bg-tertiary rounded text-[10px] text-text-secondary leading-relaxed border border-border-color/30">
                {selectedCase.description}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary font-outfit">Modus Operandi (MO) Method</h4>
              <p className="p-2.5 bg-bg-tertiary rounded text-[10px] text-text-secondary leading-relaxed border border-border-color/30 font-mono">
                {selectedCase.mo}
              </p>
            </div>

            {selectedCase.evidence.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary font-outfit">Evidence Tagged</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCase.evidence.map((ev, i) => (
                    <span key={i} className="text-[9px] bg-bg-tertiary text-text-secondary border border-border-color px-2 py-0.5 rounded font-mono">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-20">
            <FileText className="w-10 h-10 mb-2 text-border-color animate-pulse" />
            <p className="text-xs">Select an FIR case file from the table registry to view complete secure logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};
