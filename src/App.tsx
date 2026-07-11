import { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  Users, 
  Map, 
  Brain, 
  FileText, 
  Lock, 
  Activity, 
  Bell, 
  UserCheck, 
  AlertTriangle,
  Eye,
  EyeOff,
  LayoutDashboard,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Info,
  CheckCircle,
  FilePlus2,
  TrendingUp,
  TrendingDown,
  Upload,
  Database,
  LogOut
} from 'lucide-react';
import { Login } from './components/Login';
import { Copilot } from './components/Copilot';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { HotspotMap } from './components/HotspotMap';
import { Predictor } from './components/Predictor';
import { SimilarCaseFinder } from './components/SimilarCaseFinder';
import { ReportGenerator } from './components/ReportGenerator';
import { SecurityAudit } from './components/SecurityAudit';
import { LogCaseWizard } from './components/LogCaseWizard';
import { FIRManagement } from './components/FIRManagement';
import { PatrolManagement } from './components/PatrolManagement';
import { AIIntelligence } from './components/AIIntelligence';
import { FIRDigitizer } from './components/FIRDigitizer';
import DatabaseManager from './components/DatabaseManager';
import { fetchHotspots, postAuditLog, fetchCases, fetchPatrols, fetchIntelligence, postNewCase } from './utils/api';


interface DistrictStat {
  name: string;
  crimeIndex: number;
  hotspotsCount: number;
  severity: string;
}

