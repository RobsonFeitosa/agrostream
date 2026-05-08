import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CloudRain,
  Cloud,
  Sun,
  Droplets,
  Gauge,
  Layers,
  Locate,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Search,
  Settings,
  Tractor,
  Wifi,
  Wind,
  ChevronDown,
  Satellite,
  Leaf,
  Zap,
  TrendingUp,
  X,
  Map as MapIcon,
  UserCircle2,
  Bell as BellIcon,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Map,
  useMap,
  AdvancedMarker,
  InfoWindow,
  ControlPosition,
  MapControl
} from "@vis.gl/react-google-maps";


type Sector = "All sectors" | "Sector A" | "Sector B" | "Sector C" | "Sector D";

const SECTORS: Sector[] = ["All sectors", "Sector A", "Sector B", "Sector C", "Sector D"];

interface Field {
  id: string;
  name: string;
  sector: Sector;
  crop: string;
  area: string;
  ndvi: number;
  status: "good" | "warn" | "bad";
  type: "polygon" | "circle";
  path?: { lat: number; lng: number }[];
  center?: { lat: number; lng: number };
  radius?: number;
}

type Tractor = { id: string; sector: Sector; status: string; fuel: number; speed: number; idle: boolean; driver: string; lat: number; lng: number };
type Weather = { id: string; sector: Sector; label: string; sub: string; icon: "sun" | "rain" | "cloud" | "wind"; lat: number; lng: number };

const LAT_BASE = -16.8623;
const LNG_BASE = -47.5784;

const FIELDS: Field[] = [

  {
    id: "F-101",
    name: "Main Pivot North",
    sector: "Sector A",
    crop: "Corn",
    area: "110 ha",
    ndvi: 0.88,
    status: "good",
    type: "circle",
    center: { lat: -16.8580, lng: -47.5695 },
    radius: 360,
  },
  {
    id: "F-103",
    name: "West Pivot Green",
    sector: "Sector A",
    crop: "Cotton",
    area: "95 ha",
    ndvi: 0.45,
    status: "warn",
    type: "circle",
    center: { lat: -16.8645, lng: -47.5855 },
    radius: 320,
  },
  {
    id: "F-102",
    name: "Central Soybean",
    sector: "Sector B",
    crop: "Soybeans",
    area: "145 ha",
    ndvi: 0.76,
    status: "good",
    type: "polygon",
    path: [
      { lat: -16.8610, lng: -47.5780 },
      { lat: -16.8610, lng: -47.5730 },
      { lat: -16.8660, lng: -47.5730 },
      { lat: -16.8660, lng: -47.5780 },
    ],
  },
  {
    id: "F-104",
    name: "East Rectangle",
    sector: "Sector C",
    crop: "Wheat",
    area: "68 ha",
    ndvi: 0.32,
    status: "bad",
    type: "polygon",
    path: [
      { lat: -16.8665, lng: -47.5720 },
      { lat: -16.8665, lng: -47.5680 },
      { lat: -16.8710, lng: -47.5680 },
      { lat: -16.8710, lng: -47.5720 },
    ],
  },
  {
    id: "F-105",
    name: "Southwest Block",
    sector: "Sector D",
    crop: "Soybeans",
    area: "112 ha",
    ndvi: 0.72,
    status: "good",
    type: "polygon",
    path: [
      { lat: -16.8670, lng: -47.5830 },
      { lat: -16.8730, lng: -47.5830 },
      { lat: -16.8730, lng: -47.5790 },
      { lat: -16.8670, lng: -47.5790 },
    ],
  },
  {
    id: "F-106",
    name: "Small Central",
    sector: "Sector B",
    crop: "Corn",
    area: "32 ha",
    ndvi: 0.58,
    status: "warn",
    type: "polygon",
    path: [
      { lat: -16.8662, lng: -47.5775 },
      { lat: -16.8662, lng: -47.5755 },
      { lat: -16.8678, lng: -47.5755 },
      { lat: -16.8678, lng: -47.5775 },
    ],
  }
];

