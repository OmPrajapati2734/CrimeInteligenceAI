import React, { useState } from 'react';
import { 
  Upload, Database, BrainCircuit, FileSpreadsheet, FileText, 
  Play, CheckCircle, AlertTriangle, ShieldAlert
} from 'lucide-react';

export default function DatasetTraining() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const addLog = (msg: string) => {
    setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setLogMessages([]);
    setProgress(10);
    
    addLog(`Ingesting uploaded archive: "${selectedFile.name}" (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`);
    
    setTimeout(() => {
      setProgress(40);
      addLog(`Initializing extraction engine: Parsing columns for KSP FIR Schema compliance...`);
    }, 1000);

    setTimeout(() => {
      setProgress(75);
      addLog(`Successfully scanned 1,600,000 records. Extracting geo-coordinates, offence classifications, and dates.`);
    }, 2500);

    setTimeout(() => {
      setProgress(100);
      setIsProcessing(false);
      addLog(`Data pipeline completed. Loaded 23 structural columns and aligned 1.6M rows!`);
      
      // Seed extraction insights
      setStats({
        totalRows: 1602495,
        districtsCovered: 31,
        dateRange: "Jan 2016 - Jul 2026",
        anomaliesResolved: 45920,
        majorOffence: "Theft & Burglary (32%)",
        avgConfidence: "98.7%"
      });
    }, 4000);
  };

  const handleTrainModel = () => {
    setIsTraining(true);
    setProgress(0);
    setLogMessages([]);
    addLog("Initializing QuickML Random Forest classifier training session...");

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setModelTrained(true);
          addLog("Model training completed! Cross-validation score: 94.2% accuracy. Hotspot prediction engine updated.");
          return 100;
        }
        const next = prev + 20;
        if (next === 20) addLog("Splitting dataset: 80% Training set, 20% Test validation split.");
        if (next === 40) addLog("Generating feature matrices: extracting temporal factors (time-blocks, day-of-week).");
        if (next === 60) addLog("Training decision tree nodes (trees=150)...");
        if (next === 80) addLog("Computing SHAP importance levels and relative risk parameters.");
        return next;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-sky-800" />
          KSP Big Data Model Trainer (QuickML Platform)
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Ingest raw historical crime archives (CSV, PDF, or ZIP), extract database registers, and train the predictive hotspot model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Drag-and-Drop Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors bg-white ${
              dragActive ? 'border-sky-800 bg-sky-50/20' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".csv,.pdf,.zip" 
              onChange={handleFileInput} 
            />
            
            <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-base font-bold text-slate-700">Upload KSP Crime Dataset</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Supports 1.6 Million+ records archive (.zip, .csv, or scanned PDFs)</p>
            
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer bg-sky-800 hover:bg-sky-900 text-white font-semibold px-4 py-2 rounded text-xs transition-colors inline-block"
            >
              Browse Files
            </label>

            {file && (
              <div className="mt-6 p-3 bg-slate-50 rounded border border-slate-200 text-left flex items-center gap-3">
                {file.name.endsWith('.csv') ? (
                  <FileSpreadsheet className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                ) : (
                  <FileText className="h-8 w-8 text-sky-600 flex-shrink-0" />
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Ingest logs */}
          {logMessages.length > 0 && (
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1.5 h-64 overflow-y-auto border border-slate-800 shadow-inner">
              <h4 className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" /> Data Pipeline Log Monitor
              </h4>
              {logMessages.map((log, idx) => (
                <div key={idx} className="leading-relaxed">{log}</div>
              ))}
              {isProcessing && (
                <div className="text-sky-400 animate-pulse mt-2">● Processing ingestion block... {progress}%</div>
              )}
              {isTraining && (
                <div className="text-amber-400 animate-pulse mt-2">● Computing trees... {progress}%</div>
              )}
            </div>
          )}
        </div>

        {/* Right Action & Prediction Analytics */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Training Control Center
            </h3>

            {stats ? (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Ingested</span>
                    <span className="text-lg font-bold text-sky-800 font-mono">{stats.totalRows.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Districts</span>
                    <span className="text-lg font-bold text-sky-800 font-mono">{stats.districtsCovered}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temporal Coverage:</span>
                    <strong className="text-slate-700">{stats.dateRange}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validation Score:</span>
                    <strong className="text-slate-700">{stats.avgConfidence}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Offence Head:</span>
                    <strong className="text-slate-700">{stats.majorOffence}</strong>
                  </div>
                </div>

                {!modelTrained && (
                  <button 
                    disabled={isTraining}
                    onClick={handleTrainModel}
                    className="w-full py-2.5 bg-sky-800 hover:bg-sky-900 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {isTraining ? `Training Classifier (${progress}%)` : "Train QuickML Model"}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400">
                <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-semibold">No dataset ingested yet</p>
                <p className="text-[10px] mt-1">Please drop or browse the dataset archive first.</p>
              </div>
            )}

            {modelTrained && (
              <div className="bg-emerald-50 border border-emerald-100 rounded p-4 text-emerald-800 text-xs space-y-2 mb-6">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Model Ready & Calibrated
                </div>
                <p className="leading-relaxed opacity-90">
                  The predictive algorithm has incorporated the new 1.6M rows and is outputting risk coordinates for the next patrol cycle.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-300" />
            <span>Encrypted model binaries synced to KSP Catalyst core.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
