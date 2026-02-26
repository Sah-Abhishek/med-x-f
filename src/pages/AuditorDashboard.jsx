import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AuditLogs from '../components/auditor/AuditLogs';
import api from '../services/api';

const StatCard = ({ label, value, change, accent }) => {
  const accents = {
    blue: 'stat-card-accent',
    green: 'stat-card-success',
    red: 'stat-card-danger',
  };

  return (
    <div className={`stat-card ${accents[accent]} bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5`}>
      <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{value}</p>
        {change && (
          <span className="text-[11px] font-semibold text-[var(--color-success)]">{change}</span>
        )}
      </div>
    </div>
  );
};

/* ── Styled Dropdown ──────────────────────────────────────────────── */
const Dropdown = ({ label, value, displayText, open, setOpen, children, dropdownRef }) => (
  <div ref={dropdownRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>{label}</span>
    <button
      onClick={() => setOpen(o => !o)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", minWidth: 120,
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6,
        fontSize: 13, color: "#334155", cursor: "pointer",
        boxShadow: open ? "0 0 0 2px rgba(59,130,246,0.15)" : "none",
        transition: "box-shadow 0.15s",
      }}
    >
      <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {displayText}
      </span>
      <ChevronDown size={14} style={{ color: "#94a3b8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
    </button>
    {open && (
      <div style={{
        position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
        minWidth: 220, maxHeight: 320, overflowY: "auto",
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}>
        {children}
      </div>
    )}
  </div>
);

const DropdownItem = ({ selected, onClick, children, indent = false, isHeader = false }) => {
  if (isHeader) {
    return (
      <div style={{
        padding: "8px 14px 4px", fontSize: 11, fontWeight: 700,
        color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.5,
        borderTop: "1px solid #f1f5f9", marginTop: 2,
      }}>
        {children}
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      style={{
        padding: "7px 14px", paddingLeft: indent ? 28 : 14,
        fontSize: 13, color: selected ? "#3b82f6" : "#334155",
        fontWeight: selected ? 600 : 400,
        background: selected ? "#eff6ff" : "transparent",
        cursor: "pointer", transition: "background 0.1s",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#f8fafc"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </div>
  );
};

const AuditorDashboard = () => {
  const [masterData, setMasterData] = useState(null);
  const [selectedClient, setSelectedClient] = useState(0); // 0 = All
  const [selectedLocation, setSelectedLocation] = useState(0); // 0 = All
  const [clientOpen, setClientOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const clientRef = useRef(null);
  const locationRef = useRef(null);

  // Fetch master data on mount
  useEffect(() => {
    api.get('/hn-master-data')
      .then(res => {
        if (res.data?.success) setMasterData(res.data.data);
      })
      .catch(err => console.error('Failed to fetch master data:', err.message));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (clientRef.current && !clientRef.current.contains(e.target)) setClientOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clients = masterData?.clients || [];
  const allLocations = masterData?.locations || [];

  // Filter locations by selected client
  const filteredLocations = selectedClient === 0
    ? allLocations
    : allLocations.filter(loc => loc.ClientId === selectedClient);

  // Reset location when client changes
  const handleClientSelect = useCallback((clientId) => {
    setSelectedClient(clientId);
    setSelectedLocation(0);
    setClientOpen(false);
  }, []);

  const handleLocationSelect = useCallback((locationId) => {
    setSelectedLocation(locationId);
    setLocationOpen(false);
  }, []);

  // Display names
  const clientDisplayText = selectedClient === 0
    ? "All"
    : clients.find(c => c.id === selectedClient)?.name || "All";

  const locationDisplayText = selectedLocation === 0
    ? "All"
    : allLocations.find(l => l.id === selectedLocation)?.name || "All";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header row with title + filters */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
              Auditor Dashboard
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              View audit logs and generate reports
            </p>
          </div>

          {/* Client & Location dropdowns */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {/* Client Dropdown */}
            <Dropdown
              label="Client"
              value={selectedClient}
              displayText={clientDisplayText}
              open={clientOpen}
              setOpen={setClientOpen}
              dropdownRef={clientRef}
            >
              <DropdownItem
                selected={selectedClient === 0}
                onClick={() => handleClientSelect(0)}
              >
                All
              </DropdownItem>
              {clients.map(c => (
                <DropdownItem
                  key={c.id}
                  selected={selectedClient === c.id}
                  onClick={() => handleClientSelect(c.id)}
                >
                  {c.name}
                </DropdownItem>
              ))}
            </Dropdown>

            {/* Location Dropdown */}
            <Dropdown
              label="Location"
              value={selectedLocation}
              displayText={locationDisplayText}
              open={locationOpen}
              setOpen={setLocationOpen}
              dropdownRef={locationRef}
            >
              <DropdownItem
                selected={selectedLocation === 0}
                onClick={() => handleLocationSelect(0)}
              >
                All
              </DropdownItem>
              {filteredLocations.map(loc => (
                <div key={loc.id}>
                  {/* Location header */}
                  <DropdownItem isHeader>{loc.name}</DropdownItem>

                  {/* Location "All" option */}
                  <DropdownItem
                    indent
                    selected={selectedLocation === loc.id}
                    onClick={() => handleLocationSelect(loc.id)}
                  >
                    {loc.name} - All
                  </DropdownItem>

                  {/* Processes under this location */}
                  {loc.Processes?.map(proc => (
                    <DropdownItem
                      key={proc.id}
                      indent
                      selected={false}
                      onClick={() => handleLocationSelect(loc.id)}
                    >
                      {proc.name}
                    </DropdownItem>
                  ))}
                </div>
              ))}
            </Dropdown>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Logs" value="--" accent="blue" />
          <StatCard label="Today's Events" value="--" accent="green" />
          <StatCard label="Alerts" value="--" accent="red" />
        </div>

        <AuditLogs />
      </div>
    </DashboardLayout>
  );
};

export default AuditorDashboard;