const TRACTORS: Tractor[] = [
  { id: "TR-01", sector: "Sector B", status: "Active", fuel: 82, speed: 8.4, idle: false, driver: "M. Alvarez", lat: -16.8623, lng: -47.5784 },
  { id: "TR-03", sector: "Sector C", status: "Idle", fuel: 45, speed: 0, idle: true, driver: "J. Okafor", lat: -16.8645, lng: -47.5812 },
  { id: "TR-07", sector: "Sector B", status: "Active", fuel: 76, speed: 11.2, idle: false, driver: "P. Santos", lat: -16.8605, lng: -47.5745 },
  { id: "TR-19", sector: "Sector B", status: "Active", fuel: 89, speed: 12.5, idle: false, driver: "A. Paula", lat: -16.8590, lng: -47.5730 },
  { id: "TR-22", sector: "Sector A", status: "Active", fuel: 91, speed: 9.6, idle: false, driver: "L. Lima", lat: -16.8575, lng: -47.5700 },
];

const WEATHER: Weather[] = [
  { id: "w1", sector: "Sector B", label: "12mm", sub: "Rain", icon: "rain", lat: -16.8665, lng: -47.5740 },
  { id: "w2", sector: "Sector A", label: "28°C", sub: "Sunny", icon: "sun", lat: -16.8560, lng: -47.5670 },
  { id: "w3", sector: "Sector C", label: "22°C", sub: "Cloudy", icon: "cloud", lat: -16.8685, lng: -47.5780 },
  { id: "w4", sector: "Sector D", label: "24km/h", sub: "Windy", icon: "wind", lat: -16.8625, lng: -47.5860 },
];


type Alert = {
  id: string;
  severity: "bad" | "warn" | "info";
  title: string;
  detail: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  fieldId?: string;
};

const ALERTS: Alert[] = [
  { id: "a1", severity: "warn", title: "Rain expected in Sector B", detail: "12mm in next 6h · pause spraying ops", time: "8 min ago", icon: CloudRain, fieldId: "F-103" },
  { id: "a2", severity: "bad", title: "NDVI drop on Field F-104", detail: "Vigor below 0.30 — inspect irrigation", time: "21 min ago", icon: AlertTriangle, fieldId: "F-104" },
  { id: "a3", severity: "info", title: "TR-03 idle for 38 min", detail: "Sector C · last ping 14:22", time: "38 min ago", icon: Tractor, fieldId: "F-105" },
  { id: "a4", severity: "warn", title: "Soil moisture below target", detail: "Sector D average 18% (target 24%)", time: "1 h ago", icon: Droplets, fieldId: "F-108" },
];

const STATUS_COLORS = {
  good: { stroke: "rgba(74, 222, 128, 0.95)", fill: "rgba(34, 197, 94, 0.18)", dot: "bg-emerald-400" },
  warn: { stroke: "rgba(250, 204, 21, 0.95)", fill: "rgba(234, 179, 8, 0.18)", dot: "bg-amber-400" },
  bad: { stroke: "rgba(248, 113, 113, 0.95)", fill: "rgba(239, 68, 68, 0.18)", dot: "bg-rose-400" },
};

