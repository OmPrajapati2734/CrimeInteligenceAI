import React, { useState } from 'react';
import { 
  FilePlus2, Plus, Calendar, Search, 
  UserCheck, UploadCloud, FileText 
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

export const LogCaseWizard: React.FC<{
  onSuccess: (newCase: any) => void;
  showNotification: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}> = ({ onSuccess, showNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'list'>('create');
  const [incidents, setIncidents] = useState<IncidentCase[]>(initialIncidents);

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

  // Dynamic registers & dynamic inline creators
  const [districtsList, setDistrictsList] = useState<string[]>(["Bengaluru City", "Mysuru City", "Hubballi-Dharwad", "Belagavi"]);
  const [crimeTypeList, setCrimeTypeList] = useState<string[]>(["Burglary", "Snatching", "Cyber Fraud", "Assault", "Vehicle Theft"]);
  const officersList = [
    "Inspector H. S. Rao", "SP Anant Kumar", "DSP Kavitha Patil", "Inspector Ramesh Gowda", "Unassigned"
  ];

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

  // Filtered incidents
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
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all ${
              activeSubTab === 'create' ? 'bg-sky-800 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Log New Incident
          </button>
          <button 
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all ${
              activeSubTab === 'list' ? 'bg-sky-800 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Explore Registered Cases ({incidents.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'create' ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl mx-auto">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FilePlus2 className="text-sky-800" size={18} />
            Secure Incident Entry Wizard
          </h3>

          <form onSubmit={handleSubmitCase} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Incident Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Armed robbery at Jayanagar Bank branch"
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-sky-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Police Station *</label>
                <input 
                  type="text" 
                  value={station} 
                  onChange={e => setStation(e.target.value)}
                  placeholder="e.g. Jayanagar Police Station"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Jurisdiction Selector with dynamic inline adder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-600">Jurisdiction District</label>
                  <button 
                    type="button"
                    onClick={() => setShowAddDistrict(true)}
                    className="text-[10px] text-sky-800 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add New
                  </button>
                </div>
                <select 
                  value={district} 
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none bg-white"
                >
                  {districtsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Crime Type Head with dynamic inline adder */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-600">Offence Classification</label>
                  <button 
                    type="button"
                    onClick={() => setShowAddCrime(true)}
                    className="text-[10px] text-sky-800 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add New
                  </button>
                </div>
                <select 
                  value={crimeType} 
                  onChange={e => setCrimeType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none bg-white"
                >
                  {crimeTypeList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Assign Investigating Officer (IO)</label>
              <select 
                value={assignedOfficer} 
                onChange={e => setAssignedOfficer(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none bg-white"
              >
                {officersList.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Incident Description & Modus Operandi *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Details of the crime, entry points, items stolen, witnesses..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded h-24 focus:outline-none"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded text-xs transition-all"
            >
              Commit Incident to Ledger
            </button>
          </form>

          {/* Inline District Popup Modal */}
          {showAddDistrict && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg border border-slate-200 p-5 w-80 shadow-lg space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Add Jurisdiction District</h4>
                <input 
                  type="text" 
                  value={newDistrictName} 
                  onChange={e => setNewDistrictName(e.target.value)}
                  placeholder="e.g. Belagavi District"
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button onClick={() => setShowAddDistrict(false)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded">Cancel</button>
                  <button onClick={handleCreateDistrict} className="px-3 py-1.5 bg-sky-800 text-white font-semibold rounded">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Inline Crime Head Popup Modal */}
          {showAddCrime && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg border border-slate-200 p-5 w-80 shadow-lg space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Add Offence Classification Head</h4>
                <input 
                  type="text" 
                  value={newCrimeName} 
                  onChange={e => setNewCrimeName(e.target.value)}
                  placeholder="e.g. Cyber Ransomware"
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button onClick={() => setShowAddCrime(false)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded">Cancel</button>
                  <button onClick={handleCreateCrime} className="px-3 py-1.5 bg-sky-800 text-white font-semibold rounded">Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Panel */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-xs flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search registered cases..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded text-xs w-full focus:outline-none focus:border-sky-800"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 w-full sm:w-auto">
                <Calendar size={14} className="text-slate-400" />
                <span className="whitespace-nowrap">From:</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="border border-slate-300 rounded p-1 text-xs w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 w-full sm:w-auto">
                <Calendar size={14} className="text-slate-400" />
                <span className="whitespace-nowrap">To:</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="border border-slate-300 rounded p-1 text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Cases List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncidents.map(inc => (
              <div key={inc.id} className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-sky-800 px-2 py-0.5 bg-sky-50 rounded">
                      {inc.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'Solved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                      inc.status === 'Under Investigation' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                      'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mb-1">{inc.title}</h4>
                  <p className="text-[11px] text-slate-400 mb-3 font-mono">Date: {new Date(inc.date).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">{inc.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-slate-400" />
                    <span>Assignee: <strong className="text-slate-700">{inc.assignedOfficer}</strong></span>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedIncidentForUpdate(inc);
                      setUpdateOfficer(inc.assignedOfficer);
                      setUpdateStatus(inc.status);
                    }}
                    className="text-xs font-bold text-sky-800 hover:underline flex items-center gap-0.5"
                  >
                    Update Status & Assign
                  </button>
                </div>

                {inc.proofDocument && (
                  <div className="mt-3 p-2 bg-emerald-50/50 rounded border border-emerald-100/50 text-[10px] text-emerald-800 flex items-center gap-2">
                    <FileText size={12} />
                    <span>Proof: <strong>{inc.proofDocument}</strong> - {inc.resolutionSummary}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Assignment & Solved Workflow Modal */}
      {selectedIncidentForUpdate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-96 shadow-lg space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Case Update: {selectedIncidentForUpdate.id}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Assign officer, update status, and attach proof documents.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Assign Officer</label>
                <select 
                  value={updateOfficer} 
                  onChange={e => setUpdateOfficer(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none bg-white"
                >
                  {officersList.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Investigation Status</label>
                <select 
                  value={updateStatus} 
                  onChange={e => setUpdateStatus(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Solved">Solved</option>
                </select>
              </div>

              {updateStatus === 'Solved' && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Resolution Summary *</label>
                    <input 
                      type="text"
                      value={resolutionSummary}
                      onChange={e => setResolutionSummary(e.target.value)}
                      placeholder="e.g. Stolen gold recovered, suspects arrested"
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Upload Case Closure Proof (PDF/Image)</label>
                    <div className="border border-dashed border-slate-300 rounded p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        onChange={e => setProofFile(e.target.files?.[0]?.name || 'ksp_closure_report.pdf')}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 font-bold block">
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
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateIncident} 
                className="px-3 py-1.5 bg-sky-800 text-white font-semibold rounded hover:bg-sky-900"
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
