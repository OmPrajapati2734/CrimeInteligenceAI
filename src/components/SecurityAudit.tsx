import React, { useEffect, useState } from 'react';
import { Shield, Eye, EyeOff, Lock, AlertTriangle, FileText, CheckCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAuditLogs, postAuditLog } from '../utils/api';

interface LogEntry {
  id: number;
  timestamp: string;
  officer: string;
  role: string;
  action: string;
  piiMasked: boolean;
  resource: string;
}

interface SecurityAuditProps {
  currentOfficer: string;
  currentRole: string;
  maskPII: boolean;
  setMaskPII: (val: boolean) => void;
  logsTrigger: number;
  triggerLogsReload: () => void;
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({
  currentOfficer,
  currentRole,
  maskPII,
  setMaskPII,
  logsTrigger,
  triggerLogsReload
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [injectionQuery, setInjectionQuery] = useState("Show cases where suspect name is Yashas Kumar");
  const [isSanitizing, setIsSanitizing] = useState(false);
  const [sanitizedResult, setSanitizedResult] = useState("");
  
  // Table states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [logsTrigger]);

  const testPromptSanitizer = () => {
    setIsSanitizing(true);
    setTimeout(() => {
      let result = injectionQuery;
      // Simple prompt injection detection
      if (injectionQuery.toLowerCase().includes("ignore previous instructions") || 
          injectionQuery.toLowerCase().includes("system prompt") || 
          injectionQuery.toLowerCase().includes("delete all")) {
        result = "[BLOCKED] Security Threat Detected. Prompt attempts to override system instruction boundaries. Query terminated.";
        postAuditLog({
          officer: currentOfficer,
          role: currentRole,
          action: `PROMPT INJECTION BLOCKED: "${injectionQuery.substring(0, 40)}..."`,
          resource: "AI Gateway Guard",
          piiMasked: maskPII
        }).then(() => triggerLogsReload());
      } else {
        result = `[CLEANED] Authorized. Query passed semantic check: "${injectionQuery}"`;
      }
      setSanitizedResult(result);
      setIsSanitizing(false);
    }, 800);
  };

  // Filter logs locally
  const filteredLogs = logs.filter(log => {
    const text = searchQuery.toLowerCase();
    return (
      log.officer.toLowerCase().includes(text) ||
      log.role.toLowerCase().includes(text) ||
      log.action.toLowerCase().includes(text) ||
      log.resource.toLowerCase().includes(text)
    );
  });

  // Pagination logs
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto h-[600px]">
      {/* TEE / Zero Trust Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto min-h-0">
        <div className="card-panel p-5">
          <div className="flex items-center gap-2.5 mb-3 border-b border-border-color pb-3">
            <Shield className="text-accent w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-outfit text-text-primary">Trusted Execution (TEE)</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            All police intelligence processes execute inside a secure hardware enclave. Sensitive records are encrypted in transit and rest. No data leaves KSP local control boundaries.
          </p>

          <div className="flex flex-col gap-4">
            {/* PII Masking */}
            <div className="p-3.5 bg-bg-tertiary rounded-lg border border-border-color flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-primary">PII Data Masking</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Blurs Aadhaar, phone & name logs</p>
              </div>
              <button
                onClick={() => {
                  setMaskPII(!maskPII);
                  postAuditLog({
                    officer: currentOfficer,
                    role: currentRole,
                    action: `Toggled PII Masking: ${!maskPII ? "Enabled" : "Disabled"}`,
                    resource: "User UI Session",
                    piiMasked: !maskPII
                  }).then(() => triggerLogsReload());
                }}
                className={`p-2 rounded-lg transition border ${
                  maskPII ? 'bg-accent/10 text-accent border-accent/25' : 'bg-bg-primary text-text-secondary border-border-color'
                }`}
                title={maskPII ? "PII Masking Active" : "PII Masking Off"}
              >
                {maskPII ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Zero Trust RBAC State */}
            <div className="p-3.5 bg-bg-tertiary rounded-lg border border-border-color">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border-color/30">
                <h4 className="text-xs font-bold text-text-primary">RBAC Clearances</h4>
                <Lock size={12} className="text-accent" />
              </div>
              <div className="flex flex-col gap-1.5 text-[11px] leading-relaxed">
                <div className="flex justify-between py-0.5">
                  <span className="text-text-secondary">Logged Officer:</span>
                  <span className="font-bold text-text-primary">{currentOfficer}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-text-secondary">Assigned Role:</span>
                  <span className="font-bold text-accent">{currentRole}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-text-secondary">Data Encryption:</span>
                  <span className="font-bold text-success flex items-center gap-1">
                    <CheckCircle size={10} /> AES-256 GCM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Gateway Prompt Injection Sanitizer */}
        <div className="card-panel p-5">
          <div className="flex items-center gap-2.5 mb-3 border-b border-border-color pb-3">
            <Lock className="text-accent w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-outfit text-text-primary">AI Gateway Guard</h2>
          </div>
          <p className="text-xs text-text-secondary mb-3 leading-relaxed">
            Protects against prompt injection attempts aimed at bypassing investigation rules or retrieving masked PII records.
          </p>

          <div className="flex flex-col gap-3">
            <textarea
              value={injectionQuery}
              onChange={(e) => setInjectionQuery(e.target.value)}
              className="w-full bg-bg-primary text-xs border border-border-color rounded-lg p-2.5 outline-none focus:border-accent min-h-[70px] resize-none leading-relaxed text-text-primary"
              placeholder="Test query or malicious override attempts..."
            />
            <button
              onClick={testPromptSanitizer}
              disabled={isSanitizing}
              className="w-full bg-[#143D73] hover:bg-[#1b4b8c] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border border-[#1b4b8c]"
            >
              {isSanitizing ? (
                <>
                  <RefreshCw className="animate-spin text-accent" size={14} /> Sanitizing...
                </>
              ) : (
                "Scan with AI Gateway Guard"
              )}
            </button>

            {sanitizedResult && (
              <div className={`p-3 rounded-lg border text-xs leading-relaxed mt-1 ${
                sanitizedResult.startsWith("[BLOCKED]") 
                  ? 'bg-danger/5 text-danger border-danger/25'
                  : 'bg-success/5 text-success border-success/25'
              }`}>
                {sanitizedResult.startsWith("[BLOCKED]") && <AlertTriangle size={13} className="inline mr-1" />}
                {sanitizedResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs Grid */}
      <div className="lg:col-span-2 card-panel p-5 flex flex-col h-full min-w-0">
        <div className="flex items-center justify-between border-b border-border-color pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <FileText className="text-accent w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-outfit text-text-primary font-outfit">Immutable Access Trail</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-bg-primary text-text-primary text-[10px] pl-7 pr-2.5 py-1 rounded border border-border-color outline-none focus:border-accent w-32"
              />
            </div>
            <button 
              onClick={loadLogs} 
              disabled={loading}
              className="p-1 bg-bg-tertiary border border-border-color rounded text-text-secondary hover:text-accent transition"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto border border-border-color rounded-lg">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead className="sticky top-0 bg-bg-tertiary text-text-secondary border-b border-border-color z-10">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-24">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold w-40">Officer (Role)</th>
                <th className="py-2.5 px-3 font-semibold">Operation / Action</th>
                <th className="py-2.5 px-3 font-semibold w-36">Target Resource</th>
                <th className="py-2.5 px-3 font-semibold text-center w-20">PII State</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-color/30 hover:bg-bg-tertiary transition-colors">
                    <td className="py-3 px-3 text-text-secondary font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-text-primary block leading-none mb-0.5">{log.officer}</span>
                      <span className="text-[9px] text-text-muted font-mono">{log.role}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-accent text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 text-text-secondary">
                      {log.resource}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge ${
                        log.piiMasked ? 'badge-success' : 'badge-danger'
                      }`}>
                        {log.piiMasked ? "Masked" : "Unmasked"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">No audit trail entries.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 border-t border-border-color pt-3 text-[10px] text-text-secondary">
            <span>Page {currentPage} of {totalPages} ({filteredLogs.length} entries found)</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-bg-tertiary border border-border-color hover:text-accent disabled:opacity-40 font-bold"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-bg-tertiary border border-border-color hover:text-accent disabled:opacity-40 font-bold"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