export default function Index() {
  const [sector, setSector] = useState<Sector>("All sectors");
  const [sectorOpen, setSectorOpen] = useState(false);
  const [layers, setLayers] = useState({ ndvi: true, gps: true, weather: true });

  const [fullscreen, setFullscreen] = useState(false);

  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLiveTick((n) => n + 1), 2500);
    return () => clearInterval(t);
  }, []);

  const visibleFields = useMemo(
    () => FIELDS.filter((f) => sector === "All sectors" || f.sector === sector),
    [sector],
  );
  const visibleTractors = useMemo(
    () => TRACTORS.filter((t) => sector === "All sectors" || t.sector === sector),
    [sector],
  );
  const visibleWeather = useMemo(
    () => WEATHER.filter((w) => sector === "All sectors" || w.sector === sector),
    [sector],
  );

  const activeMachines = visibleTractors.filter((t) => !t.idle).length;
  const totalMachines = visibleTractors.length;
  const moistureBase = sector === "Sector D" ? 18 : sector === "Sector B" ? 31 : 26;
  const moisture = Math.max(10, Math.min(40, moistureBase + Math.sin(liveTick / 2) * 2));
  const machineryProgress = ((activeMachines / Math.max(totalMachines, 1)) * 100) + Math.cos(liveTick) * 3;

  const searchResults = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    const sources: { type: string; id: string; label: string; sub: string; field?: Field }[] = [
      ...FIELDS.map((f) => ({ type: "Field", id: f.id, label: `${f.id} · ${f.name}`, sub: `${f.sector} · ${f.crop}`, field: f })),
      ...TRACTORS.map((t) => ({ type: "Machine", id: t.id, label: `${t.id} · ${t.driver}`, sub: `${t.sector} · ${t.idle ? "idle" : t.speed + " km/h"}` })),
      ...SECTORS.filter((s) => s !== "All sectors").map((s) => ({ type: "Sector", id: s, label: s, sub: "Farm sector" })),
    ];
    if (!q) return sources.slice(0, 6);
    return sources.filter((s) => s.label.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQ]);

  const map = useMap("onemap");

  const handleZoom = (delta: number) => {
    if (!map) return;
    map.setZoom((map.getZoom() || 15) + delta);
  };

  const focusField = (fieldId: string) => {
    const f = FIELDS.find((x) => x.id === fieldId);
    if (!f) return;
    if (sector !== "All sectors" && f.sector !== sector) setSector("All sectors");
    setHighlightedFieldId(f.id);
    setSelectedField(f);
    
    if (map) {
      if (f.type === "circle" && f.center) {
        map.panTo(f.center);
      } else if (f.type === "polygon" && f.path) {
        map.panTo(f.path[0]);
      }
      map.setZoom(17);
    }
    setTimeout(() => setHighlightedFieldId(null), 2400);
  };

  const resetView = () => {
    if (map && visibleFields.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      visibleFields.forEach(f => {
        if (f.type === "circle" && f.center && f.radius) {
          const circleBounds = new google.maps.Circle({ center: f.center, radius: f.radius }).getBounds();
          if (circleBounds) bounds.union(circleBounds);
        } else if (f.type === "polygon" && f.path) {
          f.path.forEach(p => bounds.extend(p));
        }
      });

      map.fitBounds(bounds);
    } else if (map) {
      map.panTo({ lat: LAT_BASE, lng: LNG_BASE });
      map.setZoom(17);
    }
  };


  useEffect(() => {
    if (map && visibleFields.length > 0) {
      resetView();
    }
  }, [map, sector]);


  return (
    <div className="dark">
      <div className="min-h-screen bg-[#070b10] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#070b10]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
                <Leaf className="h-4 w-4 text-emerald-950" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">AgroStream Operations</h1>
                <p className="text-[11px] text-zinc-500">Live farm control · 4 sectors · 11 fields</p>
              </div>
            </div>

            <div className="relative hidden flex-1 max-w-md md:block">
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 focus-within:border-emerald-400/40">
                <Search className="h-3.5 w-3.5" />
                <input
                  className="w-full bg-transparent outline-none placeholder:text-zinc-600"
                  placeholder="Search fields, machinery, sensors…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
                />
                <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">⌘K</kbd>
              </div>
              {searchFocus && (
                <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-auto rounded-xl border border-white/5 bg-[#0b1117]/95 shadow-2xl backdrop-blur animate-in fade-in-0 zoom-in-95">
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-zinc-500">No matches for "{searchQ}"</div>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {searchResults.map((r) => (
                        <li key={r.type + r.id}>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              if (r.field) focusField(r.field.id);
                              setSearchFocus(false);
                              setSearchQ("");
                            }}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs hover:bg-white/[0.04]"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-zinc-200">{r.label}</div>
                              <div className="truncate text-[10px] text-zinc-500">{r.sub}</div>
                            </div>
                            <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                              {r.type}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <StatusPill icon={Wifi} label="GPS · 5/5" tone="good" />
              <StatusPill icon={Satellite} label="NDVI · 2h ago" tone="info" />

              <div className="relative">
                <button
                  onClick={() => { setNotifOpen((v) => !v); setSettingsOpen(false); }}
                  className="relative rounded-lg border border-white/5 bg-white/[0.03] p-2 hover:bg-white/[0.06] transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 text-zinc-300" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                </button>
                {notifOpen && (
                  <NotificationDropdown
                    onClose={() => setNotifOpen(false)}
                    onSelect={(a) => {
                      setNotifOpen(false);
                      if (a.fieldId) focusField(a.fieldId);
                    }}
                  />
                )}
              </div>

              <button
                onClick={() => { setSettingsOpen(true); setNotifOpen(false); }}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-2 hover:bg-white/[0.06] transition"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 text-zinc-300" />
              </button>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "grid grid-cols-1 gap-4 p-4 transition-all duration-300",
            fullscreen ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_360px]",
          )}
        >
          <section className="relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0b1117] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] lg:h-[calc(100vh-100px)]">

            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              <SectorDropdown value={sector} onChange={setSector} open={sectorOpen} setOpen={setSectorOpen} />
              <LayerToggle layers={layers} setLayers={setLayers} />
            </div>

            <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-white/5 bg-[#0b1117]/80 p-1 backdrop-blur">
              <IconBtn onClick={() => handleZoom(0.2)} title="Zoom in"><Plus className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn onClick={() => handleZoom(-0.2)} title="Zoom out"><Minus className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn onClick={resetView} title="Reset view"><Locate className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn onClick={() => setFullscreen((v) => !v)} title="Toggle fullscreen">
                {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </IconBtn>
            </div>



            <div className={cn("relative w-full flex-1 transition-all duration-500")}>


              <Map
                id="onemap"
                mapId={"bf51a910020fa25a"}
                defaultZoom={17}
                defaultCenter={{
                  lat: -16.8623,
                  lng: -47.5784,
                }}

                gestureHandling={"greedy"}
                disableDefaultUI={true}
                className="w-full h-full"
                mapTypeId="satellite"
              >
                {layers.ndvi &&

                  visibleFields.map((f) => (
                    <MapPolygon
                      key={f.id}
                      field={f}
                      isSelected={selectedField?.id === f.id}
                      isHighlighted={highlightedFieldId === f.id}
                      onClick={() => setSelectedField(f)}
                    />
                  ))}

                {layers.weather &&
                  visibleWeather.map((w) => (
                    <AdvancedMarker
                      key={w.id}
                      position={{
                        lat: w.lat,
                        lng: w.lng,
                      }}
                    >
                      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[11px] text-white/90 backdrop-blur">
                        {w.icon === "rain" && <CloudRain className="h-3.5 w-3.5 text-sky-400" />}
                        {w.icon === "sun" && <Sun className="h-3.5 w-3.5 text-amber-300" />}
                        {w.icon === "cloud" && <Cloud className="h-3.5 w-3.5 text-zinc-300" />}
                        {w.icon === "wind" && <Wind className="h-3.5 w-3.5 text-cyan-300" />}
                        <span className="font-medium">{w.label}</span>
                      </div>
                    </AdvancedMarker>
                  ))}

                {layers.gps &&
                  visibleTractors.map((t) => (
                    <AdvancedMarker
                      key={t.id}
                      position={{
                        lat: t.lat,
                        lng: t.lng,
                      }}
                    >
                      <div className="relative">
                        {!t.idle && <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-emerald-400/40" />}
                        <div
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center rounded-full border shadow-lg",
                            t.idle ? "border-amber-400/40 bg-amber-500/20 text-amber-300" : "border-emerald-400/40 bg-emerald-500/30 text-emerald-200",
                          )}
                        >
                          <Tractor className="h-4 w-4" />
                        </div>
                        <div className="absolute left-1/2 top-full mt-1 w-max -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white/90">
                          {t.id} · {t.idle ? "idle" : `${t.speed} km/h`}
                        </div>
                      </div>
                    </AdvancedMarker>
                  ))}

              </Map>


              {selectedField && (
                <FieldDetailCard field={selectedField} onClose={() => setSelectedField(null)} />
              )}

              <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 rounded-xl border border-white/5 bg-[#0b1117]/80 p-3 text-[11px] backdrop-blur">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">NDVI Vigor</div>
                <LegendRow color="bg-emerald-400" label="Healthy (0.65 – 1.0)" />
                <LegendRow color="bg-amber-400" label="Stressed (0.40 – 0.65)" />
                <LegendRow color="bg-rose-400" label="Critical (< 0.40)" />
              </div>

              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 rounded-xl border border-white/5 bg-[#0b1117]/80 px-3 py-2 text-[11px] text-zinc-400 backdrop-blur">
                <span>© AgroStream Maps</span>
                <span className="h-3 w-px bg-white/10" />
                <span>Imagery · Sentinel-2</span>
                <span className="h-3 w-px bg-white/10" />
                <span>200 m</span>
              </div>
            </div>
          </section>

          {!fullscreen && (
            <aside className="flex flex-col gap-4 overflow-y-auto lg:h-[calc(100vh-100px)] pr-2 custom-scrollbar">

              <MetricCard
                title="Active Machinery"
                value={`${activeMachines}/${totalMachines}`}
                hint={`${activeMachines} running · ${totalMachines - activeMachines} idle`}
                icon={<Tractor className="h-4 w-4" />}
                accent="emerald"
                progress={machineryProgress}
              />
              <MetricCard
                title="Soil Moisture (avg)"
                value={`${moisture.toFixed(0)}%`}
                hint={moisture < 22 ? "Below target — irrigation suggested" : "Within optimal range"}
                icon={<Droplets className="h-4 w-4" />}
                accent={moisture < 22 ? "amber" : "sky"}
                progress={moisture * 2.2}
              />

              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon={Gauge} label="Fuel" value="82%" tone="emerald" />
                <MiniStat icon={Activity} label="Yield est." value="+4.2%" tone="emerald" />
                <MiniStat icon={Zap} label="Energy" value="14.8 kWh" tone="sky" />
                <MiniStat icon={TrendingUp} label="NDVI avg" value="0.61" tone="amber" />
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0b1117]">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Alerts</h3>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    {ALERTS.length} new
                  </span>
                </div>
                <ul className="divide-y divide-white/5">
                  {ALERTS.map((a) => {
                    const Icon = a.icon;
                    const tone =
                      a.severity === "bad"
                        ? "bg-rose-500/15 text-rose-300 border-rose-400/20"
                        : a.severity === "warn"
                          ? "bg-amber-500/15 text-amber-300 border-amber-400/20"
                          : "bg-sky-500/15 text-sky-300 border-sky-400/20";
                    return (
                      <li key={a.id}>
                        <button
                          onClick={() => a.fieldId && focusField(a.fieldId)}
                          className="group flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <div className={cn("mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border", tone)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-zinc-100">{a.title}</p>
                            <p className="truncate text-[11px] text-zinc-500">{a.detail}</p>
                          </div>
                          <span className="shrink-0 text-[10px] text-zinc-600">{a.time}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          )}
        </main>

        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>
    </div>
  );
}

function NotificationDropdown({ onClose, onSelect }: { onClose: () => void; onSelect: (a: Alert) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/5 bg-[#0b1117]/95 shadow-2xl backdrop-blur animate-in fade-in-0 zoom-in-95"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <BellIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Recent Alerts</span>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">{ALERTS.length} new</span>
      </div>
      <ul className="max-h-96 divide-y divide-white/5 overflow-auto">
        {ALERTS.map((a) => {
          const Icon = a.icon;
          const tone =
            a.severity === "bad"
              ? "bg-rose-500/15 text-rose-300 border-rose-400/20"
              : a.severity === "warn"
                ? "bg-amber-500/15 text-amber-300 border-amber-400/20"
                : "bg-sky-500/15 text-sky-300 border-sky-400/20";
          return (
            <li key={a.id}>
              <button onClick={() => onSelect(a)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.04]">
                <div className={cn("mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border", tone)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zinc-100">{a.title}</p>
                  <p className="truncate text-[11px] text-zinc-500">{a.detail}</p>
                </div>
                <span className="shrink-0 text-[10px] text-zinc-600">{a.time}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-white/5 px-4 py-2 text-center">
        <button className="text-[11px] font-medium text-emerald-300 hover:text-emerald-200">View all notifications</button>
      </div>
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"map" | "user" | "devices">("map");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.addEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1117] shadow-2xl animate-in zoom-in-95">
        <aside className="w-48 border-r border-white/5 bg-[#070b10] p-3">
          <div className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">System Configurations</div>
          {([
            { k: "map", label: "Map Settings", icon: MapIcon },
            { k: "user", label: "User Profiles", icon: UserCircle2 },
            { k: "devices", label: "Device Integration", icon: Cpu },
          ] as const).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition",
                  tab === t.k ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </aside>
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                {tab === "map" ? "Map Settings" : tab === "user" ? "User Profiles" : "Device Integration"}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">Configure {tab === "map" ? "tiles, layers and projection" : tab === "user" ? "team members and access" : "sensors, gateways and APIs"}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {tab === "map" && (
              <>
                <ConfigRow label="Default basemap" value="Sentinel-2 Imagery" />
                <ConfigRow label="NDVI refresh interval" value="2h" />
                <ConfigRow label="Map projection" value="Web Mercator" />
                <ConfigRow label="Show field labels" value="Enabled" />
              </>
            )}
            {tab === "user" && (
              <>
                <ConfigRow label="Active operators" value="12" />
                <ConfigRow label="Default role" value="Field manager" />
                <ConfigRow label="2FA required" value="Enabled" />
                <ConfigRow label="Session timeout" value="30 min" />
              </>
            )}
            {tab === "devices" && (
              <>
                <ConfigRow label="Connected tractors" value="5 GPS units" />
                <ConfigRow label="Soil sensors" value="42 active" />
                <ConfigRow label="Weather stations" value="4 online" />
                <ConfigRow label="API gateway" value="EU-West · healthy" />
              </>
            )}
          </div>
          <div className="mt-8 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06]">Cancel</button>
            <button onClick={onClose} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        {value}
      </span>
    </div>
  );
}

function FieldDetailCard({ field, onClose }: { field: Field; onClose: () => void }) {
  const c = STATUS_COLORS[field.status];
  return (
    <div className="absolute left-1/2 top-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0b1117]/95 p-4 shadow-2xl backdrop-blur animate-in fade-in-0 zoom-in-95">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Detailed Field Analysis</div>
          <div className="mt-0.5 text-sm font-semibold text-zinc-100">{field.id} · {field.name}</div>
        </div>
        <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Soil Vigor NDVI</div>
          <div className="text-2xl font-semibold text-zinc-50">{field.ndvi.toFixed(2)}</div>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", field.status === "good" ? "bg-emerald-500/15 text-emerald-300" : field.status === "warn" ? "bg-amber-500/15 text-amber-300" : "bg-rose-500/15 text-rose-300")}>
          {field.status === "good" ? "Healthy" : field.status === "warn" ? "Stressed" : "Critical"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500"><Droplets className="h-3 w-3 text-sky-400" />Moisture</div>
          <div className="mt-0.5 text-sm font-semibold text-zinc-100">{field.moisture}%</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500"><Leaf className="h-3 w-3 text-emerald-400" />Crop</div>
          <div className="mt-0.5 text-sm font-semibold text-zinc-100">{field.crop}</div>
        </div>
        <div className="col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500"><Tractor className="h-3 w-3 text-emerald-400" />Machinery in sector</div>
          <div className="mt-0.5 text-sm font-semibold text-zinc-100">
            {TRACTORS.filter((t) => t.sector === field.sector).length} units · {TRACTORS.filter((t) => t.sector === field.sector && !t.idle).length} active
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.stroke }} />
        <span className="text-[11px] text-zinc-500">{field.sector} · live data stream</span>
      </div>
    </div>
  );
}

function MapPolygon({ 
  field, 
  isSelected, 
  isHighlighted, 
  onClick 
}: { 
  field: Field; 
  isSelected: boolean; 
  isHighlighted: boolean; 
  onClick: () => void 
}) {
  const map = useMap("onemap");
  const shapeRef = useRef<google.maps.Polygon | google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const c = STATUS_COLORS[field.status];
    const commonOptions = {
      strokeColor: isSelected || isHighlighted ? "#ffffff" : c.stroke,
      strokeOpacity: 0.8,
      strokeWeight: isSelected || isHighlighted ? 3 : 1.5,
      fillColor: c.fill.split(",")[0].replace("rgba(", "").trim() === "rgba(34" ? "#22c55e" : field.status === "warn" ? "#eab308" : "#ef4444",
      fillOpacity: isSelected || isHighlighted ? 0.4 : 0.2,
      map: map,
    };

    let shape: google.maps.Polygon | google.maps.Circle;

    if (field.type === "circle" && field.center && field.radius) {
      shape = new google.maps.Circle({
        ...commonOptions,
        center: field.center,
        radius: field.radius,
      });
    } else if (field.type === "polygon" && field.path) {
      shape = new google.maps.Polygon({
        ...commonOptions,
        paths: field.path,
      });
    } else {
      return;
    }

    shape.addListener("click", onClick);
    shapeRef.current = shape;

    return () => {
      shape.setMap(null);
    };
  }, [map, field, isSelected, isHighlighted, onClick]);

  const labelPos = field.type === "circle" ? field.center : field.path?.[0];
  const c = STATUS_COLORS[field.status];

  if (!labelPos) return null;

  return (
    <>
      <AdvancedMarker position={labelPos}>
        <div className="pointer-events-none flex items-center gap-1.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm border border-white/5 shadow-xl">
          <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
          {field.id}
        </div>
      </AdvancedMarker>
    </>
  );
}




function SectorDropdown({ value, onChange, open, setOpen }: { value: Sector; onChange: (s: Sector) => void; open: boolean; setOpen: (o: boolean) => void }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0b1117]/80 px-3 py-2 text-xs font-medium text-zinc-200 backdrop-blur transition hover:bg-white/[0.06]"
      >
        <Layers className="h-3.5 w-3.5 text-emerald-400" />
        {value}
        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-500 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/5 bg-[#0b1117]/95 shadow-2xl backdrop-blur animate-in fade-in-0 zoom-in-95">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-xs transition",
                value === s ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-300 hover:bg-white/[0.04]",
              )}
            >
              {s}
              {value === s && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LayerToggle({ layers, setLayers }: { layers: { ndvi: boolean; gps: boolean; weather: boolean }; setLayers: (l: { ndvi: boolean; gps: boolean; weather: boolean }) => void }) {
  const items: { key: keyof typeof layers; label: string }[] = [
    { key: "ndvi", label: "NDVI" },
    { key: "gps", label: "GPS" },
    { key: "weather", label: "Weather" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#0b1117]/80 p-1 backdrop-blur">
      {items.map((i) => (
        <button
          key={i.key}
          onClick={() => setLayers({ ...layers, [i.key]: !layers[i.key] })}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition",
            layers[i.key] ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title} className="rounded-lg p-1.5 text-zinc-300 transition hover:bg-white/[0.06] active:scale-95">
      {children}
    </button>
  );
}

function StatusPill({ icon: Icon, label, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; tone: "good" | "info" | "warn" }) {
  const tones = {
    good: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
    info: "text-sky-300 bg-sky-500/10 border-sky-400/20",
    warn: "text-amber-300 bg-amber-500/10 border-amber-400/20",
  };
  return (
    <div className={cn("hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium", tones[tone])}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-zinc-300">
      <span className={cn("h-2.5 w-2.5 rounded-sm", color)} />
      {label}
    </div>
  );
}

function MetricCard({ title, value, hint, icon, accent, progress }: { title: string; value: string; hint: string; icon: React.ReactNode; accent: "emerald" | "amber" | "sky"; progress: number }) {
  const tones = {
    emerald: { bar: "bg-emerald-400", chip: "bg-emerald-500/15 text-emerald-300" },
    amber: { bar: "bg-amber-400", chip: "bg-amber-500/15 text-amber-300" },
    sky: { bar: "bg-sky-400", chip: "bg-sky-500/15 text-sky-300" },
  }[accent];
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b1117] p-4 transition-colors hover:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", tones.chip)}>{icon}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-zinc-50">{value}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className={cn("h-full rounded-full transition-all duration-700", tones.bar)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">{hint}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "emerald" | "amber" | "sky" }) {
  const tones = { emerald: "text-emerald-300", amber: "text-amber-300", sky: "text-sky-300" };
  return (
    <div className="rounded-xl border border-white/5 bg-[#0b1117] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
        <Icon className={cn("h-3 w-3", tones[tone])} />
        {label}
      </div>
      <div className="mt-1.5 text-base font-semibold text-zinc-100">{value}</div>
    </div>
  );
}
