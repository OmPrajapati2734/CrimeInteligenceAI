import React, { useState } from 'react';
import { 
  FilePlus2, Plus, Calendar, Search, 
  UserCheck, UploadCloud, FileText, Sparkles, Users 
} from 'lucide-react';

interface IncidentCase {
  id: string;
  title: string;
  date: string;
  district: string;
  station: string;
  crimeType: string;
  status: 'Pending' | 'Under Investigation' | 'Solved';
  assignedOfficer: string;
  description: string;
  proofDocument?: string;
  resolutionSummary?: string;
}

interface Inspector {
  badgeNo: string;
  name: string;
  station: string;
  rank: string;
}

const initialIncidents: IncidentCase[] = [
  {
    id: "FIR-2026-102",
    title: "Commercial Burglary at Gold Jewellers",
    date: "2026-07-24T22:30",
    district: "Mysuru City",
    station: "Devaraja Station",
    crimeType: "Burglary",
    status: "Under Investigation",
    assignedOfficer: "Inspector H. S. Rao",
    description: "Looting of showcase items. Modus operandi shows window grill cuts."
  },
  {
    id: "FIR-2026-103",
    title: "Chain Snatching Incident Near Park Gate",
    date: "2026-07-25T08:15",
    district: "Bengaluru City",
    station: "Jayanagar Station",
    crimeType: "Snatching",
    status: "Pending",
    assignedOfficer: "Unassigned",
    description: "Suspects on motor vehicle snatched gold chain from victim during morning walk."
  }
];

const initialInspectors: Inspector[] = [
  { badgeNo: "KSP-8820", name: "Inspector H. S. Rao", station: "Jayanagar Station", rank: "Circle Inspector" },
  { badgeNo: "KSP-7711", name: "SP Anant Kumar", station: "Mysuru City HQ", rank: "Superintendent" },
  { badgeNo: "KSP-9910", name: "DSP Kavitha Patil", station: "Bengaluru East", rank: "Deputy Superintendent" }
];

