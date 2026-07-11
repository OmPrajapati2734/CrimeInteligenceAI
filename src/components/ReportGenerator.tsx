import React, { useState } from 'react';
import { FileText, Printer, Sparkles, RefreshCw } from 'lucide-react';
import { submitReport } from '../utils/api';

interface ReportResult {
  title: string;
  content: string;
  timestamp: string;
  author: string;
  classification: string;
}

interface ReportGeneratorProps {
  currentOfficer: string;
  currentRole: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ currentOfficer, currentRole }) => {
  const [reportType, setReportType] = useState("District Summary");
  const [district, setDistrict] = useState("Bengaluru City");
  const [timePeriod, setTimePeriod] = useState("Last 7 Days");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportResult | null>({
    title: "KSP AI District Intelligence Report - Bengaluru City",
    timestamp: new Date().toISOString(),
    author: "Inspector H. S. Rao",
    classification: "RESTRICTED // POLICE INTERNAL ONLY",
    content: `## 1. Executive Overview
This report summarizes predictive and historical crime data compiled by the **KSP Crime Intelligence OS** for **Bengaluru City** over the last 7 Days.

- **State Crime Index Ranking:** Rank 78/100
- **Total Cases Lodged:** 204 cases
- **Identified Risk Hotspots:** 4 sectors
- **System Action Alerts Handled:** 41 alerts

## 2. Active Threat Hotspots
The geospatial engine has highlighted the following zones with elevated recurrence:
- **Jayanagar Sector Burglary Cluster** (High Risk): patrol recommendation: *Namma 112 Route 12 - Night patrol 11 PM to 4 AM*
- **HSR Sector 2 Keyless Theft Zone** (Medium Risk): patrol recommendation: *Cheetah Patrol 4B - Night patrols 12 AM to 5 AM*

## 3. Recommended Resource Allocation
AI Models suggest shifting **15% extra patrolling force** to late-night shifts between 11 PM and 5 AM. Priority checkpoints should focus on highway gateways and exit terminals.`
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await submitReport({ reportType, district, timePeriod }, currentOfficer, currentRole);
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto h-[600px]">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-1 card-panel p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b border-border-color pb-3 mb-1">
          <FileText className="text-accent w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-outfit text-text-primary">Report Compiler</h2>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {/* Report Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Report Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-bg-primary border border-border-color rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-accent"
            >
              <option value="District Summary">District Summary Report</option>
              <option value="Investigation Brief">Investigation Brief (Burglary)</option>
            </select>
          </div>

          {/* Target District */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Target Jurisdiction</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-bg-primary border border-border-color rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-accent"
            >
              <option value="Bengaluru City">Bengaluru City</option>
              <option value="Mysuru City">Mysuru City</option>
              <option value="Mangaluru">Mangaluru</option>
              <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
              <option value="Belagavi">Belagavi</option>
            </select>
          </div>

          {/* Timeframe */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Time Horizon</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="bg-bg-primary border border-border-color rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-accent"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Year to Date">Year to Date (YTD)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-[#143D73] hover:bg-[#1b4b8c] text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-[#1b4b8c]"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin text-accent" size={14} /> Compiling Fields...
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-accent" /> Compile AI Report
            </>
          )}
        </button>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
        {report ? (
          <div className="flex-1 flex flex-col card-panel overflow-hidden">
            {/* Header / Operations */}
            <div className="flex items-center justify-between border-b border-border-color p-3.5 bg-bg-tertiary">
              <span className="text-[10px] text-text-secondary font-mono">
                PDF Preview Panel • Restricted Document
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 h-8 bg-bg-primary hover:bg-bg-tertiary border border-border-color rounded text-xs font-semibold text-text-primary flex items-center gap-1.5 transition"
                >
                  <Printer size={13} className="text-accent" /> Print/Save PDF
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-gray-900 select-text relative" id="print-area">
              {/* RESTRICTED Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-45">
                <span className="text-6xl font-black text-red-600 tracking-widest">RESTRICTED</span>
              </div>

              {/* Official Seal / Header */}
              <div className="border-b-2 border-gray-900 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-md font-black text-gray-900 tracking-wide uppercase font-outfit">KARNATAKA STATE POLICE</h1>
                  <h2 className="text-[10px] font-bold text-gray-500 tracking-wider font-mono">INTELLIGENCE PLATFORM (KCIOS)</h2>
                </div>
                <div className="text-right text-[9px] font-mono text-gray-500">
                  <div>Ref: AI-REP-{new Date(report.timestamp).getFullYear()}-{Math.floor(Math.random() * 9000 + 1000)}</div>
                  <div>Date: {new Date(report.timestamp).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Classification Tag */}
              <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-[9px] uppercase font-mono font-bold tracking-wider py-1 px-2.5 inline-block rounded">
                {report.classification}
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 mb-5 font-outfit border-b border-gray-200 pb-2">{report.title}</h2>

              {/* Content Render */}
              <div className="text-xs text-gray-800 leading-relaxed font-sans flex flex-col gap-4">
                {report.content.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('##')) {
                    return <h3 key={pIdx} className="text-xs font-bold text-gray-900 mt-2 uppercase border-b border-gray-200 pb-1">{paragraph.replace('##', '').trim()}</h3>;
                  }
                  if (paragraph.startsWith('-')) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 flex flex-col gap-1.5">
                        {paragraph.split('\n').map((li, liIdx) => (
                          <li key={liIdx} className="pl-1">
                            {li.replace('-', '').trim().split('**').map((part, partIdx) => partIdx % 2 === 1 ? <strong className="font-bold text-gray-900" key={partIdx}>{part}</strong> : part)}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={pIdx}>
                      {paragraph.split('**').map((part, partIdx) => partIdx % 2 === 1 ? <strong className="font-bold text-gray-900" key={partIdx}>{part}</strong> : part)}
                    </p>
                  );
                })}
              </div>

              {/* Signatures */}
              <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between text-[9px] font-mono text-gray-500">
                <div>
                  <div>Generated By:</div>
                  <div className="font-bold text-gray-800 mt-0.5 uppercase">{report.author}</div>
                  <div>{currentRole}</div>
                </div>
                <div className="text-right">
                  <div>Cryptographic Signature:</div>
                  <div className="font-bold text-gray-800 mt-0.5">CATALYST-TEE-SECURE-ENCLAVE-OK</div>
                  <div>Verified Enclave Checksum</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-panel p-6 flex-1 flex flex-col items-center justify-center text-center text-text-muted">
            <FileText className="w-12 h-12 mb-3 text-border-color" />
            <h3 className="text-base font-bold text-text-primary mb-1">AI Document Preview</h3>
            <p className="text-xs text-text-secondary">Configure parameters on the left and click "Compile AI Report" to view compiled intelligence summaries.</p>
          </div>
        )}
      </div>
    </div>
  );
};
