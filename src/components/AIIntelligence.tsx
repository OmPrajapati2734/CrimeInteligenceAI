import React, { useState, useEffect } from 'react';
import { 
  Brain, RefreshCw, Sparkles, Shield, Activity, 
  Check, X, FileText, Download, Star, MessageSquare, 
  UserCheck, Clipboard, Users
} from 'lucide-react';
import { 
  fetchCases, fetchDecisionIntelligence, updateRecommendationStatus, 
  submitFeedback, fetchOutcomeAnalysis 
} from '../utils/api';
import { sanitizeInput } from '../utils/sanitize';

export const AIIntelligence: React.FC = () => {
  const [casesList, setCasesList] = useState<any[]>([]);
  const [selectedFirId, setSelectedFirId] = useState<string>('');
  const [intelligenceData, setIntelligenceData] = useState<any | null>(null);
  const [outcomeData, setOutcomeData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Feedback Form State
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Assign Officer State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeRecId, setActiveRecId] = useState<string>('');
  const [assignedOfficerName, setAssignedOfficerName] = useState('Inspector H. S. Rao');

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportRec, setReportRec] = useState<any | null>(null);

  // Load cases list & initial intelligence
  const initializeEngine = async () => {
    setLoading(true);
    try {
      const casesData = await fetchCases();
      setCasesList(casesData);
      
      const defaultId = casesData.length > 0 ? casesData[0].id : '';
      setSelectedFirId(defaultId);
      
      if (defaultId) {
        await loadFIRIntelligence(defaultId);
      }
      
      await loadOutcomeAnalysis();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFIRIntelligence = async (firId: string) => {
    try {
      const intel = await fetchDecisionIntelligence(firId);
      setIntelligenceData(intel);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOutcomeAnalysis = async () => {
    try {
      const outcomes = await fetchOutcomeAnalysis();
      setOutcomeData(outcomes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    initializeEngine();
  }, []);

  const handleFIRChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedFirId(id);
    setLoading(true);
    await loadFIRIntelligence(id);
    setLoading(false);
  };

  // Recommendation status triggers
  const triggerRecAction = async (recId: string, action: 'accept' | 'reject' | 'complete') => {
    if (!selectedFirId) return;
    try {
      await updateRecommendationStatus(selectedFirId, recId, action);
      await loadFIRIntelligence(selectedFirId);
      await loadOutcomeAnalysis();
    } catch (e) {
      console.error(e);
    }
  };

  const openAssignModal = (recId: string) => {
    setActiveRecId(recId);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFirId || !activeRecId) return;

    try {
      await updateRecommendationStatus(selectedFirId, activeRecId, 'assign', { officer: assignedOfficerName });
      setShowAssignModal(false);
      await loadFIRIntelligence(selectedFirId);
      await loadOutcomeAnalysis();
    } catch (e) {
      console.error(e);
    }
  };

  const openReportModal = (rec: any) => {
    setReportRec(rec);
    setShowReportModal(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFirId) return;

    setSubmitting(true);
    const safeComment = sanitizeInput(comment);
    try {
      await submitFeedback(selectedFirId, rating, safeComment);
      setComment('');
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
      await loadOutcomeAnalysis();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 min-h-0 text-xs">
      
      {/* SELECTION BAR & ANALYTICS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* FIR CASE SELECTOR */}
        <div className="lg:col-span-2 card-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#143D73]/10 border border-[#143D73]/30 flex items-center justify-center">
              <Brain className="text-accent w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase font-outfit text-text-primary leading-none">
                AI Decision Intelligence Engine
              </h2>
              <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1 uppercase">
                Predictive Risk Matrices & Resource Allocator
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-text-secondary font-mono">Select Case:</span>
            <select
              value={selectedFirId}
              onChange={handleFIRChange}
              className="bg-bg-primary text-text-primary font-bold text-xs px-3 py-2 rounded border border-border-color outline-none focus:border-accent cursor-pointer flex-1 md:flex-none"
            >
              {casesList.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.crimeType}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CALIBRATION STATS SUMMARY */}
        {outcomeData && (
          <div className="lg:col-span-2 card-panel p-4 grid grid-cols-3 gap-2 text-center h-full">
            <div>
              <span className="text-[9px] text-text-secondary font-mono block uppercase">Calibrated Accuracy</span>
              <span className="text-lg font-black text-success font-outfit block mt-0.5">91.4%</span>
            </div>
            <div>
              <span className="text-[9px] text-text-secondary font-mono block uppercase">Decisions Deployed</span>
              <span className="text-lg font-black text-accent font-outfit block mt-0.5">{outcomeData.totalDecisions}</span>
            </div>
            <div>
              <span className="text-[9px] text-text-secondary font-mono block uppercase">Implementation Rate</span>
              <span className="text-lg font-black text-warning font-outfit block mt-0.5">
                {Math.round((outcomeData.acceptedCount / outcomeData.totalDecisions) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-text-muted flex flex-col items-center gap-2 justify-center">
          <RefreshCw className="animate-spin text-accent" size={24} />
          <span>Synthesizing decision intelligence heuristics...</span>
        </div>
      ) : intelligenceData ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
          
          {/* LEFT 3 COLUMNS: CRITICAL INTELLIGENCE & RECOMMENDATIONS */}
          <div className="xl:col-span-3 flex flex-col gap-6 min-w-0">
            
            {/* PANEL A: RISK INDICATORS & PROBABILITIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* RADIAL RISK CARD */}
              <div className="card-panel p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-text-secondary font-bold uppercase font-mono block">Threat Risk Score</span>
                  <span className="text-2xl font-black text-danger font-outfit block mt-1 leading-none">{intelligenceData.riskScore}%</span>
                  <span className={`badge ${
                    intelligenceData.severity === 'Critical' ? 'badge-danger animate-pulse' :
                    intelligenceData.severity === 'High' ? 'badge-danger' : 'badge-warning'
                  } mt-2`}>
                    {intelligenceData.severity} Severity
                  </span>
                </div>
                {/* SVG Radial Progress */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      stroke="#ef4444" 
                      strokeWidth="5" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 26} 
                      strokeDashoffset={2 * Math.PI * 26 * (1 - intelligenceData.riskScore / 100)} 
                    />
                  </svg>
                  <Activity className="absolute text-danger w-5 h-5" />
                </div>
              </div>

              {/* MODEL ACCURACY PROBABILITIES */}
              <div className="card-panel p-4 flex flex-col justify-between">
                <span className="text-[10px] text-text-secondary font-bold uppercase font-mono block mb-2">Probability Indexes</span>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Repeat Offender', val: intelligenceData.probabilities.repeatOffender },
                    { label: 'Gang Connection', val: intelligenceData.probabilities.gangConnection },
                    { label: 'Victim Retaliation', val: intelligenceData.probabilities.victimRisk },
                    { label: 'Crime pattern similarity', val: intelligenceData.probabilities.patternSimilarity }
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-text-secondary">{p.label}:</span>
                      <span className="font-bold text-text-primary font-mono">{p.val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FORECAST TRENDS & GEOSPATIAL IMPACT */}
              <div className="card-panel p-4 flex flex-col justify-between">
                <span className="text-[10px] text-text-secondary font-bold uppercase font-mono block mb-2">Spatiotemporal Forecast</span>
                <div className="flex flex-col gap-1.5 text-[11px] text-text-secondary leading-relaxed">
                  <div>
                    <span className="font-bold text-text-primary block">Expected Trend:</span>
                    <span className="text-[10px] leading-tight text-accent block">{intelligenceData.expectations.expectedTrend}</span>
                  </div>
                  <div className="flex justify-between border-t border-border-color/30 pt-1.5 mt-0.5">
                    <span>Hotspot Area Index Impact:</span>
                    <span className="font-bold text-text-primary">{intelligenceData.expectations.hotspotImpact}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* PANEL B: EXPLAINABILITY CONTRIBUTING FACTORS (SHAP VISUALIZATION) */}
            <div className="card-panel p-4">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5 font-outfit">
                <Shield size={14} /> Explainable Risk Heuristic Breakdown (SHAP Factors)
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Burglary Time Vector (Night Hours shift)", weight: 30, direction: "positive" },
                  { label: "Demographic Cluster Density Flag", weight: 25, direction: "positive" },
                  { label: "Active Lakeside Gang Member Matches", weight: 15, direction: "positive" },
                  { label: "Weather Conditions (Rainfall mitigation)", weight: -12, direction: "negative" }
                ].map((factor, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-56 font-semibold text-text-secondary text-[11px] truncate">{factor.label}</span>
                    <div className="flex-1 bg-bg-primary h-2.5 rounded-full overflow-hidden border border-border-color/30 relative">
                      <div 
                        className={`h-full rounded-full ${factor.direction === 'positive' ? 'bg-danger ml-auto' : 'bg-success'}`}
                        style={{ 
                          width: `${Math.abs(factor.weight)}%`,
                          float: factor.direction === 'positive' ? 'left' : 'right' 
                        }}
                      />
                    </div>
                    <span className={`w-12 text-right font-mono font-bold text-[11px] ${factor.direction === 'positive' ? 'text-danger' : 'text-success'}`}>
                      {factor.direction === 'positive' ? `+${factor.weight}%` : `${factor.weight}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL C: ACTIVE RECOMMENDATION HEURISTICS FEED */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                <Sparkles size={14} /> Actionable Decisions & Resources Recommendations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligenceData.recommendations.map((rec: any) => (
                  <div 
                    key={rec.id} 
                    className={`card-panel p-4 flex flex-col gap-2.5 border transition ${
                      rec.status === 'accepted' ? 'border-success/30 bg-success/[0.02]' :
                      rec.status === 'rejected' ? 'border-danger/10 opacity-60 bg-danger/[0.01]' :
                      rec.status === 'completed' ? 'border-accent/30 bg-accent/[0.02]' :
                      'border-border-color hover:border-[#143D73]'
                    }`}
                  >
                    {/* Rec Badge Headers */}
                    <div className="flex items-center justify-between border-b border-border-color/30 pb-2">
                      <span className={`badge ${
                        rec.type === 'patrol' ? 'badge-info' :
                        rec.type === 'officer' ? 'badge-success' : 'badge-warning'
                      } uppercase text-[9px]`}>
                        {rec.type} recommendation
                      </span>
                      <span className="text-[10px] text-success font-extrabold font-mono">{rec.confidence}% confidence</span>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-extrabold text-text-primary text-xs leading-snug">{rec.recommendation}</h4>
                      <p className="text-[10px] text-text-secondary leading-relaxed mt-1.5">
                        <strong>Reason:</strong> {rec.reason}
                      </p>
                      <p className="text-[10px] text-text-secondary leading-relaxed mt-1">
                        <strong>Evidence:</strong> {rec.evidence}
                      </p>
                    </div>

                    {/* Historical Comparison Info */}
                    <div className="bg-bg-primary/50 p-2 rounded text-[9px] text-text-muted font-mono leading-none flex items-center justify-between">
                      <span>Historical Baseline: {rec.historicalComparison}</span>
                    </div>

                    {/* Assigned Officer Status */}
                    {rec.assignedOfficer && (
                      <div className="flex items-center gap-1 text-[10px] text-success font-semibold">
                        <UserCheck size={12} /> Assigned: <span className="text-text-primary">{rec.assignedOfficer}</span>
                      </div>
                    )}

                    {/* Actions Panel */}
                    <div className="flex gap-1.5 mt-auto pt-3 border-t border-border-color/30 flex-wrap">
                      {rec.status === 'pending' && (
                        <>
                          <button
                            onClick={() => triggerRecAction(rec.id, 'accept')}
                            className="flex-1 py-1.5 bg-success/15 border border-success/30 hover:bg-success hover:text-white text-[10px] font-bold text-success rounded transition flex items-center justify-center gap-1"
                          >
                            <Check size={11} /> Accept
                          </button>
                          <button
                            onClick={() => triggerRecAction(rec.id, 'reject')}
                            className="py-1.5 px-3 bg-danger/10 border border-danger/25 hover:bg-danger hover:text-white text-[10px] font-bold text-danger rounded transition flex items-center justify-center gap-1"
                          >
                            <X size={11} /> Reject
                          </button>
                        </>
                      )}

                      {rec.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => triggerRecAction(rec.id, 'complete')}
                            className="flex-1 py-1.5 bg-accent/25 border border-accent/35 hover:bg-accent hover:text-white text-[10px] font-bold text-accent rounded transition flex items-center justify-center gap-1"
                          >
                            <Check size={11} /> Resolve Complete
                          </button>
                        </>
                      )}

                      {rec.status !== 'rejected' && (
                        <button
                          onClick={() => openAssignModal(rec.id)}
                          className="py-1.5 px-2 bg-bg-tertiary border border-border-color hover:text-accent text-[10px] font-semibold rounded transition flex items-center justify-center gap-1"
                          title="Assign Officer Beat"
                        >
                          <UserCheck size={11} /> Assign
                        </button>
                      )}

                      <button
                        onClick={() => openReportModal(rec)}
                        className="py-1.5 px-2 bg-bg-tertiary border border-border-color hover:text-accent text-[10px] font-semibold rounded transition flex items-center justify-center gap-1"
                        title="Generate Briefing Brief"
                      >
                        <Download size={11} /> Brief
                      </button>

                      {rec.status === 'completed' && (
                        <span className="ml-auto badge badge-success flex items-center gap-1">
                          <Check size={9} /> Completed
                        </span>
                      )}
                      {rec.status === 'rejected' && (
                        <span className="ml-auto badge badge-danger">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL D: INVESTIGATION QUESTIONS & SUGGESTED ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QUESTIONS BEATS */}
              <div className="card-panel p-4 flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border-color pb-1.5 flex items-center gap-1.5">
                  <Clipboard size={14} /> AI Suggested Interrogation/Investigation Questions
                </h4>
                <ul className="flex flex-col gap-2 pl-4 list-decimal text-[11px] text-text-secondary leading-relaxed">
                  <li>Verify the suspect's cellular tower overlaps with registered SIM registration IDs on Jayanagar sector logs.</li>
                  <li>Confirm physical location and alibi between the critical timeframe window: 11 PM to 3 AM.</li>
                  <li>Inquire regarding commercial modifications performed on vehicle license KA-01-MC-4592.</li>
                  <li>Audit retail store transaction codes for SIM swap bypass authorization records.</li>
                </ul>
              </div>

              {/* CONTEXTUAL MATCHES & suspects */}
              <div className="card-panel p-4 flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border-color pb-1.5 flex items-center gap-1.5">
                  <Users size={14} /> AI Contextual Association Matches
                </h4>
                <div className="flex flex-col gap-2 text-[11px] text-text-secondary">
                  <div>
                    <span className="font-bold text-text-primary block">Likely Accused Suspects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {intelligenceData.expectations.likelySuspects.map((s: string, idx: number) => (
                        <span key={idx} className="badge badge-danger text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border-color/30 pt-2 mt-1 flex justify-between items-center">
                    <span>Nearby Crimes spatiotemporal cluster:</span>
                    <span className="font-bold text-danger">{intelligenceData.expectations.nearbyCrimesCount} incidents</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Related Precedent FIR Files:</span>
                    <div className="flex gap-1.5">
                      {intelligenceData.expectations.relatedFirs.map((fir: string, idx: number) => (
                        <span key={idx} className="bg-bg-tertiary px-1.5 py-0.5 rounded font-mono font-bold border border-border-color text-[9px]">{fir}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: IMPLEMENTATION TRACKER & ENGINE FEEDBACK LOOP */}
          <div className="xl:col-span-1 flex flex-col gap-6 h-full min-h-0">
            
            {/* MODULE 1: CHECKLIST IMPLEMENTATION PROGRESS */}
            <div className="card-panel p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit border-b border-border-color pb-2">
                <Activity size={14} /> Implementation Checklist
              </h3>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Progress Rate</span>
                  <span className="text-accent font-mono">{intelligenceData.implementation.implementationPercentage}%</span>
                </div>
                <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-color/30 mt-1">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-500" 
                    style={{ width: `${intelligenceData.implementation.implementationPercentage}%` }} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {intelligenceData.implementation.checklist.map((item: any) => (
                  <div key={item.recId} className="flex gap-2.5 items-start p-2 bg-bg-primary rounded border border-border-color/30 text-[10px]">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${
                      item.status === 'completed' ? 'bg-success' :
                      item.status === 'active' ? 'bg-accent' :
                      'bg-bg-tertiary border border-border-color'
                    }`} />
                    <div className="flex-1">
                      <p className="text-text-secondary leading-tight font-semibold">{item.taskName}</p>
                      <span className="text-[9px] text-text-muted block mt-0.5">Assigned to: {item.assignedOfficer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MODULE 2: feedback loop engine calibration */}
            <div className="card-panel p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit border-b border-border-color pb-2">
                <MessageSquare size={14} /> Calibrate AI Engine
              </h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Your feedback calibrates deep learning weights dynamically.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Recommendation Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star 
                          size={16} 
                          className={star <= rating ? "fill-warning text-warning" : "text-text-muted"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter observation notes on recommendation accuracy..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent"
                  />
                </div>

                {feedbackSuccess && (
                  <div className="p-2 bg-success/15 border border-success/30 text-success rounded font-semibold text-[10px] flex items-center gap-1">
                    <Check size={12} /> Feedback ingested in TEE weights core.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-1.5 bg-[#143D73] hover:bg-[#1b4b8c] text-white font-bold rounded text-xs transition border border-[#1b4b8c] flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="animate-spin text-white" size={12} />
                  ) : (
                    <span>Feed Feedback Loop</span>
                  )}
                </button>
              </form>
            </div>

            {/* MODULE 3: ACCURACY CALIBRATION CHART */}
            {outcomeData && (
              <div className="card-panel p-4 flex-1 overflow-y-auto">
                <span className="text-[10px] text-text-secondary font-bold uppercase font-mono block mb-2">Calibration History</span>
                <div className="flex flex-col gap-2 text-[10px] text-text-secondary">
                  {outcomeData.calibrationProgress.map((epoch: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-border-color/30">
                      <span className="font-semibold">{epoch.epoch}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">Acc:</span>
                        <span className="text-success font-mono font-bold">{epoch.accuracy}%</span>
                        <span className="text-text-muted">Rating:</span>
                        <span className="text-warning font-mono font-bold">{epoch.rating}★</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="card-panel p-10 text-center text-text-muted text-xs">
          Select an FIR case file to view decision intelligence metrics.
        </div>
      )}

      {/* ASSIGN OFFICER DIALOG MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <form onSubmit={handleAssignSubmit} className="bg-bg-secondary border border-border-color rounded-xl max-w-sm w-full p-5 shadow-lg animate-scale-in">
            <h3 className="text-sm font-bold font-outfit text-text-primary mb-3 flex items-center gap-1.5 border-b border-border-color pb-2">
              <UserCheck size={18} className="text-accent animate-pulse" /> Assign Investigating Officer
            </h3>
            
            <div className="flex flex-col gap-3 text-xs mb-5">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Select Suit Officer</label>
                <select
                  value={assignedOfficerName}
                  onChange={(e) => setAssignedOfficerName(e.target.value)}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer font-bold"
                >
                  <option value="Inspector H. S. Rao">Inspector H. S. Rao (MO overlap: 98%)</option>
                  <option value="SP Rajesh Kumar">SP Rajesh Kumar (Command expert)</option>
                  <option value="Sub-Inspector Sandeep Kumar">SI Sandeep Kumar (Nice Road lead)</option>
                  <option value="Inspector Mamatha B. K.">Inspector Mamatha B. K. (Cyber lead)</option>
                  <option value="Constable Kumar S.">Constable Kumar S. (Patrol beat)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="py-1.5 px-3 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color rounded text-[11px] font-semibold text-text-primary transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded text-[11px] font-bold transition border border-[#1b4b8c]"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GENERATE BRIEFING REPORT DIALOG MODAL */}
      {showReportModal && reportRec && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-xl max-w-lg w-full p-6 shadow-lg animate-scale-in text-xs">
            <div className="flex items-center justify-between border-b border-border-color pb-3 mb-4">
              <h3 className="text-sm font-bold font-outfit text-text-primary flex items-center gap-1.5">
                <FileText size={18} className="text-accent animate-pulse" /> AI Briefing Report Summary
              </h3>
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">CLASSIFIED // INTERNAL ONLY</span>
            </div>

            <div className="flex flex-col gap-3 text-text-secondary leading-relaxed bg-bg-primary p-4 rounded-lg border border-border-color/30 max-h-96 overflow-y-auto mb-5">
              <div className="border-b border-border-color/30 pb-2 mb-1">
                <h4 className="text-xs font-bold text-text-primary">{reportRec.recommendation}</h4>
                <span className="text-[10px] text-text-muted font-mono mt-0.5 block">Confidence Threshold: {reportRec.confidence}%</span>
              </div>
              <div>
                <strong className="text-text-primary block font-mono text-[9px] uppercase">Justification reasoning:</strong>
                <p className="mt-1 text-[10px]">{reportRec.reason}</p>
              </div>
              <div className="mt-2">
                <strong className="text-text-primary block font-mono text-[9px] uppercase">Corroborative Evidence:</strong>
                <p className="mt-1 text-[10px]">{reportRec.evidence}</p>
              </div>
              <div className="mt-2">
                <strong className="text-text-primary block font-mono text-[9px] uppercase">SHAP Explainability vectors:</strong>
                <p className="mt-1 text-[10px]">{reportRec.explainability}</p>
              </div>
              <div className="mt-2">
                <strong className="text-text-primary block font-mono text-[9px] uppercase">Historical comparisons:</strong>
                <p className="mt-1 text-[10px]">{reportRec.historicalComparison}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="py-1.5 px-3 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color rounded text-[11px] font-semibold text-text-primary transition"
              >
                Close Briefing
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-1.5 px-4 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded text-[11px] font-bold transition border border-[#1b4b8c] flex items-center gap-1"
              >
                <Download size={12} /> Print Briefing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
