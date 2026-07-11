import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Layers, Navigation, RefreshCw } from 'lucide-react';
import { fetchHotspots } from '../utils/api';

// Fixing Leaflet default marker icon asset paths
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Hotspot {
  id: string;
  district: string;
  center: [number, number];
  radius: number;
  label: string;
  riskLevel: 'High' | 'Medium' | 'Low' | string;
  suggestedPatrol: string;
  lastIncident: string;
}

interface DistrictStat {
  name: string;
  crimeIndex: number;
  predictionsCount: number;
  hotspotsCount: number;
  casesCount: number;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low' | string;
}

export const HotspotMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [districts, setDistricts] = useState<DistrictStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");

  const loadHotspots = async () => {
    setLoading(true);
    try {
      const data = await fetchHotspots();
      setHotspots(data.hotspots.map(h => ({ ...h, center: h.center as [number, number] })));
      setDistricts(data.districtStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946], // Bengaluru coordinates
      zoom: 7,
      zoomControl: true,
    });

    // CartoDB Dark Matter tile layer (will automatically adapt styling via CSS filters)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a> contributors'
    }).addTo(map);

    // Layer Group to hold hotspot circles
    const circlesLayer = L.layerGroup().addTo(map);
    circlesLayerRef.current = circlesLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Hotspot Circles on Map when hotspots data changes
  useEffect(() => {
    if (!mapRef.current || !circlesLayerRef.current || hotspots.length === 0) return;

    // Clear previous circles
    circlesLayerRef.current.clearLayers();

    hotspots.forEach(hs => {
      const color = hs.riskLevel === 'High' ? '#ff1744' : '#ffc400';
      const circle = L.circle(hs.center, {
        color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 1.5,
        radius: hs.radius
      });

      // Bind dynamic Popup
      circle.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 4px; color: #fff;">
          <h4 style="color: #d4af37; font-weight: bold; margin-bottom: 5px; font-size: 12px;">${hs.label}</h4>
          <p style="margin: 2px 0;"><b>Risk Status:</b> <span style="color: ${color}; font-weight: bold;">${hs.riskLevel}</span></p>
          <p style="margin: 2px 0;"><b>Active Patrol:</b> ${hs.suggestedPatrol}</p>
          <p style="margin: 2px 0; color: #94a3b8;"><b>Last Recurrence:</b> ${hs.lastIncident}</p>
        </div>
      `);

      circlesLayerRef.current?.addLayer(circle);
    });
  }, [hotspots]);

  // Center Map on District Selection (District Drilldowns)
  const handleDistrictClick = (districtName: string) => {
    setSelectedDistrict(districtName);
    if (!mapRef.current) return;

    if (districtName === "All Districts") {
      mapRef.current.setView([12.9716, 77.5946], 7);
      return;
    }

    // Coordinates mapping for district centers
    const districtCoords: { [key: string]: { lat: number; lng: number; zoom: number } } = {
      "Bengaluru City": { lat: 12.9250, lng: 77.6100, zoom: 12 },
      "Mysuru City": { lat: 12.2900, lng: 76.6450, zoom: 13 },
      "Mangaluru": { lat: 12.8730, lng: 74.8560, zoom: 13 },
      "Hubballi-Dharwad": { lat: 15.3647, lng: 75.1240, zoom: 12 },
      "Belagavi": { lat: 15.8497, lng: 74.4977, zoom: 12 }
    };

    const target = districtCoords[districtName];
    if (target) {
      mapRef.current.setView([target.lat, target.lng], target.zoom);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto h-[600px]">
      {/* Sidebar - District drilldowns */}
      <div className="lg:col-span-1 card-panel p-4 flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between border-b border-border-color pb-3 mb-3">
          <h3 className="text-xs font-bold text-accent flex items-center gap-1.5 font-outfit uppercase tracking-wider">
            <Layers size={15} /> District Control
          </h3>
          <button 
            onClick={loadHotspots} 
            disabled={loading}
            className="p-1 bg-bg-tertiary border border-border-color rounded text-text-secondary hover:text-accent transition"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-accent' : ''} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {/* All Districts Reset */}
          <button
            onClick={() => handleDistrictClick("All Districts")}
            className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
              selectedDistrict === "All Districts"
                ? 'bg-primary text-white border-[#143D73] shadow-sm'
                : 'bg-bg-tertiary text-text-secondary border-border-color hover:bg-bg-secondary hover:text-text-primary'
            }`}
          >
            <span>Overview (All Districts)</span>
            <Map size={14} />
          </button>

          {districts.map(d => (
            <button
              key={d.name}
              onClick={() => handleDistrictClick(d.name)}
              className={`p-3 rounded-lg text-left transition border flex flex-col gap-1.5 ${
                selectedDistrict === d.name
                  ? 'bg-primary text-white border-[#143D73] shadow-sm'
                  : 'bg-bg-tertiary text-text-secondary border-border-color hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold text-xs ${selectedDistrict === d.name ? 'text-white' : 'text-text-primary'}`}>{d.name}</span>
                <span className={`badge ${
                  d.severity === 'Critical' ? 'badge-danger' :
                  d.severity === 'High' ? 'badge-danger' :
                  d.severity === 'Moderate' ? 'badge-warning' : 'badge-success'
                }`}>
                  {d.severity}
                </span>
              </div>
              <div className={`flex items-center justify-between text-[10px] ${selectedDistrict === d.name ? 'text-white/80' : 'text-text-muted'}`}>
                <span>Crime Rank: {d.crimeIndex}/100</span>
                <span>Hotspots: {d.hotspotsCount}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Box */}
      <div className="lg:col-span-3 card-panel p-4 flex flex-col h-full dark-leaflet-map min-w-0">
        <div className="flex items-center justify-between border-b border-border-color pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="text-accent w-4 h-4" />
            <span className="text-xs text-text-secondary font-mono">
              Live Hotspot & Patrol GPS Map Tracker
            </span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span> High Risk Area</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block"></span> Moderate Risk Area</span>
          </div>
        </div>

        {/* Map div container */}
        <div className="flex-1 rounded-lg overflow-hidden border border-border-color relative">
          {loading && (
            <div className="absolute inset-0 bg-bg-primary/50 backdrop-blur-sm z-[1000] flex items-center justify-center gap-2">
              <RefreshCw size={20} className="animate-spin text-accent" />
              <span className="text-sm">Downloading tile assets...</span>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '380px', zIndex: 1 }} />
        </div>
      </div>
    </div>
  );
};
