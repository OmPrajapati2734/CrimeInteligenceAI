import React, { useState, useEffect } from 'react';
import { Shield, Search, ArrowUpDown, ChevronLeft, ChevronRight, UserCheck, Clock, MapPin, RefreshCw } from 'lucide-react';
import { fetchPatrols } from '../utils/api';

interface PatrolAssignment {
  id: string;
  officer: string;
  assignment: string;
  gps: string;
  time: string;
  shift: string;
  status: string;
}

export const PatrolManagement: React.FC = () => {
  const [patrols, setPatrols] = useState<PatrolAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatrol, setSelectedPatrol] = useState<PatrolAssignment | null>(null);

  // Table states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof PatrolAssignment | "">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const loadPatrols = async () => {
    setLoading(true);
    try {
      const data = await fetchPatrols();
      setPatrols(data);
      if (data.length > 0) {
        setSelectedPatrol(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatrols();
  }, []);

  // Filter patrols
  const filteredPatrols = patrols.filter(p => {
    const text = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(text) ||
      p.officer.toLowerCase().includes(text) ||
      p.assignment.toLowerCase().includes(text) ||
      p.gps.toLowerCase().includes(text) ||
      p.shift.toLowerCase().includes(text)
    );
  });

  // Sort patrols
  const sortedPatrols = [...filteredPatrols].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination
  const totalPages = Math.ceil(sortedPatrols.length / pageSize);
  const paginatedPatrols = sortedPatrols.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof PatrolAssignment) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 max-w-7xl mx-auto h-[600px] min-h-0">
      {/* Table Panel */}
      <div className="flex-1 card-panel p-5 flex flex-col min-h-0 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-color pb-3 mb-4">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
            <Shield size={15} /> Active Patrol Shift Allocations
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
              <input
                type="text"
                placeholder="Search patrols..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-bg-primary text-text-primary text-[10px] pl-7 pr-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent w-40"
              />
            </div>
            <button 
              onClick={loadPatrols} 
              disabled={loading}
              className="p-1.5 bg-bg-tertiary border border-border-color rounded text-text-secondary hover:text-accent transition"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin text-accent' : ''} />
            </button>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="flex-1 overflow-auto border border-border-color rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-muted text-xs gap-2">
              <RefreshCw className="animate-spin text-accent" size={14} /> Loading shift ledgers...
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse relative">
              <thead className="sticky top-0 bg-bg-tertiary text-text-secondary border-b border-border-color z-10 font-bold">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-24 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('id')}>
                    Patrol ID <ArrowUpDown size={10} className="inline ml-0.5" />
                  </th>
                  <th className="py-2.5 px-3 font-semibold w-40 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('officer')}>
                    Officer Name <ArrowUpDown size={10} className="inline ml-0.5" />
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Duty Assignment</th>
                  <th className="py-2.5 px-3 font-semibold w-28 cursor-pointer select-none hover:text-accent" onClick={() => handleSort('shift')}>
                    Shift <ArrowUpDown size={10} className="inline ml-0.5" />
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatrols.length > 0 ? (
                  paginatedPatrols.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPatrol(p)}
                      className={`border-b border-border-color/30 hover:bg-bg-tertiary transition-colors cursor-pointer ${
                        selectedPatrol?.id === p.id ? 'bg-primary-light border-l-2 border-accent' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-accent">{p.id}</td>
                      <td className="py-3 px-3 font-bold text-text-primary">{p.officer}</td>
                      <td className="py-3 px-3 text-text-secondary">{p.assignment}</td>
                      <td className="py-3 px-3 font-semibold text-text-secondary">{p.shift}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="badge badge-success">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">No patrol logs matched.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 border-t border-border-color pt-3 text-[10px] text-text-secondary">
            <span>Page {currentPage} of {totalPages} ({filteredPatrols.length} shifts active)</span>
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

      {/* Detail panel */}
      <div className="w-full xl:w-96 card-panel p-5 flex flex-col h-full overflow-y-auto shrink-0">
        {selectedPatrol ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <span className="badge badge-success">{selectedPatrol.status}</span>
              <span className="text-[10px] text-text-muted font-mono font-bold">{selectedPatrol.id}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center">
                <UserCheck className="text-accent w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary font-outfit">{selectedPatrol.officer}</h3>
                <span className="text-[10px] text-text-muted">KSP Active Dispatch Force</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs border-y border-border-color py-3 my-1">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="flex items-center gap-1"><MapPin size={11} /> GPS Area:</span>
                <span className="font-bold text-text-primary font-mono">{selectedPatrol.gps}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span className="flex items-center gap-1"><Clock size={11} /> Time Window:</span>
                <span className="font-bold text-text-primary">{selectedPatrol.time}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Shift Type:</span>
                <span className="font-bold text-accent">{selectedPatrol.shift}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary font-outfit">Detailed Assignment</h4>
              <p className="p-2.5 bg-bg-tertiary rounded text-[10px] text-text-secondary leading-relaxed border border-border-color/30">
                The dispatched officer is actively patrolling the {selectedPatrol.assignment} perimeter. Telemetry routes are logged under hardware TEE secure tunnels. No deviation flags raised.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-20">
            <Shield className="w-10 h-10 mb-2 text-border-color animate-pulse" />
            <p className="text-xs">Select a patrol shift log to inspect active GPS coordinates and task status.</p>
          </div>
        )}
      </div>
    </div>
  );
};