export const LogCaseWizard: React.FC<{
  onSuccess: (newCase: any) => void;
  showNotification: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}> = ({ onSuccess, showNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'list' | 'inspectors'>('create');
  const [incidents, setIncidents] = useState<IncidentCase[]>(initialIncidents);
  const [inspectors, setInspectors] = useState<Inspector[]>(initialInspectors);

  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [district, setDistrict] = useState('Bengaluru City');
  const [station, setStation] = useState('');
  const [crimeType, setCrimeType] = useState('Burglary');
  const [description, setDescription] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('Unassigned');

  // New Inspector Fields
  const [newBadge, setNewBadge] = useState('');
  const [newName, setNewName] = useState('');
  const [newStation, setNewStation] = useState('');
  const [newRank, setNewRank] = useState('Circle Inspector');

  // Dynamic registers
  const [districtsList, setDistrictsList] = useState<string[]>(["Bengaluru City", "Mysuru City", "Hubballi-Dharwad", "Belagavi"]);
  const [crimeTypeList, setCrimeTypeList] = useState<string[]>(["Burglary", "Snatching", "Cyber Fraud", "Assault", "Vehicle Theft"]);

  // Inline Add Popups
  const [showAddDistrict, setShowAddDistrict] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');
  
  const [showAddCrime, setShowAddCrime] = useState(false);
  const [newCrimeName, setNewCrimeName] = useState('');

  // Assign & Solved Modal Settings
  const [selectedIncidentForUpdate, setSelectedIncidentForUpdate] = useState<IncidentCase | null>(null);
  const [updateOfficer, setUpdateOfficer] = useState('Unassigned');
  const [updateStatus, setUpdateStatus] = useState<'Pending' | 'Under Investigation' | 'Solved'>('Pending');
  const [proofFile, setProofFile] = useState<string>('');
  const [resolutionSummary, setResolutionSummary] = useState('');

  const handleCreateDistrict = () => {
    if (!newDistrictName.trim()) return;
    if (districtsList.includes(newDistrictName.trim())) {
      showNotification("District already exists.", "warning");
      return;
    }
    setDistrictsList(prev => [...prev, newDistrictName.trim()]);
    setDistrict(newDistrictName.trim());
    setNewDistrictName('');
    setShowAddDistrict(false);
    showNotification("New jurisdiction district added successfully.", "success");
  };

  const handleCreateCrime = () => {
    if (!newCrimeName.trim()) return;
    if (crimeTypeList.includes(newCrimeName.trim())) {
      showNotification("Crime classification already exists.", "warning");
      return;
    }
    setCrimeTypeList(prev => [...prev, newCrimeName.trim()]);
    setCrimeType(newCrimeName.trim());
    setNewCrimeName('');
    setShowAddCrime(false);
    showNotification("New crime classification head added.", "success");
  };

  const handleAddInspector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadge.trim() || !newName.trim() || !newStation.trim()) {
      showNotification("Please fill in all officer details.", "warning");
      return;
    }

    const newInsp: Inspector = {
      badgeNo: newBadge.trim(),
      name: newName.trim(),
      station: newStation.trim(),
      rank: newRank
    };

    setInspectors(prev => [...prev, newInsp]);
    showNotification(`Officer ${newName} (${newBadge}) registered successfully.`, "success");

    // Reset fields
    setNewBadge('');
    setNewName('');
    setNewStation('');
    setActiveSubTab('create');
  };

  const handleSubmitCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !station.trim() || !description.trim()) {
      showNotification("Please fill in all required fields.", "warning");
      return;
    }

    const newFIRCases: IncidentCase = {
      id: `FIR-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title,
      date,
      district,
      station,
      crimeType,
      status: 'Pending',
      assignedOfficer,
      description
    };

    setIncidents(prev => [newFIRCases, ...prev]);
    onSuccess(newFIRCases);
    showNotification(`New incident ${newFIRCases.id} logged securely.`, "success");

    // Reset Form
    setTitle('');
    setStation('');
    setDescription('');
    setActiveSubTab('list');
  };

  const handleUpdateIncident = () => {
    if (!selectedIncidentForUpdate) return;
    
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncidentForUpdate.id) {
        return {
          ...inc,
          assignedOfficer: updateOfficer,
          status: updateStatus,
          proofDocument: proofFile || inc.proofDocument,
          resolutionSummary: resolutionSummary || inc.resolutionSummary
        };
      }
      return inc;
    }));

    showNotification(`Case assignment details for ${selectedIncidentForUpdate.id} updated.`, "success");
    setSelectedIncidentForUpdate(null);
    setProofFile('');
    setResolutionSummary('');
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.station.toLowerCase().includes(searchQuery.toLowerCase());
    
    const incDate = new Date(inc.date).getTime();
    const startLimit = startDate ? new Date(startDate).getTime() : 0;
    const endLimit = endDate ? new Date(endDate).getTime() : Infinity;

    return matchesSearch && incDate >= startLimit && incDate <= endLimit;
  });

  return (
    <div className="space-y-6">
      {/* Subtab navigation switcher aligned with the overall theme */}
      <div className="flex justify-between items-center bg-bg-secondary p-4 rounded-xl border border-border-color/80">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'create' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Log New Incident
          </button>
          <button 
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'list' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Explore Registered Cases ({incidents.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('inspectors')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'inspectors' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Inspectors Roster ({inspectors.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'create' && (
        <div className="glass-panel border-cyan-500/20 rounded-xl p-6 max-w-2xl mx-auto space-y-6">
          <div className="border-b border-border-color pb-3">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2 font-outfit">
              <FilePlus2 className="text-cyan-400" size={18} />
              Secure Incident Entry Wizard
            </h3>
            <p className="text-[10px] text-text-secondary mt-1">Digitize incident parameters and assign immediately to active duty officers.</p>
          </div>

          <form onSubmit={handleSubmitCase} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Incident Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Commercial robbery at Jayanagar Bank branch"
                className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Police Station *</label>
                <input 
                  type="text" 
                  value={station} 
                  onChange={e => setStation(e.target.value)}
                  placeholder="e.g. Jayanagar Police Station"
                  className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-text-secondary">Jurisdiction District</label>
                  <button 
                    type="button"
                    onClick={() => setShowAddDistrict(true)}
                    className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add New
                  </button>
                </div>
                <select 
                  value={district} 
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                >
                  {districtsList.map(d => (
                    <option key={d} value={d} className="bg-bg-secondary">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-text-secondary">Offence Classification</label>
                  <button 
                    type="button"
                    onClick={() => setShowAddCrime(true)}
                    className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add New
                  </button>
                </div>
                <select 
                  value={crimeType} 
                  onChange={e => setCrimeType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                >
                  {crimeTypeList.map(c => (
                    <option key={c} value={c} className="bg-bg-secondary">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Assign Officer (IO)</label>
              <select 
                value={assignedOfficer} 
                onChange={e => setAssignedOfficer(e.target.value)}
                className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
              >
                <option value="Unassigned" className="bg-bg-secondary">Unassigned</option>
                {inspectors.map(o => (
                  <option key={o.badgeNo} value={o.name} className="bg-bg-secondary">{o.name} ({o.rank})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Description & Modus Operandi *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Details of the crime, entry points, witnesses..."
                className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded h-24 focus:outline-none"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-bg-primary font-bold rounded-lg text-xs transition-all shadow-lg shadow-cyan-600/10"
            >
              Commit Incident to Ledger
            </button>
          </form>

          {/* Inline District Popup Modal */}
          {showAddDistrict && (
            <div className="fixed inset-0 bg-bg-primary/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="glass-panel border-cyan-500/30 bg-bg-secondary rounded-lg p-5 w-80 shadow-2xl space-y-3">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Sparkles className="text-cyan-400 h-3.5 w-3.5" /> Add Jurisdiction District
                </h4>
                <input 
                  type="text" 
                  value={newDistrictName} 
                  onChange={e => setNewDistrictName(e.target.value)}
                  placeholder="e.g. Belagavi District"
                  className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button onClick={() => setShowAddDistrict(false)} className="px-3 py-1.5 text-text-secondary hover:bg-bg-tertiary rounded">Cancel</button>
                  <button onClick={handleCreateDistrict} className="px-3 py-1.5 bg-cyan-600 text-bg-primary font-bold rounded">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Inline Crime Head Popup Modal */}
          {showAddCrime && (
            <div className="fixed inset-0 bg-bg-primary/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="glass-panel border-cyan-500/30 bg-bg-secondary rounded-lg p-5 w-80 shadow-2xl space-y-3">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Sparkles className="text-cyan-400 h-3.5 w-3.5" /> Add Offence Head
                </h4>
                <input 
                  type="text" 
                  value={newCrimeName} 
                  onChange={e => setNewCrimeName(e.target.value)}
                  placeholder="e.g. Cyber Ransomware"
                  className="w-full text-xs p-2.5 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button onClick={() => setShowAddCrime(false)} className="px-3 py-1.5 text-text-secondary hover:bg-bg-tertiary rounded">Cancel</button>
                  <button onClick={handleCreateCrime} className="px-3 py-1.5 bg-cyan-600 text-bg-primary font-bold rounded">Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Panel matching glassmorphic layout */}
          <div className="glass-panel border-cyan-500/20 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-xs flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search registered cases..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-bg-secondary text-text-primary border border-border-color rounded text-xs w-full focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary w-full sm:w-auto">
                <Calendar size={14} className="text-text-muted" />
                <span className="whitespace-nowrap">From:</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-bg-secondary text-text-primary border border-border-color rounded p-1 text-xs w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary w-full sm:w-auto">
                <Calendar size={14} className="text-text-muted" />
                <span className="whitespace-nowrap">To:</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-bg-secondary text-text-primary border border-border-color rounded p-1 text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Cases List grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncidents.map(inc => (
              <div key={inc.id} className="glass-panel border-cyan-500/20 bg-bg-secondary/40 rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge-cyan text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                      {inc.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'Solved' ? 'badge-success' :
                      inc.status === 'Under Investigation' ? 'badge-amber' :
                      'badge-danger'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-text-primary mb-1">{inc.title}</h4>
                  <p className="text-[10px] text-text-muted mb-3 font-mono">Registered: {new Date(inc.date).toLocaleString()}</p>
                  <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">{inc.description}</p>
                </div>

                <div className="border-t border-border-color/40 pt-3 flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-cyan-400" />
                    <span>Assignee: <strong className="text-text-primary">{inc.assignedOfficer}</strong></span>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedIncidentForUpdate(inc);
                      setUpdateOfficer(inc.assignedOfficer);
                      setUpdateStatus(inc.status);
                    }}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    Update Status & Assign
                  </button>
                </div>

                {inc.proofDocument && (
                  <div className="mt-3 p-2 bg-success/5 rounded border border-success/15 text-[10px] text-text-secondary flex items-center gap-2">
                    <FileText size={12} className="text-success" />
                    <span>Proof: <strong>{inc.proofDocument}</strong> - {inc.resolutionSummary}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'inspectors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Inspector Form */}
          <div className="lg:col-span-1 glass-panel border-cyan-500/20 p-5 space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2.5 font-outfit">
              <Users className="text-cyan-400" size={16} /> Register New Officer
            </h3>

            <form onSubmit={handleAddInspector} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary mb-1">Badge Number *</label>
                <input 
                  type="text" 
                  value={newBadge} 
                  onChange={e => setNewBadge(e.target.value)}
                  placeholder="e.g. KSP-1290"
                  className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Inspector Ramesh Gowda"
                  className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary mb-1">Station/HQ Association *</label>
                <input 
                  type="text" 
                  value={newStation} 
                  onChange={e => setNewStation(e.target.value)}
                  placeholder="e.g. Jayanagar Police Station"
                  className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary mb-1">Rank/Designation</label>
                <select 
                  value={newRank} 
                  onChange={e => setNewRank(e.target.value)}
                  className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                >
                  <option value="Circle Inspector" className="bg-bg-secondary">Circle Inspector</option>
                  <option value="Assistant Commissioner" className="bg-bg-secondary">Assistant Commissioner (ACP)</option>
                  <option value="Deputy Superintendent" className="bg-bg-secondary">Deputy Superintendent (DSP)</option>
                  <option value="Superintendent" className="bg-bg-secondary">Superintendent (SP)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-bg-primary font-bold rounded-lg text-xs transition"
              >
                Register & Activate Officer
              </button>
            </form>
          </div>

          {/* Roster List */}
          <div className="lg:col-span-2 space-y-3">
            {inspectors.map(insp => (
              <div key={insp.badgeNo} className="glass-panel border-cyan-500/20 bg-bg-secondary/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{insp.name}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">{insp.rank} • Assigned: {insp.station}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/5 px-2 py-1 rounded border border-cyan-500/10">
                    {insp.badgeNo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Assignment & Solved Workflow Modal */}
      {selectedIncidentForUpdate && (
        <div className="fixed inset-0 bg-bg-primary/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border-cyan-500/30 bg-bg-secondary rounded-lg p-6 w-96 shadow-2xl space-y-4">
            <div>
              <h4 className="text-sm font-bold text-text-primary">Case Update: {selectedIncidentForUpdate.id}</h4>
              <p className="text-xs text-text-secondary mt-0.5">Assign officer, update status, and attach proof documents.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary mb-1">Assign Officer</label>
                <select 
                  value={updateOfficer} 
                  onChange={e => setUpdateOfficer(e.target.value)}
                  className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                >
                  <option value="Unassigned" className="bg-bg-secondary">Unassigned</option>
                  {inspectors.map(o => (
                    <option key={o.badgeNo} value={o.name} className="bg-bg-secondary">{o.name} ({o.rank})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary mb-1">Investigation Status</label>
                <select 
                  value={updateStatus} 
                  onChange={e => setUpdateStatus(e.target.value as any)}
                  className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                >
                  <option value="Pending" className="bg-bg-secondary">Pending</option>
                  <option value="Under Investigation" className="bg-bg-secondary">Under Investigation</option>
                  <option value="Solved" className="bg-bg-secondary">Solved</option>
                </select>
              </div>

              {updateStatus === 'Solved' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary mb-1">Resolution Summary *</label>
                    <input 
                      type="text"
                      value={resolutionSummary}
                      onChange={e => setResolutionSummary(e.target.value)}
                      placeholder="e.g. Stolen gold recovered, suspects arrested"
                      className="w-full text-xs p-2 bg-bg-secondary text-text-primary border border-border-color rounded focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary mb-1">Upload Case Closure Proof</label>
                    <div className="border border-dashed border-border-color rounded p-3 text-center bg-bg-tertiary hover:border-cyan-500/30 transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        onChange={e => setProofFile(e.target.files?.[0]?.name || 'ksp_closure_report.pdf')}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <UploadCloud className="h-6 w-6 text-text-muted mx-auto mb-1" />
                      <span className="text-[10px] text-text-secondary font-bold block">
                        {proofFile ? `Selected: ${proofFile}` : "Click to select closure report"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button 
                onClick={() => setSelectedIncidentForUpdate(null)} 
                className="px-3 py-1.5 text-text-secondary hover:bg-bg-tertiary rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateIncident} 
                className="px-3 py-1.5 bg-cyan-600 text-bg-primary font-bold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
