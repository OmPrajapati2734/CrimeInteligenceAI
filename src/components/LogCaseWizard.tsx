import React, { useState, useEffect } from 'react';
import { FilePlus2, CheckCircle2, ChevronRight, AlertCircle, Save, Trash2, ArrowLeft, Plus, X } from 'lucide-react';
import { fetchCrimeTypes, addCrimeType } from '../utils/api';

interface WizardData {
  title: string;
  date: string;
  district: string;
  station: string;
  crimeType: string;
  description: string;
  mo: string;
  connectedVehicles: string;
  suspectAlias: string;
  evidence: string;
}

const initialData: WizardData = {
  title: '',
  date: new Date().toISOString().substring(0, 16),
  district: 'Bengaluru City',
  station: '',
  crimeType: 'Burglary',
  description: '',
  mo: '',
  connectedVehicles: '',
  suspectAlias: '',
  evidence: '',
};

interface LogCaseWizardProps {
  onSuccess: (newCase: any) => void;
  showNotification: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const LogCaseWizard: React.FC<LogCaseWizardProps> = ({ onSuccess, showNotification }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardData>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [lastSaved, setLastSaved] = useState<string>('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Dynamic crime types
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState('');
  const [showAddTypeInput, setShowAddTypeInput] = useState(false);

  const loadTypes = async () => {
    try {
      const types = await fetchCrimeTypes();
      setCrimeTypes(types);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewType = async () => {
    if (!newType.trim()) return;
    try {
      const updatedTypes = await addCrimeType(newType.trim());
      setCrimeTypes(updatedTypes);
      setFormData(prev => ({ ...prev, crimeType: newType.trim() }));
      setNewType('');
      setShowAddTypeInput(false);
      showNotification(`Crime classification type "${newType.trim()}" added.`, 'success');
    } catch (e) {
      console.error(e);
      showNotification("Failed to add crime classification type.", 'danger');
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  // Load autosaved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('ksp_case_wizard_autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        const time = localStorage.getItem('ksp_case_wizard_autosave_time') || '';
        setLastSaved(time);
      } catch (e) {
        console.error('Failed to parse autosave data', e);
      }
    }
  }, []);

  // Autosave when form data changes
  const saveToLocal = (data: WizardData) => {
    localStorage.setItem('ksp_case_wizard_autosave', JSON.stringify(data));
    const now = new Date().toLocaleTimeString();
    localStorage.setItem('ksp_case_wizard_autosave_time', now);
    setLastSaved(now);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    saveToLocal(updated);
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Case Title is required.';
      if (!formData.station.trim()) newErrors.station = 'Police Station name is required.';
    } else if (currentStep === 2) {
      if (!formData.description.trim() || formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters long.';
      }
      if (!formData.mo.trim() || formData.mo.length < 10) {
        newErrors.mo = 'Modus Operandi details must be at least 10 characters long.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      showNotification('Please correct validation errors before moving ahead.', 'warning');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleReset = () => {
    setShowConfirmReset(true);
  };

  const confirmResetAction = () => {
    setFormData(initialData);
    localStorage.removeItem('ksp_case_wizard_autosave');
    localStorage.removeItem('ksp_case_wizard_autosave_time');
    setLastSaved('');
    setStep(1);
    setErrors({});
    setShowConfirmReset(false);
    showNotification('Wizard form cleared.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    // Create a mock FIR record format
    const newCase = {
      id: `FIR-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title: formData.title,
      date: new Date(formData.date).toISOString(),
      district: formData.district,
      station: formData.station,
      crimeType: formData.crimeType,
      status: 'Under Investigation',
      io: 'Inspector H. S. Rao',
      description: formData.description,
      mo: formData.mo,
      suspects: formData.suspectAlias ? [`CRIM-${Math.floor(Math.random() * 9000 + 1000)}`] : [],
      connectedVehicles: formData.connectedVehicles ? formData.connectedVehicles.split(',').map(s => s.trim()) : [],
      evidence: formData.evidence ? formData.evidence.split(',').map(s => s.trim()) : [],
    };

    onSuccess(newCase);

    // Clear autosave
    localStorage.removeItem('ksp_case_wizard_autosave');
    localStorage.removeItem('ksp_case_wizard_autosave_time');
    setFormData(initialData);
    setLastSaved('');
    setStep(1);
    
    showNotification(`New case file ${newCase.id} successfully registered in secure ledger.`, 'success');
  };

  const stepProgress = (step / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Breadcrumb Navigation & Autosave Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b border-border-color pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-1" aria-label="Breadcrumb">
            <span className="font-semibold text-text-secondary">KCIOS OS</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-text-secondary">Operations</span>
            <ChevronRight size={12} />
            <span className="text-text-primary font-medium">Secure Incident Entry Wizard</span>
          </nav>
          <h2 className="text-xl font-bold font-outfit text-text-primary flex items-center gap-2">
            <FilePlus2 className="text-accent" size={20} />
            New secure Incident log
          </h2>
        </div>

        {lastSaved && (
          <div className="flex items-center gap-1.5 bg-primary-light border border-primary/20 px-2.5 py-1 rounded text-[10px] text-text-secondary font-mono self-start sm:self-center">
            <Save size={12} className="text-success animate-pulse" />
            <span>Draft autosaved at {lastSaved}</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2 font-mono">
          <span>STEP {step} OF 3: {step === 1 ? 'General Details' : step === 2 ? 'Modus Operandi & Narrative' : 'Evidence & Suspects'}</span>
          <span>{Math.round(stepProgress)}% Complete</span>
        </div>
        <div className="w-full bg-bg-tertiary h-2 rounded-full overflow-hidden border border-border-color">
          <div 
            className="h-full bg-accent transition-all duration-300 ease-out" 
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="card-panel p-6 mb-6">
        <form onSubmit={handleSubmit} noValidate>
          {/* STEP 1: GENERAL METADATA */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider font-outfit mb-2">Step 1: General Incident Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                    Case / FIR Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`bg-bg-primary text-text-primary text-xs border rounded-lg p-2.5 outline-none transition focus:border-accent ${
                      errors.title ? 'border-danger' : 'border-border-color'
                    }`}
                    placeholder="e.g. Daylight Burglary at Jayanagar Block 4 Residence"
                    required
                  />
                  {errors.title && <span className="text-[10px] text-danger font-semibold flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {errors.title}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Incident Date & Time <span className="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-secondary">Crime Classification Type <span className="text-danger">*</span></label>
                    <button
                      type="button"
                      onClick={() => setShowAddTypeInput(!showAddTypeInput)}
                      className="text-[10px] text-accent hover:text-accent/80 font-bold flex items-center gap-0.5"
                    >
                      {showAddTypeInput ? <X size={10} /> : <Plus size={10} />}
                      {showAddTypeInput ? 'Cancel' : 'Add Custom Type'}
                    </button>
                  </div>
                  
                  {showAddTypeInput ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Enter new crime type..."
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2 flex-1 outline-none focus:border-accent font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewType}
                        className="px-3 bg-[#143D73] text-white rounded-lg text-xs font-bold hover:bg-[#1b4b8c] transition flex items-center justify-center gap-1 border border-[#1b4b8c]"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  ) : (
                    <select
                      name="crimeType"
                      value={formData.crimeType}
                      onChange={handleChange}
                      className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent"
                    >
                      {crimeTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Jurisdiction District <span className="text-danger">*</span></label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent"
                  >
                    <option value="Bengaluru City">Bengaluru City</option>
                    <option value="Mysuru City">Mysuru City</option>
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                    <option value="Belagavi">Belagavi</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                    Police Station <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    className={`bg-bg-primary text-text-primary text-xs border rounded-lg p-2.5 outline-none transition focus:border-accent ${
                      errors.station ? 'border-danger' : 'border-border-color'
                    }`}
                    placeholder="e.g. Jayanagar PS"
                    required
                  />
                  {errors.station && <span className="text-[10px] text-danger font-semibold flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {errors.station}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: NARRATIVE & MODUS OPERANDI */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider font-outfit mb-2">Step 2: Modus Operandi & Narrative Description</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary">Case Description / Incident Narrative <span className="text-danger">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`bg-bg-primary text-text-primary text-xs border rounded-lg p-3 outline-none focus:border-accent h-32 resize-none leading-relaxed ${
                    errors.description ? 'border-danger' : 'border-border-color'
                  }`}
                  placeholder="Provide a detailed official statement of the events. Mention timeline, entry/exit vector, stolen property values, and witness feedback..."
                  required
                />
                <span className="text-[10px] text-text-muted">Minimum 10 characters required. Current length: {formData.description.length}</span>
                {errors.description && <span className="text-[10px] text-danger font-semibold flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {errors.description}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary">Modus Operandi (MO) Method Category <span className="text-danger">*</span></label>
                <textarea
                  name="mo"
                  value={formData.mo}
                  onChange={handleChange}
                  className={`bg-bg-primary text-text-primary text-xs border rounded-lg p-3 outline-none focus:border-accent h-24 resize-none leading-relaxed ${
                    errors.mo ? 'border-danger' : 'border-border-color'
                  }`}
                  placeholder="Describe specific criminal method. e.g., Relay cloning key-fobs signal scanner; Laser refraction refraction to bypass CCTV feeds; Retail store SIM swap fraud authorization..."
                  required
                />
                <span className="text-[10px] text-text-muted">Minimum 10 characters required. Current length: {formData.mo.length}</span>
                {errors.mo && <span className="text-[10px] text-danger font-semibold flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {errors.mo}</span>}
              </div>
            </div>
          )}

          {/* STEP 3: EVIDENCE & ASSOCIATE LINKS */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider font-outfit mb-2">Step 3: Secure Evidence Trails & Suspect Connections</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Flagged Getaway Vehicles (Registration Plates)</label>
                  <input
                    type="text"
                    name="connectedVehicles"
                    value={formData.connectedVehicles}
                    onChange={handleChange}
                    className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent"
                    placeholder="e.g. KA-01-MC-4592, KA-02-JH-1102 (comma separated)"
                  />
                  <span className="text-[9px] text-text-muted font-mono">Will link to vehicle database upon ledger entry.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary">Primary Suspect Alias / Name Reference</label>
                  <input
                    type="text"
                    name="suspectAlias"
                    value={formData.suspectAlias}
                    onChange={handleChange}
                    className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent"
                    placeholder="e.g. Yashas 'Silt' Kumar"
                  />
                  <span className="text-[9px] text-text-muted font-mono">Triggers automatically calculated risk link analysis.</span>
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-text-secondary">Physical / Digital Evidence File Tags</label>
                  <input
                    type="text"
                    name="evidence"
                    value={formData.evidence}
                    onChange={handleChange}
                    className="bg-bg-primary text-text-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent"
                    placeholder="e.g. Size 9 sneaker footprints, Residual laser refraction, RF signal scans logs (comma separated)"
                  />
                  <span className="text-[9px] text-text-muted font-mono">Generates audit verification tags on security audit trail logs.</span>
                </div>
              </div>

              {/* Secure Enclave Notice Banner */}
              <div className="p-3.5 bg-primary-light border border-primary/20 rounded-lg text-xs leading-relaxed text-text-secondary flex gap-2.5 items-start mt-2">
                <CheckCircle2 size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-text-primary block mb-0.5">Zoho Catalyst Secure Vault Encryption</span>
                  This incident entry will be serialized, encrypted using AES-256, and appended to the immutable SCRB ledger. All entry telemetry is tracked in the secure TEE logs.
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex justify-between items-center border-t border-border-color pt-5 mt-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-danger border border-border-color rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 size={14} /> Clear Form
              </button>
            </div>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-2.5 px-4 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color rounded-lg text-xs font-semibold text-text-primary flex items-center gap-1.5 transition"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="py-2.5 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition border border-primary-hover shadow-sm"
                >
                  Next Step <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-accent hover:bg-accent-hover text-bg-primary rounded-lg text-xs font-black flex items-center gap-1.5 transition border border-accent-hover shadow-sm"
                >
                  <CheckCircle2 size={14} /> Commit Secure Case file
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-xl max-w-sm w-full p-5 shadow-lg animate-scale-in">
            <h3 className="text-base font-bold font-outfit text-text-primary mb-2 flex items-center gap-1.5">
              <AlertCircle size={18} className="text-danger" /> Clear Case Draft?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-5">
              Are you sure you want to clear this case file draft? All input details will be permanently removed from the local cache storage.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="py-2 px-4 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color rounded-lg text-xs font-semibold text-text-primary transition"
              >
                No, Keep Draft
              </button>
              <button
                onClick={confirmResetAction}
                className="py-2 px-4 bg-danger hover:bg-danger/90 text-white rounded-lg text-xs font-bold transition"
              >
                Yes, Clear Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
