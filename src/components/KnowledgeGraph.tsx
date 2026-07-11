import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { 
  Share2, HelpCircle, User, RefreshCw, ZoomIn, 
  Plus, Trash2, Edit2, Check, Search, Calendar, Sparkles,
  CheckCircle2, ChevronRight
} from 'lucide-react';
import { 
  fetchGraphData, addGraphNode, editGraphNode, deleteGraphNode, 
  addGraphRelationship, deleteGraphRelationship, fetchAISuggestions, 
  acceptAISuggestion, rejectAISuggestion 
} from '../utils/api';
import { sanitizeInput, maskPIIData } from '../utils/sanitize';

interface GraphNode {
  id: string;
  label: string;
  group: string;
  title: string;
  risk?: number;
  age?: number;
  status?: string;
  mo?: string;
  year?: number; // Chronological timeline stamp
}

interface GraphEdge {
  id?: string;
  from: string;
  to: string;
  label?: string;
  dashes?: boolean;
  color?: any;
  value?: number;
  year?: number; // Timeline stamp
}

interface KnowledgeGraphProps {
  maskPII: boolean;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ maskPII }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'addNode' | 'addEdge' | 'suggestions'>('inspector');
  
  // Datasets
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineYear, setTimelineYear] = useState<number>(2026);
  const [hiddenGroups, setHiddenGroups] = useState<Record<string, boolean>>({});

  // Add Node State
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeGroup, setNewNodeGroup] = useState('criminal');
  const [newNodeRisk, setNewNodeRisk] = useState<number>(50);
  const newNodeAge = 30;
  const newNodeStatus = 'Active';
  const [newNodeMo, setNewNodeMo] = useState('');
  const [newNodeYear, setNewNodeYear] = useState<number>(2026);

  // Add Edge State
  const [newEdgeFrom, setNewEdgeFrom] = useState('');
  const [newEdgeTo, setNewEdgeTo] = useState('');
  const [newEdgeLabel, setNewEdgeLabel] = useState('Uses Phone');
  const [newEdgeDashes, setNewEdgeDashes] = useState(false);
  const [newEdgeYear, setNewEdgeYear] = useState<number>(2026);

  // Edit Node State
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editNodeLabel, setEditNodeLabel] = useState('');
  const [editNodeRisk, setEditNodeRisk] = useState<number>(50);
  const [editNodeAge, setEditNodeAge] = useState<number>(30);
  const [editNodeStatus, setEditNodeStatus] = useState('');
  const [editNodeMo, setEditNodeMo] = useState('');

  // Initial Load
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphData();
      
      // Inject timeline years dynamically if not present
      const processedNodes = res.nodes.map((n, i) => ({
        ...n,
        year: n.year || (n.id.includes('2025') ? 2025 : n.id.includes('2026') ? 2026 : 2024 + (i % 3))
      }));
      
      const processedEdges = res.edges.map((e, i) => ({
        ...e,
        year: e.year || (e.from.includes('2025') || e.to.includes('2025') ? 2025 : 2024 + (i % 3))
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);

      const suggestions = await fetchAISuggestions();
      setAISuggestions(suggestions);
    } catch (e) {
      console.error("Failed to load graph data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Vis Network Setup
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Filter nodes based on timeline year and hidden groups
    const visibleNodes = nodes.filter(node => {
      if (node.year && node.year > timelineYear) return false;
      if (hiddenGroups[node.group]) return false;
      return true;
    });

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    // Filter edges
    const visibleEdges = edges.filter(edge => {
      if (edge.year && edge.year > timelineYear) return false;
      if (!visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to)) return false;
      return true;
    });

    // vis dataset mapping
    const visNodesData = visibleNodes.map(node => {
      let displayLabel = node.label;
      if (maskPII) {
        if (node.group === 'phone') displayLabel = maskPIIData(node.label, 'phone');
        if (node.group === 'criminal' && node.id === 'CRIM-5821') displayLabel = "Yashas K.";
        if (node.group === 'address') displayLabel = maskPIIData(node.label, 'address');
      }

      let color = { background: "#1e293b", border: "#475569", highlight: { background: "#334155", border: "#64748b" } };
      let size = 20;

      switch (node.group) {
        case 'criminal':
          color = { background: "#7f1d1d", border: "#ef4444", highlight: { background: "#991b1b", border: "#f87171" } };
          size = 24;
          break;
        case 'gang':
          color = { background: "#3b0764", border: "#a855f7", highlight: { background: "#581c87", border: "#c084fc" } };
          size = 28;
          break;
        case 'fir':
          color = { background: "#172554", border: "#3b82f6", highlight: { background: "#1e3a8a", border: "#60a5fa" } };
          size = 22;
          break;
        case 'vehicle':
          color = { background: "#7c2d12", border: "#f97316", highlight: { background: "#9a3412", border: "#fb923c" } };
          size = 20;
          break;
        case 'phone':
          color = { background: "#064e3b", border: "#10b981", highlight: { background: "#065f46", border: "#34d399" } };
          size = 18;
          break;
        case 'weapon':
          color = { background: "#451a03", border: "#d97706", highlight: { background: "#78350f", border: "#fbbf24" } };
          size = 18;
          break;
        case 'address':
          color = { background: "#0f172a", border: "#0ea5e9", highlight: { background: "#1e293b", border: "#38bdf8" } };
          size = 18;
          break;
        default:
          color = { background: "#1e293b", border: "#64748b", highlight: { background: "#334155", border: "#94a3b8" } };
          size = 18;
      }

      return {
        id: node.id,
        label: displayLabel,
        title: node.title,
        shape: node.group === 'gang' ? 'triangle' : node.group === 'fir' ? 'square' : 'dot',
        color,
        size,
        font: { color: '#f8fafc', size: 11, face: 'Outfit' }
      };
    });

    const visEdgesData = visibleEdges.map(edge => ({
      ...edge,
      color: edge.color || { color: '#475569', highlight: '#0ea5e9' },
      width: 1.5,
      arrows: 'to',
      font: { size: 9, color: '#94a3b8', strokeWidth: 0, align: 'middle' }
    }));

    const data = {
      nodes: new DataSet(visNodesData),
      edges: new DataSet(visEdgesData)
    };

    const options = {
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -30,
          centralGravity: 0.01,
          springLength: 130,
          springConstant: 0.12
        },
        maxVelocity: 50,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: { iterations: 100 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        selectable: true,
        selectConnectedEdges: true
      }
    };

    const net = new Network(containerRef.current, data, options);

    net.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const rawNode = nodes.find(n => n.id === nodeId);
        setSelectedNode(rawNode || null);
        setSelectedEdgeId(null);
        setIsEditingNode(false);
      } else if (params.edges.length > 0) {
        setSelectedEdgeId(params.edges[0]);
        setSelectedNode(null);
        setIsEditingNode(false);
      } else {
        setSelectedNode(null);
        setSelectedEdgeId(null);
        setIsEditingNode(false);
      }
    });

    setNetwork(net);

    return () => {
      net.destroy();
    };
  }, [nodes, edges, timelineYear, hiddenGroups, maskPII]);

  const handleZoomIn = () => {
    network?.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
  };

  // Node Search Focus
  const handleSearchFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !network) return;
    const cleanSearch = searchQuery.toLowerCase();
    const matched = nodes.find(n => n.label.toLowerCase().includes(cleanSearch) || n.id.toLowerCase().includes(cleanSearch));
    if (matched) {
      network.focus(matched.id, {
        scale: 1.5,
        animation: { duration: 1000, easingFunction: 'easeInOutQuad' }
      });
      setSelectedNode(matched);
      setSelectedEdgeId(null);
      setActiveTab('inspector');
    }
  };

  // Node CRUD actions
  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId || !newNodeLabel) return;

    // Sanitization check
    const safeId = sanitizeInput(newNodeId).trim();
    const safeLabel = sanitizeInput(newNodeLabel).trim();
    const safeMo = sanitizeInput(newNodeMo).trim();

    if (nodes.some(n => n.id === safeId)) {
      alert("Error: Node ID already exists in the local ledger.");
      return;
    }

    const payload = {
      id: safeId,
      label: safeLabel,
      group: newNodeGroup,
      risk: Number(newNodeRisk),
      age: Number(newNodeAge),
      status: newNodeStatus,
      mo: safeMo,
      year: Number(newNodeYear)
    };

    try {
      await addGraphNode(payload);
      setNodes(prev => [...prev, { ...payload, title: `${payload.label} (Risk: ${payload.risk}%)` }]);
      setNewNodeId('');
      setNewNodeLabel('');
      setNewNodeMo('');
      setActiveTab('inspector');
      // Set as currently active inspector node
      setSelectedNode({ ...payload, title: `${payload.label} (Risk: ${payload.risk}%)` });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    const safeLabel = sanitizeInput(editNodeLabel).trim();
    const safeMo = sanitizeInput(editNodeMo).trim();

    const payload = {
      label: safeLabel,
      group: selectedNode.group,
      risk: Number(editNodeRisk),
      age: Number(editNodeAge),
      status: editNodeStatus,
      mo: safeMo
    };

    try {
      await editGraphNode(selectedNode.id, payload);
      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, ...payload, title: `${payload.label} (Risk: ${payload.risk}%)` } : n));
      setSelectedNode(prev => prev ? { ...prev, ...payload, title: `${payload.label} (Risk: ${payload.risk}%)` } : null);
      setIsEditingNode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSelectedNode = async () => {
    if (!selectedNode) return;
    if (!confirm(`Are you sure you want to delete entity ${selectedNode.label} and all its connections?`)) return;

    try {
      await deleteGraphNode(selectedNode.id);
      setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
      setEdges(prev => prev.filter(e => e.from !== selectedNode.id && e.to !== selectedNode.id));
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Edge CRUD actions
  const handleCreateEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeFrom || !newEdgeTo || newEdgeFrom === newEdgeTo) return;

    const payload = {
      from: newEdgeFrom,
      to: newEdgeTo,
      label: newEdgeLabel,
      dashes: newEdgeDashes,
      year: Number(newEdgeYear)
    };

    try {
      const result = await addGraphRelationship(payload);
      setEdges(prev => [...prev, { ...payload, id: result.edge.id }]);
      setNewEdgeFrom('');
      setNewEdgeTo('');
      setActiveTab('inspector');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSelectedEdge = async () => {
    if (!selectedEdgeId) return;
    if (!confirm(`Are you sure you want to remove this connection?`)) return;

    try {
      await deleteGraphRelationship(selectedEdgeId);
      setEdges(prev => prev.filter(e => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // AI Suggestions Actions
  const handleAcceptSuggestion = async (id: string) => {
    try {
      const res = await acceptAISuggestion(id);
      setEdges(prev => [...prev, res.edge]);
      setAISuggestions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSuggestion = async (id: string) => {
    try {
      await rejectAISuggestion(id);
      setAISuggestions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Initialize edit node inputs
  const startEditingNode = () => {
    if (!selectedNode) return;
    setEditNodeLabel(selectedNode.label);
    setEditNodeRisk(selectedNode.risk || 50);
    setEditNodeAge(selectedNode.age || 30);
    setEditNodeStatus(selectedNode.status || 'Active');
    setEditNodeMo(selectedNode.mo || '');
    setIsEditingNode(true);
  };

  const toggleGroupVisibility = (group: string) => {
    setHiddenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto h-[680px] min-h-0">
      {/* SIDEBAR FOR BUILDER FORMS */}
      <div className="xl:col-span-1 flex flex-col gap-4 h-full min-h-0">
        
        {/* TAB CONTROLLERS */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-bg-secondary border border-border-color rounded-lg">
          {[
            { id: 'inspector', label: 'Inspect', icon: User },
            { id: 'addNode', label: '+ Entity', icon: Plus },
            { id: 'addEdge', label: '+ Link', icon: Share2 },
            { id: 'suggestions', label: 'AI Link', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsEditingNode(false); }}
              className={`py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition ${
                activeTab === tab.id
                  ? 'bg-[#143D73] text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
              {tab.id === 'suggestions' && aiSuggestions.length > 0 && (
                <span className="bg-danger text-white rounded-full px-1 py-0.5 text-[8px] leading-none animate-pulse">
                  {aiSuggestions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="card-panel p-4 flex-1 overflow-y-auto min-h-0 flex flex-col">
          
          {/* TAB 1: INSPECTOR & DETAILS */}
          {activeTab === 'inspector' && (
            <div className="flex flex-col gap-4 h-full">
              {selectedNode ? (
                isEditingNode ? (
                  /* EDIT NODE FORM */
                  <form onSubmit={handleEditNodeSubmit} className="flex flex-col gap-3 text-xs">
                    <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Edit2 size={13} /> Edit Entity Details
                    </h4>
                    
                    <div>
                      <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">Entity Name / Label</label>
                      <input
                        type="text"
                        required
                        value={editNodeLabel}
                        onChange={(e) => setEditNodeLabel(e.target.value)}
                        className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">Risk Score Index: {editNodeRisk}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editNodeRisk}
                        onChange={(e) => setEditNodeRisk(Number(e.target.value))}
                        className="w-full h-1 bg-bg-primary accent-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">Age</label>
                        <input
                          type="number"
                          required
                          value={editNodeAge}
                          onChange={(e) => setEditNodeAge(Number(e.target.value))}
                          className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">Status</label>
                        <input
                          type="text"
                          required
                          value={editNodeStatus}
                          onChange={(e) => setEditNodeStatus(e.target.value)}
                          className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">Modus Operandi Details</label>
                      <textarea
                        value={editNodeMo}
                        onChange={(e) => setEditNodeMo(e.target.value)}
                        rows={3}
                        className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent"
                      />
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-success hover:bg-success-dark text-white rounded font-bold transition flex items-center justify-center gap-1"
                      >
                        <Check size={13} /> Save Edits
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingNode(false)}
                        className="py-2 px-3 bg-bg-tertiary border border-border-color hover:text-accent rounded font-bold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* RENDER SELECTED NODE DETAILS */
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-center border-b border-border-color pb-2">
                      <span className={`badge ${
                        selectedNode.group === 'criminal' ? 'badge-danger' :
                        selectedNode.group === 'gang' ? 'badge-warning' :
                        selectedNode.group === 'fir' ? 'badge-info' : 'badge-success'
                      }`}>
                        {selectedNode.group}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold">{selectedNode.id}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-text-primary font-outfit">
                        {maskPII && selectedNode.group === 'phone' ? maskPIIData(selectedNode.label, 'phone') : selectedNode.label}
                      </h3>
                      {selectedNode.age && (
                        <span className="text-[10px] text-text-muted block mt-0.5 font-mono">Age: {selectedNode.age} • Year Registered: {selectedNode.year}</span>
                      )}
                    </div>

                    {selectedNode.risk !== undefined && (
                      <div className="bg-bg-tertiary p-2.5 rounded border border-border-color/30 flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-semibold">AI Threat Risk Index:</span>
                        <span className={`font-extrabold text-xs font-mono ${selectedNode.risk > 80 ? 'text-danger animate-pulse' : selectedNode.risk > 50 ? 'text-warning' : 'text-success'}`}>
                          {selectedNode.risk}%
                        </span>
                      </div>
                    )}

                    {selectedNode.status && (
                      <div className="text-xs">
                        <span className="text-text-secondary block mb-1">Incident Status:</span>
                        <span className="badge badge-warning">{selectedNode.status}</span>
                      </div>
                    )}

                    {selectedNode.mo && (
                      <div className="text-xs">
                        <span className="text-text-secondary block mb-1 font-semibold">Intelligence / MO Profile:</span>
                        <p className="p-2 bg-bg-primary rounded border border-border-color text-text-secondary leading-relaxed text-[10px]">
                          {selectedNode.mo}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 border-t border-border-color pt-3 mt-auto">
                      <button
                        onClick={startEditingNode}
                        className="flex-1 py-1.5 bg-bg-tertiary border border-border-color rounded text-[11px] font-bold text-text-secondary hover:text-accent transition flex items-center justify-center gap-1"
                      >
                        <Edit2 size={12} /> Edit Entity
                      </button>
                      <button
                        onClick={handleDeleteSelectedNode}
                        className="p-1.5 bg-danger/10 border border-danger/20 text-danger rounded hover:bg-danger hover:text-white transition"
                        title="Prune Node from Network"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              ) : selectedEdgeId ? (
                /* EDGE INSPECTOR */
                <div className="flex flex-col gap-3 h-full justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 border-b border-border-color pb-1.5 flex items-center gap-1">
                      <Share2 size={13} /> Connection Inspector
                    </h4>
                    
                    {(() => {
                      const edge = edges.find(e => e.id === selectedEdgeId);
                      if (!edge) return null;
                      const fromNode = nodes.find(n => n.id === edge.from);
                      const toNode = nodes.find(n => n.id === edge.to);
                      return (
                        <div className="flex flex-col gap-2.5 text-xs text-text-secondary">
                          <div>
                            <span className="text-[10px] text-text-muted uppercase block font-bold font-mono">Source Node:</span>
                            <span className="text-text-primary font-bold">{fromNode?.label || edge.from}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-muted uppercase block font-bold font-mono">Link Relationship:</span>
                            <span className="badge badge-warning inline-block">{edge.label || 'CONNECTED'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-muted uppercase block font-bold font-mono">Target Node:</span>
                            <span className="text-text-primary font-bold">{toNode?.label || edge.to}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={handleDeleteSelectedEdge}
                    className="w-full py-1.5 bg-danger/10 border border-danger/20 text-danger rounded text-[11px] font-bold hover:bg-danger hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} /> Delete Connection Link
                  </button>
                </div>
              ) : (
                /* INSTRUCTIONS OR GENERAL SEARCH */
                <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-10">
                  <HelpCircle className="w-8 h-8 mb-2 text-border-color animate-bounce" />
                  <p className="text-xs text-text-secondary">Click a node or connection line on the canvas to inspect or edit details.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE NODE (ENTITY) */}
          {activeTab === 'addNode' && (
            <form onSubmit={handleCreateNode} className="flex flex-col gap-3 text-xs h-full">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Plus size={14} className="text-accent" /> Create New Entity
              </h4>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Unique Badge ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CRIM-8812, PHONE-YASHAS"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Display Label / Name</label>
                <input
                  type="text"
                  required
                  placeholder="Yashas Kumar, +91 99XXXX"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1 font-mono">Group Type</label>
                  <select
                    value={newNodeGroup}
                    onChange={(e) => setNewNodeGroup(e.target.value)}
                    className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer"
                  >
                    <option value="criminal">Criminal</option>
                    <option value="gang">Gang</option>
                    <option value="fir">FIR Case</option>
                    <option value="phone">Phone</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="weapon">Weapon</option>
                    <option value="address">Address</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1 font-mono">Timeline Year</label>
                  <select
                    value={newNodeYear}
                    onChange={(e) => setNewNodeYear(Number(e.target.value))}
                    className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer font-bold text-accent"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Risk Rating Score: {newNodeRisk}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newNodeRisk}
                  onChange={(e) => setNewNodeRisk(Number(e.target.value))}
                  className="w-full h-1 bg-bg-primary accent-accent"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Intelligence / MO Notes</label>
                <textarea
                  placeholder="Voltage spike details or suspect status..."
                  value={newNodeMo}
                  onChange={(e) => setNewNodeMo(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded font-bold transition flex items-center justify-center gap-1.5 border border-[#1b4b8c] mt-auto"
              >
                <Plus size={13} /> Log Entity in Graph
              </button>
            </form>
          )}

          {/* TAB 3: CREATE EDGE (RELATIONSHIP) */}
          {activeTab === 'addEdge' && (
            <form onSubmit={handleCreateEdge} className="flex flex-col gap-3 text-xs h-full">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Share2 size={14} /> Link Custom Relationship
              </h4>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Source Node Entity</label>
                <select
                  required
                  value={newEdgeFrom}
                  onChange={(e) => setNewEdgeFrom(e.target.value)}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer"
                >
                  <option value="">-- Choose Source --</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Relationship / Edge Type</label>
                <select
                  value={newEdgeLabel}
                  onChange={(e) => setNewEdgeLabel(e.target.value)}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer font-bold text-accent"
                >
                  <option value="Uses Phone">Uses Phone</option>
                  <option value="Owns Vehicle">Owns Vehicle</option>
                  <option value="Connected to">Connected to</option>
                  <option value="Present in FIR">Present in FIR</option>
                  <option value="Visited Location">Visited Location</option>
                  <option value="Known Member of">Known Member of</option>
                  <option value="Weapon Used in">Weapon Used in</option>
                  <option value="ACCOMPLICE">Accomplice Association</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1 font-mono">Target Node Entity</label>
                <select
                  required
                  value={newEdgeTo}
                  onChange={(e) => setNewEdgeTo(e.target.value)}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer"
                >
                  <option value="">-- Choose Target --</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center py-2 bg-bg-primary/50 border border-border-color/30 px-3 rounded-lg">
                <span className="font-semibold text-text-secondary">Dashed Layout (Associates)</span>
                <input
                  type="checkbox"
                  checked={newEdgeDashes}
                  onChange={(e) => setNewEdgeDashes(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1 font-mono">Timeline Year</label>
                <select
                  value={newEdgeYear}
                  onChange={(e) => setNewEdgeYear(Number(e.target.value))}
                  className="w-full bg-bg-primary text-text-primary px-2.5 py-1.5 rounded border border-border-color outline-none cursor-pointer"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!newEdgeFrom || !newEdgeTo}
                className="w-full py-2 bg-[#143D73] hover:bg-[#1b4b8c] text-white rounded font-bold transition flex items-center justify-center gap-1.5 border border-[#1b4b8c] mt-auto disabled:opacity-50"
              >
                <Plus size={13} /> Link Relationship
              </button>
            </form>
          )}

          {/* TAB 4: AI LINK SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            <div className="flex flex-col gap-3 h-full">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-accent animate-pulse" /> AI Hidden Link Detector
              </h4>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Emergent Link Analysis suggests connections based on shared MO vectors, CDR overlaps, and spatiotemporal matches.
              </p>

              <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-1">
                {aiSuggestions.length > 0 ? (
                  aiSuggestions.map(sug => {
                    const fromNode = nodes.find(n => n.id === sug.from);
                    const toNode = nodes.find(n => n.id === sug.to);
                    return (
                      <div key={sug.id} className="p-3 bg-bg-primary rounded-lg border border-[#143D73]/25 flex flex-col gap-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="badge badge-warning text-[9px] uppercase tracking-normal">
                            {sug.type}
                          </span>
                          <span className="text-[10px] text-success font-extrabold font-mono">
                            {sug.confidence}% Match
                          </span>
                        </div>

                        <div className="text-[10px] text-text-primary leading-tight font-semibold flex items-center gap-1.5">
                          <span>{fromNode?.label || sug.from}</span>
                          <ChevronRight size={10} className="text-text-muted" />
                          <span className="text-accent">{sug.label}</span>
                          <ChevronRight size={10} className="text-text-muted" />
                          <span>{toNode?.label || sug.to}</span>
                        </div>

                        <p className="text-[9px] text-text-secondary leading-relaxed border-t border-border-color/30 pt-1">
                          <strong>Reason:</strong> {sug.reason}
                        </p>

                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleAcceptSuggestion(sug.id)}
                            className="flex-1 py-1 bg-success/10 border border-success/20 text-success text-[10px] font-bold rounded hover:bg-success hover:text-white transition"
                          >
                            Accept Suggestion
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectSuggestion(sug.id)}
                            className="py-1 px-2.5 bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold rounded hover:bg-danger hover:text-white transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-10">
                    <CheckCircle2 className="w-8 h-8 text-success mb-2" />
                    <p className="text-xs text-text-secondary font-bold">Network database optimized.</p>
                    <p className="text-[9px] text-text-muted">No pending hidden relationship recommendations flagged.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MAIN GRAPH CANVAS AREA */}
      <div className="xl:col-span-3 card-panel p-4 flex flex-col h-full relative min-w-0">
        
        {/* GRAPH HEADER SEARCH & TIMELINE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-color pb-3 mb-3.5">
          <form onSubmit={handleSearchFocus} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
              <input
                type="text"
                placeholder="Search Entity Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bg-primary text-text-primary text-xs pl-8 pr-3 py-1.5 rounded border border-border-color outline-none focus:border-accent w-48 font-semibold"
              />
            </div>
            <button
              type="submit"
              className="py-1.5 px-3 bg-[#143D73] hover:bg-[#1b4b8c] text-white text-xs font-bold rounded border border-[#1b4b8c] transition"
            >
              Zoom Node
            </button>
          </form>

          {/* TIMELINE SLIDER CONTROL */}
          <div className="flex items-center gap-3 bg-bg-secondary border border-border-color px-3.5 py-1 rounded-lg text-xs">
            <Calendar size={13} className="text-accent" />
            <span className="font-mono font-bold text-text-secondary">Chronological:</span>
            <input
              type="range"
              min="2024"
              max="2026"
              value={timelineYear}
              onChange={(e) => setTimelineYear(Number(e.target.value))}
              className="w-24 bg-bg-primary accent-accent h-1 cursor-pointer"
            />
            <span className="font-bold text-accent font-mono text-sm leading-none bg-[#143D73]/10 border border-[#143D73]/30 px-2 py-0.5 rounded">
              {timelineYear}
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2">
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-bg-tertiary border border-border-color rounded hover:text-accent transition"
              title="Reset View & Scale Canvas"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 bg-bg-tertiary border border-border-color rounded hover:text-accent transition"
              title="Recalculate Network Physics Springs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-accent' : ''} />
            </button>
          </div>
        </div>

        {/* VIS NETWORK PLOT CANVASES */}
        <div className="flex-1 rounded-lg bg-bg-primary border border-border-color overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-bg-primary/50 backdrop-blur-sm z-10 flex items-center justify-center gap-2 text-xs">
              <RefreshCw size={16} className="animate-spin text-accent" />
              <span>Calculating spring forces...</span>
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
          
          {/* FLOATING LEGEND */}
          <div className="absolute bottom-3 left-3 bg-bg-secondary/90 border border-border-color rounded-lg p-2.5 z-10 flex gap-3 text-[9px] font-mono leading-none backdrop-blur shadow-md">
            {[
              { key: 'criminal', label: 'Criminal (Dot)', color: 'bg-red-700 border-red-500' },
              { key: 'gang', label: 'Gang (Triangle)', color: 'bg-purple-950 border-purple-500' },
              { key: 'fir', label: 'FIR (Square)', color: 'bg-blue-950 border-blue-500' },
              { key: 'vehicle', label: 'Vehicle', color: 'bg-orange-800 border-orange-500' },
              { key: 'phone', label: 'Phone', color: 'bg-emerald-950 border-emerald-500' },
              { key: 'weapon', label: 'Weapon', color: 'bg-amber-900 border-amber-500' },
              { key: 'address', label: 'Address', color: 'bg-slate-900 border-sky-500' }
            ].map(group => (
              <button 
                key={group.key}
                onClick={() => toggleGroupVisibility(group.key)}
                className={`flex items-center gap-1.5 p-1 border rounded hover:opacity-80 transition ${
                  hiddenGroups[group.key] ? 'opacity-30 line-through border-transparent' : 'border-border-color'
                }`}
                title={`Click to show/hide ${group.key} nodes`}
              >
                <span className={`w-2.5 h-2.5 rounded-full border ${group.color}`}></span>
                <span>{group.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
