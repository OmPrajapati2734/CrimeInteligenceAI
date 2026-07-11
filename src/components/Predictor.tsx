import React, { useState } from 'react';
import { Brain, Sliders, AlertTriangle, ShieldAlert, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { submitPredict } from '../utils/api';

interface FactorImpact {
  factor: string;
  impact: number;
  type: 'positive' | 'negative';
}

interface PredictionResult {
  district: string;
  timeWindow: string;
  overallRisk: number;
  severity: string;
  confidence: number;
  predictions: Array<{ type: string; probability: number }>;
  explainability: FactorImpact[];
  recommendations: string[];
}

interface PredictorProps {
  currentOfficer: string;
  currentRole: string;
}

export const Predictor: React.FC<PredictorProps> = ({ currentOfficer, currentRole }) => {
  const [district, setDistrict] = useState("Bengaluru City");
  const [hour, setHour] = useState<number>(22);
  const [weather, setWeather] = useState("Clear");
  const [festival, setFestival] = useState("None");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>({
    district: "Bengaluru City",
    timeWindow: "22:00 - 24:00",
    overallRisk: 65,
    severity: "High",
    confidence: 89,
    predictions: [
      { type: "Burglary", probability: 55 },
      { type: "Theft / Vehicle Theft", probability: 35 },
      { type: "Cyber Fraud", probability: 35 },
      { type: "Drug Contraband Activity", probability: 8 }
    ],
    explainability: [
      { factor: "Late Night hours (11 PM - 4 AM)", impact: 25, type: "positive" },
      { factor: "High demographic density & tech hub index", impact: 15, type: "positive" },
      { factor: "Optimal weather conditions", impact: 5, type: "positive" }
    ],
    recommendations: [
      "Deploy extra 2 Namma 112 interceptors on sector boundaries.",
      "Issue automatic preventive SMS alerts to registered Jayanagar Residents Association.",
      "Verify presence of CCTV feeds near intersection camera points."
    ]
  });

  const handlePredict = async () => {
    setLoading(true);
    try {
      const data = await submitPredict({ district, hour, weather, festival }, currentOfficer, currentRole);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto min-h-[520px]">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 card-panel p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b border-border-color pb-3 mb-1">
          <Sliders className="text-accent w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-outfit text-text-primary">Risk Parameters</h2>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {/* District Selection */}
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

          {/* Time Window Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-text-secondary">
              <span>Simulation Hour</span>
              <span className="text-accent font-mono font-bold">{hour.toString().padStart(2, '0')}:00 Hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="accent-primary w-full bg-bg-primary h-1 rounded-lg border-none"
            />
            <span className="text-[10px] text-text-muted">Simulates risks over the subsequent 2-hour window.</span>
          </div>

          {/* Weather Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Meteorological Conditions</label>
            <div className="grid grid-cols-3 gap-2">
              {["Clear", "Rainy", "Foggy"].map(w => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition ${
                    weather === w 
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-bg-primary text-text-secondary border-border-color hover:bg-bg-tertiary'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Festival Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Festival / Event Indicators</label>
            <select
              value={festival}
              onChange={(e) => setFestival(e.target.value)}
              className="bg-bg-primary border border-border-color rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-accent"
            >
              <option value="None">Normal Calendar Day</option>
              <option value="Ganesha Chaturthi">Ganesha Chaturthi (Crowded Markets)</option>
              <option value="Deepavali">Deepavali Holidays (Empty Gated Homes)</option>
              <option value="General Assembly Elections">Assembly Elections (Movement Restrictions)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-[#143D73] hover:bg-[#1b4b8c] text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-[#1b4b8c]"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin text-accent" size={14} /> Running AI Models...
            </>
          ) : (
            <>
              <Brain size={14} className="text-accent" /> Calculate Predictive Risk
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Gauge Panel */}
            <div className="card-panel p-5 flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-wider font-mono">Crime Probability score</span>
                  <span className="text-[10px] text-text-muted">Confidence: {result.confidence}%</span>
                </div>
                <h3 className="text-3xl font-extrabold font-outfit text-text-primary flex items-baseline gap-1">
                  {result.overallRisk}%
                  <span className="text-xs font-medium text-text-muted">Probability</span>
                </h3>
              </div>

              <div className="my-2">
                <div className="w-full bg-bg-primary rounded-full h-3 border border-border-color overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.overallRisk > 70 ? 'bg-danger' :
                      result.overallRisk > 45 ? 'bg-warning' : 'bg-success'
                    }`} 
                    style={{ width: `${result.overallRisk}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-bg-tertiary rounded-lg border border-border-color text-xs">
                <ShieldAlert className={`w-5 h-5 flex-shrink-0 ${
                  result.overallRisk > 70 ? 'text-danger' :
                  result.overallRisk > 45 ? 'text-warning' : 'text-success'
                }`} />
                <div>
                  <span className="font-bold text-text-primary block">Threat Classification: {result.severity}</span>
                  <span className="text-[10px] text-text-muted">Targeting Hour: {result.timeWindow}</span>
                </div>
              </div>
            </div>

            {/* Crime Category Probabilities */}
            <div className="card-panel p-5 h-[230px] flex flex-col">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5 font-outfit border-b border-border-color pb-2">
                <TrendingUp size={15} /> Category Risk Breakdown
              </h3>
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                {result.predictions.map((p, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-secondary font-semibold">{p.type}</span>
                      <span className="font-bold text-text-primary">{p.probability}%</span>
                    </div>
                    <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden border border-border-color/30">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          p.probability > 70 ? 'bg-danger' :
                          p.probability > 45 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${p.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable AI (SHAP bars) */}
            <div className="card-panel p-5 md:col-span-2 flex flex-col gap-3.5 min-h-[250px]">
              <div className="flex items-center gap-2 border-b border-border-color pb-2">
                <Sparkles className="text-accent w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-outfit">Explainable AI (SHAP Feature Importance)</h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-3.5">
                {result.explainability.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs">
                    <span className="w-full md:w-1/3 text-text-secondary font-semibold truncate" title={item.factor}>
                      {item.factor}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-full bg-bg-primary h-5 rounded overflow-hidden relative flex items-center border border-border-color">
                        {item.type === 'positive' ? (
                          <div 
                            className="bg-danger/10 border-r border-danger h-full flex items-center justify-end px-1.5 text-[9px] text-danger font-bold"
                            style={{ width: `${item.impact * 2.5}%` }}
                          >
                            +{item.impact}%
                          </div>
                        ) : (
                          <div 
                            className="bg-success/10 border-r border-success h-full flex items-center justify-end px-1.5 text-[9px] text-success font-bold"
                            style={{ width: `${Math.abs(item.impact) * 2.5}%` }}
                          >
                            {item.impact}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Recommendations Panel */}
              <div className="mt-2 p-3.5 bg-bg-tertiary border border-border-color rounded-lg flex flex-col gap-2">
                <h4 className="text-xs font-bold text-accent flex items-center gap-1">
                  <AlertTriangle size={14} /> AI Recommendation Engine Actionables
                </h4>
                <ul className="list-disc pl-4 text-[11px] text-text-secondary flex flex-col gap-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-panel p-6 md:col-span-2 h-[520px] flex flex-col items-center justify-center text-center text-text-muted">
            <Brain className="w-12 h-12 mb-3 text-border-color" />
            <h3 className="text-base font-bold text-text-primary mb-1">Predictions Engine</h3>
            <p className="text-xs max-w-sm text-text-secondary">Configure simulation parameters on the left and click "Calculate Predictive Risk" to run AI forecasts.</p>
          </div>
        )}
      </div>
    </div>
  );
};