interface KCIOSNotification {
  id: number;
  msg: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!sessionStorage.getItem('ksp_auth_token'));
  const [currentOfficer, setCurrentOfficer] = useState<string>(() => sessionStorage.getItem('ksp_auth_officer') || "DGP H. K. Patel");
  const [currentRole, setCurrentRole] = useState<string>(() => {
    const r = sessionStorage.getItem('ksp_auth_role') || "DGP";
    if (r === "DGP") return "DGP";
    if (r === "SP") return "Superintendent of Police";
    if (r === "IO") return "Investigating Officer";
    return "Police Constable";
  });

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [maskPII, setMaskPII] = useState<boolean>(true);
  const [logsTrigger, setLogsTrigger] = useState<number>(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const handleLoginSuccess = (_token: string, officerName: string, roleName: string) => {
    setIsAuthenticated(true);
    setCurrentOfficer(officerName);
    setCurrentRole(roleName);
    triggerLogsReload();
    addNotification(`Welcome back, ${officerName}. Clearance level active.`, 'success');
  };

  const handleLogout = () => {
    // Audit logout
    postAuditLog({
      officer: currentOfficer,
      role: currentRole,
      action: "Logged out from Secure Enclave Session",
      resource: "RBAC Authentication Controller",
      piiMasked: maskPII
    }).then(() => {
      sessionStorage.clear();
      setIsAuthenticated(false);
      setCurrentOfficer('');
      setCurrentRole('');
    });
  };
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'dark');
  const [pendingRole, setPendingRole] = useState<string>('');
  const [showRoleDialog, setShowRoleDialog] = useState<boolean>(false);
  const [showNotifPanel, setShowNotifPanel] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<KCIOSNotification[]>([
    { id: 1, msg: "New burglary cluster forecasted in Jayanagar Sector 4.", type: "warning" },
    { id: 2, msg: "Audit trail log successfully synced with Zoho Catalyst DB.", type: "success" }
  ]);
  const [activeCaseFilter, setActiveCaseFilter] = useState<string>('All');
  
  // Dynamic metrics state
  const [activeCasesCount, setActiveCasesCount] = useState<number>(0);
  const [underInvestigationCount, setUnderInvestigationCount] = useState<number>(0);
  const [highRiskHotspotsCount, setHighRiskHotspotsCount] = useState<number>(0);
  const [patrolShiftsCount, setPatrolShiftsCount] = useState<number>(0);
  const [emergingTrendsCount, setEmergingTrendsCount] = useState<number>(0);

  // Table state for District Index
  const [stats, setStats] = useState<DistrictStat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof DistrictStat | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  const triggerLogsReload = () => {
    setLogsTrigger(prev => prev + 1);
  };

  const addNotification = (msg: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, msg, type }, ...prev]);
    // Auto remove alert
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleRoleChangePrompt = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingRole(e.target.value);
    setShowRoleDialog(true);
  };

  const executeRoleChange = () => {
    const val = pendingRole;
    let officer = "DGP H. K. Patel";
    let role = "DGP";

    if (val === "DGP") {
      officer = "DGP H. K. Patel";
      role = "DGP";
    } else if (val === "SP") {
      officer = "SP Rajesh Kumar";
      role = "Superintendent of Police";
    } else if (val === "IO") {
      officer = "Inspector H. S. Rao";
      role = "Investigating Officer";
    } else if (val === "Constable") {
      officer = "Constable Kumar S.";
      role = "Police Constable";
    }

    setCurrentOfficer(officer);
    setCurrentRole(role);
    setShowRoleDialog(false);

    // Update sessionStorage token for role in window env
    const timestamp = Date.now();
    const rawToken = `${val}:${timestamp}:ksp_secure_salt_7721`;
    const hexToken = btoa(rawToken);
    sessionStorage.setItem('ksp_auth_token', hexToken);
    sessionStorage.setItem('ksp_auth_role', val);
    sessionStorage.setItem('ksp_auth_officer', officer);

    postAuditLog({
      officer,
      role,
      action: `Changed active session role to: ${role}`,
      resource: "RBAC Authentication Controller",
      piiMasked: maskPII
    }).then(() => {
      triggerLogsReload();
      addNotification(`Session role switched to ${role}.`, 'info');
    });
  };

  // Load stats and dynamic metrics from the backend API
  const loadSystemMetrics = async () => {
    try {
      const casesData = await fetchCases();
      setActiveCasesCount(casesData.filter((c: any) => c.status === "Open" || c.status === "Under Investigation").length);
      setUnderInvestigationCount(casesData.filter((c: any) => c.status === "Under Investigation").length);

      const hotspotsData = await fetchHotspots();
      setStats(hotspotsData.districtStats);
      setHighRiskHotspotsCount(hotspotsData.hotspots.filter((h: any) => h.riskLevel === "High").length);

      const patrolsData = await fetchPatrols();
      setPatrolShiftsCount(patrolsData.length);

      const intelligenceData = await fetchIntelligence();
      setEmergingTrendsCount(intelligenceData.length);
    } catch (e) {
      console.error("Error fetching system metrics: ", e);
    }
  };

  useEffect(() => {
    loadSystemMetrics();
    
    // Initial audit log
    postAuditLog({
      officer: currentOfficer,
      role: currentRole,
      action: "Initialized KSP Crime Intelligence OS Session",
      resource: "Core Gateway Boot",
      piiMasked: maskPII
    }).then(() => triggerLogsReload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsTrigger]);

  // Filtering stats
  const filteredStats = stats.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  // Sorting stats
  const sortedStats = [...filteredStats].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return sortOrder === 'asc' 
      ? String(aValue).localeCompare(String(bValue)) 
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSort = (field: keyof DistrictStat) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Pagination stats
  const totalPages = Math.ceil(sortedStats.length / pageSize);
  const paginatedStats = sortedStats.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCaseRegistered = async (newCase: any) => {
    try {
      await postNewCase(newCase);
      addNotification(`Incident record ${newCase.id} saved to backend system DB.`, 'success');
      triggerLogsReload(); // Re-fetch counts
      setActiveTab("cases"); // Navigate to FIR Management tab
      setActiveCaseFilter("Active"); // Filter active cases
    } catch (e) {
      console.error(e);
      addNotification("Failed to save incident record on backend.", 'danger');
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Top Banner Navigation (Fixed) */}
      <header className="border-b border-border-color bg-bg-secondary/90 backdrop-blur-md fixed top-0 left-0 right-0 h-16 z-50 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#143D73]/10 border border-[#143D73]/30 flex items-center justify-center">
            <Shield className="text-accent w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-extrabold uppercase tracking-wider text-text-primary font-outfit leading-none flex items-center gap-1.5">
              KSP Crime Intelligence OS
              <span className="text-[9px] bg-[#143D73]/20 text-accent border border-[#143D73]/40 px-1.5 py-0.5 rounded font-mono uppercase tracking-normal">Government Portal</span>
            </h1>
            <p className="text-[10px] text-text-muted font-mono tracking-widest uppercase mt-0.5">State Crime Records Bureau • Rakshak AI</p>
          </div>
        </div>

        {/* Global Security Controllers */}
        <div className="flex items-center gap-3">
          {/* Theme Toggler */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-bg-tertiary border border-border-color text-text-secondary hover:text-accent transition"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Notifications Hub */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="p-2 rounded-lg bg-bg-tertiary border border-border-color text-text-secondary hover:text-accent transition relative"
              title="Notifications"
            >
              <Bell size={15} className={notifications.length > 0 ? "animate-pulse" : ""} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger"></span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border-color rounded-xl shadow-lg p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between border-b border-border-color pb-2 mb-2.5">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 font-outfit">
                    <Bell size={14} /> Active Security Feed
                  </h4>
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[10px] text-text-muted hover:text-danger font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                        n.type === 'success' ? 'bg-success/5 text-text-secondary border-success/15' :
                        n.type === 'warning' ? 'bg-warning/5 text-text-secondary border-warning/15' :
                        'bg-info/5 text-text-secondary border-info/15'
                      }`}>
                        {n.msg}
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-text-muted">No active notifications.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mask PII Controller */}
          <button
            onClick={() => {
              setMaskPII(!maskPII);
              postAuditLog({
                officer: currentOfficer,
                role: currentRole,
                action: `Toggled PII Masking: ${!maskPII ? "Enabled" : "Disabled"}`,
                resource: "User Header Controller",
                piiMasked: !maskPII
              }).then(() => {
                triggerLogsReload();
                addNotification(`PII Data Masking ${!maskPII ? "Enabled" : "Disabled"}.`, 'info');
              });
            }}
            className={`px-3 h-9 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
              maskPII ? 'bg-accent/10 text-accent border-accent/20' : 'bg-bg-tertiary text-text-secondary border-border-color'
            }`}
          >
            {maskPII ? (
              <>
                <EyeOff size={13} /> PII Masked
              </>
            ) : (
              <>
                <Eye size={13} /> PII Unmasked
              </>
            )}
          </button>

          {/* Role Changer Dropdown */}
          <div className="flex items-center gap-2 bg-bg-tertiary border border-border-color h-9 px-3 rounded-lg text-xs">
            <UserCheck size={13} className="text-accent" />
            <select
              onChange={handleRoleChangePrompt}
              value={currentRole === "DGP" ? "DGP" : currentRole.includes("Superintendent") ? "SP" : currentRole.includes("Investigating") ? "IO" : "Constable"}
              className="bg-transparent text-text-primary outline-none cursor-pointer font-semibold border-none"
            >
              <option value="DGP" className="bg-bg-secondary text-text-primary">DGP (State)</option>
              <option value="SP" className="bg-bg-secondary text-text-primary">Superintendent (District)</option>
              <option value="IO" className="bg-bg-secondary text-text-primary">Inspector (Investigation)</option>
              <option value="Constable" className="bg-bg-secondary text-text-primary">Constable (Field)</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-bg-tertiary border border-border-color text-text-secondary hover:text-danger hover:border-danger/30 transition flex items-center justify-center h-9 w-9"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Main UI Layout Area */}
      <div className="flex-1 flex pt-16 min-h-[calc(100vh-4rem)]">
        {/* Navigation Sidebar (Collapsible) */}
        <aside 
          className={`bg-bg-secondary border-r border-border-color flex flex-col gap-1.5 p-3 shrink-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full py-2 mb-2 rounded-lg bg-bg-tertiary border border-border-color hover:text-accent transition flex items-center justify-center"
            title={isSidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            {isSidebarCollapsed ? <ChevronRight size={15} /> : <div className="flex items-center gap-2 text-xs font-semibold px-2"><ChevronLeft size={15} /> Collapse Navigation</div>}
          </button>

          {[
            { id: "dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
            { id: "ocr", label: "AI FIR Digitizer", icon: Upload },
            { id: "cases", label: "FIR Management", icon: FileText },
            { id: "wizard", label: "Log New Incident", icon: FilePlus2 },
            { id: "db", label: "Database Registry", icon: Database },
            { id: "copilot", label: "Investigator Copilot", icon: Sparkles },
            { id: "graph", label: "Criminal Network", icon: Users },
            { id: "map", label: "Geospatial Hotspots", icon: Map },
            { id: "patrol", label: "Patrol Management", icon: Shield },
            { id: "similar", label: "Similar Case Finder", icon: FileSearch },
            { id: "predict", label: "Predictive Risk Engine", icon: Brain },
            { id: "intelligence", label: "AI Intelligence", icon: Brain },
            { id: "report", label: "AI Report Generator", icon: FileText },
            { id: "security", label: "Secure Audit Logs", icon: Lock }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // Clear filters when navigating directly from sidebar unless intended
                if (item.id === "cases") setActiveCaseFilter("All");
                postAuditLog({
                  officer: currentOfficer,
                  role: currentRole,
                  action: `Navigated to Tab: ${item.label}`,
                  resource: "Navigation Manager",
                  piiMasked: maskPII
                }).then(() => triggerLogsReload());
              }}
              className={`py-3 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition border ${
                activeTab === item.id 
                  ? 'bg-[#143D73] text-white border-[#143D73] shadow-sm'
                  : 'bg-transparent text-text-secondary border-transparent hover:bg-bg-tertiary hover:text-text-primary'
              }`}
            >
              <item.icon size={15} className={activeTab === item.id ? "text-accent" : ""} />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}

          {/* TEE Secure Enclave Link Status */}
          <div className={`mt-auto border-t border-border-color pt-3 ${isSidebarCollapsed ? "text-center" : "px-1"}`}>
            {isSidebarCollapsed ? (
              <Activity className="text-success inline-block w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 bg-[#143D73]/10 border border-[#143D73]/20 px-2.5 py-2 rounded-lg text-[10px] font-mono leading-none">
                <Activity className="text-success animate-pulse w-3.5 h-3.5" />
                <div>
                  <span className="font-bold text-text-primary block mb-0.5">TEE SECURE LINK</span>
                  <span>AES-256 ENCRYPTED</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Workspace Tab Panel */}
        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
          {/* TAB 1: OPERATIONS ROOM DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
              {/* Dynamic KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { 
                    label: "Active FIR Cases", 
                    val: `${activeCasesCount} Cases`, 
                    desc: "Awaiting resolution", 
                    trend: "+2 this week", 
                    trendType: "up", 
                    updated: "Updated 5 mins ago",
                    icon: FileText, 
                    tabTarget: "cases",
                    filterVal: "Active",
                    sparkline: [2, 3, 2, activeCasesCount]
                  },
                  { 
                    label: "Under Investigation", 
                    val: `${underInvestigationCount} Cases`, 
                    desc: "Active detective inquiry", 
                    trend: "No status change", 
                    trendType: "neutral", 
                    updated: "Updated 5 mins ago",
                    icon: Activity, 
                    tabTarget: "cases",
                    filterVal: "Under Investigation",
                    sparkline: [1, 2, 2, underInvestigationCount]
                  },
                  { 
                    label: "High-Risk Hotspots", 
                    val: `${highRiskHotspotsCount} Zones`, 
                    desc: "Critical patrol sectors", 
                    trend: "-1 from last week", 
                    trendType: "down", 
                    updated: "Updated 1 hour ago",
                    icon: Map, 
                    tabTarget: "map",
                    filterVal: "",
                    sparkline: [3, 2, 2, highRiskHotspotsCount]
                  },
                  { 
                    label: "Patrol Shift Assigned", 
                    val: `${patrolShiftsCount} Shifts`, 
                    desc: "Dispatched field units", 
                    trend: "100% duty active", 
                    trendType: "neutral", 
                    updated: "Updated 10s ago",
                    icon: Shield, 
                    tabTarget: "patrol",
                    filterVal: "",
                    sparkline: [2, 3, 4, patrolShiftsCount]
                  },
                  { 
                    label: "Emerging Risk Trends", 
                    val: `${emergingTrendsCount} Alerts`, 
                    desc: "AI anomaly triggers", 
                    trend: "+15% simulated risk", 
                    trendType: "up", 
                    updated: "Updated just now",
                    icon: Brain, 
                    tabTarget: "intelligence",
                    filterVal: "",
                    sparkline: [1, 2, 2, emergingTrendsCount]
                  }
                ].map((kpi, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setActiveTab(kpi.tabTarget);
                      if (kpi.filterVal) {
                        setActiveCaseFilter(kpi.filterVal);
                      }
                      addNotification(`Navigated to ${kpi.label} ledger.`, 'info');
                    }}
                    className="card-panel card-panel-hover p-4 text-left flex flex-col justify-between h-[165px] focus:outline-none"
                    aria-label={`View details for ${kpi.label}`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="min-w-0">
                        <span className="text-text-muted text-[9px] font-bold uppercase tracking-wider block truncate">{kpi.label}</span>
                        <h3 className="text-xl font-extrabold font-outfit mt-1 text-text-primary truncate">{kpi.val}</h3>
                        <span className="text-[9px] text-text-secondary block mt-0.5 truncate">{kpi.desc}</span>
                      </div>
                      <div className="w-7 h-7 rounded bg-[#143D73]/10 border border-[#143D73]/20 flex items-center justify-center flex-shrink-0">
                        <kpi.icon className="text-accent w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Trend & Sparkline */}
                    <div className="flex items-end justify-between w-full mt-3">
                      <div className="min-w-0">
                        <span className="text-[8px] text-text-muted block">{kpi.updated}</span>
                        <div className="flex items-center gap-1 mt-0.5 text-[9px] font-bold">
                          {kpi.trendType === 'up' ? (
                            <span className="text-danger flex items-center gap-0.5"><TrendingUp size={10} /> {kpi.trend}</span>
                          ) : kpi.trendType === 'down' ? (
                            <span className="text-success flex items-center gap-0.5"><TrendingDown size={10} /> {kpi.trend}</span>
                          ) : (
                            <span className="text-text-secondary">{kpi.trend}</span>
                          )}
                        </div>
                      </div>

                      {/* Small SVG Sparkline */}
                      <svg className="w-12 h-6 text-accent flex-shrink-0" viewBox="0 0 100 30" fill="none">
                        <path 
                          d={`M ${kpi.sparkline.map((val, i) => `${(i / (kpi.sparkline.length - 1)) * 100} ${30 - ((val - Math.min(...kpi.sparkline)) / (Math.max(...kpi.sparkline) - Math.min(...kpi.sparkline) || 1)) * 20 - 5}`).join(' L ')}`} 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* District Table & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* District Drilldowns (Redesigned) */}
                <div className="lg:col-span-2 card-panel p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 border-b border-border-color pb-3">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                      <Activity size={15} /> District Security Index Ranking
                    </h3>
                    
                    {/* Search & Filter Bar */}
                    <div className="flex gap-2 items-center flex-wrap">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search District..."
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                          className="bg-bg-primary text-text-primary text-xs pl-3 pr-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent"
                        />
                      </div>
                      
                      <select
                        value={severityFilter}
                        onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-bg-primary text-text-primary text-xs px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent"
                      >
                        <option value="All">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-text-secondary border-b border-border-color bg-bg-tertiary">
                          <th className="py-2.5 px-3 font-semibold cursor-pointer select-none hover:text-accent" onClick={() => handleSort('name')}>
                            Jurisdiction District {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-center cursor-pointer select-none hover:text-accent" onClick={() => handleSort('crimeIndex')}>
                            Crime Rank Index {sortField === 'crimeIndex' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-center cursor-pointer select-none hover:text-accent" onClick={() => handleSort('hotspotsCount')}>
                            Hotspots Identified {sortField === 'hotspotsCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-center">Severity Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStats.length > 0 ? (
                          paginatedStats.map(d => (
                            <tr key={d.name} className="border-b border-border-color/30 hover:bg-bg-tertiary transition-colors">
                              <td className="py-3 px-3 font-bold text-text-primary">{d.name}</td>
                              <td className="py-3 px-3 text-center font-bold font-mono text-accent">{d.crimeIndex}/100</td>
                              <td className="py-3 px-3 text-center text-text-secondary font-mono">{d.hotspotsCount} zones</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`badge ${
                                  d.severity === 'Critical' ? 'badge-danger' :
                                  d.severity === 'High' ? 'badge-danger' :
                                  d.severity === 'Moderate' ? 'badge-warning' : 'badge-success'
                                }`}>
                                  {d.severity}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs text-text-muted">No matching districts found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 border-t border-border-color pt-3 text-xs">
                      <span className="text-text-muted">Page {currentPage} of {totalPages} ({filteredStats.length} items)</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1 rounded bg-bg-tertiary border border-border-color text-text-secondary hover:text-accent disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1 rounded bg-bg-tertiary border border-border-color text-text-secondary hover:text-accent disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Anomalies and Alert Feed */}
                <div className="lg:col-span-1 card-panel p-5 flex flex-col h-[350px]">
                  <h3 className="text-sm font-bold text-danger uppercase tracking-wider mb-4 flex items-center gap-1.5 font-outfit border-b border-border-color pb-2.5">
                    <AlertTriangle size={15} className="text-danger animate-pulse" /> Live Anomaly alerts
                  </h3>
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                    {[
                      { type: "BURGLARY CLUSTER", desc: "92% risk score forecasted in Jayanagar Sector 4 window 11 PM to 3 AM.", level: "critical" },
                      { type: "VEHICLE RECURRENCE", desc: "Black Hatchback KA-01-MC-4592 registered to suspect Yashas Kumar spotted at 2 recent Jayanagar boundary feeds.", level: "warning" },
                      { type: "IDENTITY THREAT", desc: "Multiple carrier swap requests detected on suspect SIM swaps near Mysuru City towers.", level: "warning" }
                    ].map((alert, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                        alert.level === 'critical' 
                          ? 'bg-danger/5 text-text-secondary border-danger/15' 
                          : 'bg-warning/5 text-text-secondary border-warning/15'
                      }`}>
                        <AlertTriangle size={13} className="mt-0.5 flex-shrink-0 text-amber-500" />
                        <div>
                          <span className={`font-bold uppercase tracking-wider block text-[10px] mb-0.5 ${alert.level === 'critical' ? 'text-danger' : 'text-warning'}`}>{alert.type}</span>
                          {alert.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1.5: AI FIR DIGITIZER */}
          {activeTab === "ocr" && (
            <FIRDigitizer 
              onSuccess={loadSystemMetrics}
              showNotification={addNotification}
            />
          )}

          {/* TAB 2: FIR MANAGEMENT */}
          {activeTab === "cases" && (
            <FIRManagement initialFilter={activeCaseFilter} />
          )}

          {/* TAB 3: SECURE INCIDENT LOG WIZARD */}
          {activeTab === "wizard" && (
            <LogCaseWizard 
              onSuccess={handleCaseRegistered}
              showNotification={addNotification}
            />
          )}

          {/* TAB 3.5: DATABASE REGISTRY MANAGER */}
          {activeTab === "db" && (
            <DatabaseManager />
          )}

          {/* TAB 4: INVESTIGATOR COPILOT */}
          {activeTab === "copilot" && (
            <Copilot
              currentOfficer={currentOfficer}
              currentRole={currentRole}
              maskPII={maskPII}
              triggerLogsReload={triggerLogsReload}
            />
          )}

          {/* TAB 5: KNOWLEDGE GRAPH */}
          {activeTab === "graph" && (
            <KnowledgeGraph maskPII={maskPII} />
          )}

          {/* TAB 6: GEOSPATIAL MAPS */}
          {activeTab === "map" && (
            <HotspotMap />
          )}

          {/* TAB 7: PATROL MANAGEMENT */}
          {activeTab === "patrol" && (
            <PatrolManagement />
          )}

          {/* TAB 8: SIMILAR CASE FINDER */}
          {activeTab === "similar" && (
            <SimilarCaseFinder
              currentOfficer={currentOfficer}
              currentRole={currentRole}
              initialFilter={activeCaseFilter}
            />
          )}

          {/* TAB 9: PREDICTIVE RISK ENGINE */}
          {activeTab === "predict" && (
            <Predictor
              currentOfficer={currentOfficer}
              currentRole={currentRole}
            />
          )}

          {/* TAB 10: AI INTELLIGENCE */}
          {activeTab === "intelligence" && (
            <AIIntelligence />
          )}

          {/* TAB 11: AI REPORT GENERATOR */}
          {activeTab === "report" && (
            <ReportGenerator
              currentOfficer={currentOfficer}
              currentRole={currentRole}
            />
          )}

          {/* TAB 12: IMMUTABLE AUDIT LOGS */}
          {activeTab === "security" && (
            <SecurityAudit
              currentOfficer={currentOfficer}
              currentRole={currentRole}
              maskPII={maskPII}
              setMaskPII={setMaskPII}
              logsTrigger={logsTrigger}
              triggerLogsReload={triggerLogsReload}
            />
          )}
        </main>
      </div>

      {/* Floating Notifications Alert Box */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {notifications.slice(0, 3).map((notif) => (
          <div 
            key={notif.id} 
            className={`p-3 rounded-lg border shadow-lg flex gap-2.5 items-start pointer-events-auto bg-bg-secondary slide-in-notif ${
              notif.type === 'success' ? 'border-success/30 text-text-primary' :
              notif.type === 'warning' ? 'border-warning/30 text-text-primary' :
              notif.type === 'danger' ? 'border-danger/30 text-text-primary' :
              'border-border-color text-text-primary'
            }`}
          >
            {notif.type === 'success' ? (
              <CheckCircle size={15} className="text-success mt-0.5 flex-shrink-0" />
            ) : notif.type === 'warning' ? (
              <AlertTriangle size={15} className="text-warning mt-0.5 flex-shrink-0" />
            ) : notif.type === 'danger' ? (
              <Shield size={15} className="text-danger mt-0.5 flex-shrink-0" />
            ) : (
              <Info size={15} className="text-accent mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-semibold leading-relaxed">{notif.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role Switcher Confirmation Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-xl max-w-sm w-full p-5 shadow-lg animate-scale-in">
            <h3 className="text-base font-bold font-outfit text-text-primary mb-2 flex items-center gap-1.5">
              <UserCheck size={18} className="text-accent" /> Confirm Role Switch
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-5">
              You are modifying your active session role to: <strong className="text-accent font-bold">{pendingRole}</strong>. This changes your access rights and will be recorded in the security audit logs. Do you wish to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRoleDialog(false)}
                className="py-2 px-4 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-color rounded-lg text-xs font-semibold text-text-primary transition"
              >
                Cancel
              </button>
              <button
                onClick={executeRoleChange}
                className="py-2 px-4 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded-lg text-xs font-bold transition border border-[#1b4b8c]"
              >
                Yes, Change Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official police footer */}
      <footer className="border-t border-border-color bg-bg-secondary h-12 flex items-center justify-center text-text-muted text-[9px] font-mono uppercase tracking-wider">
        <span>© 2026 Karnataka State Police • Security Clearance Level 1 Platform • Catalyst TEE Enclave</span>
      </footer>
    </div>
  );
}

export default App;
