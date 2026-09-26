import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Globe, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { IPGeoResult } from '../types';

interface GeoMapProps {
  geoLocations: IPGeoResult[];
}

export const GeoMap: React.FC<GeoMapProps> = ({ geoLocations }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const publicGeos = geoLocations.filter(
    g => g.latitude !== 0 && g.longitude !== 0 && g.country !== 'Internal Network'
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center or first IP coordinate
    const centerLat = publicGeos.length > 0 ? publicGeos[0].latitude : 25;
    const centerLon = publicGeos.length > 0 ? publicGeos[0].longitude : 10;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLon],
      zoom: publicGeos.length > 0 ? 3 : 2,
      minZoom: 1,
      maxZoom: 18,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Free OpenStreetMap Tile Layer (Zero API Key Required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Plot pins
    publicGeos.forEach(geo => {
      const threatScore = geo.threat_score ?? geo.threatScore ?? 0;
      // Green for standard route, Amber for medium, Red for high threat
      const markerColor = threatScore >= 70 ? '#DC2626' : threatScore >= 40 ? '#D97706' : '#059669';

      // Custom SVG pulsing circle marker
      const customIcon = L.divIcon({
        className: 'custom-geo-marker',
        html: `
          <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${markerColor}33; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 13px; height: 13px; border-radius: 50%; background: ${markerColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 8px ${markerColor}88;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([geo.latitude, geo.longitude], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0F172A; min-width: 190px; padding: 4px;">
          <div style="font-weight: 700; font-family: monospace; color: #059669; font-size: 13px; margin-bottom: 4px;">
            ${geo.ip}
          </div>
          <div style="color: #334155; font-weight: 500; margin-bottom: 2px;">
            ${geo.city ? `${geo.city}, ` : ''}${geo.country}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            ${geo.org || geo.isp || geo.asn || 'Public Transit AS'}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 6px; margin-top: 4px;">
            <span style="font-size: 11px; color: #64748B; font-weight: 500;">Threat Score:</span>
            <span style="font-family: monospace; font-weight: 700; font-size: 12px; color: ${markerColor};">
              ${threatScore}/100
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
    });

    // Auto-fit bounds if multiple points
    if (publicGeos.length > 1) {
      const bounds = L.latLngBounds(publicGeos.map(g => [g.latitude, g.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoLocations]);

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            IP Geolocation & Network Infrastructure
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-600 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span>High Threat</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Standard Route</span>
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900 font-bold">Forensic Geolocation Notice:</strong> IP geolocation represents an approximate network location and does not establish the physical location or identity of an individual. Network points of presence, VPN egress nodes, and datacenter relays often route traffic across disparate sovereign jurisdictions.
        </p>
      </div>
    </div>
  );
};
