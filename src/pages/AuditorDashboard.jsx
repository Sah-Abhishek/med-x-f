import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ListChecks, ClipboardCheck, MessageSquareWarning, CheckCircle2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AuditLogs from '../components/auditor/AuditLogs';
import api from '../services/api';

/* ── Styled Dropdown ──────────────────────────────────────────────── */
const Dropdown = ({ label, displayText, open, setOpen, children, dropdownRef }) => (
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

/* ── Section Header (dotted) ─────────────────────────────────────── */
const SectionHeader = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <span style={{
      width: 7, height: 7, borderRadius: "50%",
      background: "#94a3b8", flexShrink: 0,
    }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 0.3 }}>
      {children}
    </span>
    <span style={{
      flex: 1, height: 1,
      borderBottom: "2px dotted #cbd5e1",
    }} />
  </div>
);

/* ── Milestone Card ──────────────────────────────────────────────── */
const MilestoneCard = ({ icon: Icon, value, label, subtitle, bg, accent, iconBg }) => (
  <div style={{
    background: bg, borderRadius: 12, padding: "18px 20px",
    minHeight: 130, display: "flex", flexDirection: "column",
    justifyContent: "space-between", position: "relative",
    border: "1px solid rgba(0,0,0,0.04)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8,
      background: iconBg || "rgba(0,0,0,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={18} style={{ color: accent }} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginTop: 4 }}>
        {label}
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 12, right: 16,
      fontSize: 11, color: "#94a3b8", fontWeight: 500,
    }}>
      {subtitle}
    </div>
  </div>
);

/* ── Status Card ─────────────────────────────────────────────────── */
const StatusCard = ({ value, label, accent, icon: Icon }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "18px 20px",
    minHeight: 130, display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "relative",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: accent, lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: accent }}>
          {label}
        </span>
      </div>
    </div>
    <div style={{
      width: 72, height: 72, borderRadius: 16,
      background: accent === "#10b981" ? "#ecfdf5" : "#fef2f2",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={32} style={{ color: accent, opacity: 0.7 }} />
    </div>
    <div style={{
      position: "absolute", bottom: 12, right: 16,
      fontSize: 11, color: "#94a3b8", fontWeight: 500,
    }}>
      Today's Count
    </div>
  </div>
);

/* ── Main Component ──────────────────────────────────────────────── */
const AuditorDashboard = () => {
  const [masterData, setMasterData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [selectedClient, setSelectedClient] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(0);
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

  // Fetch user stats whenever client/location selection changes
  useEffect(() => {
    api.get('/charts/user-stats', {
      params: { client: selectedClient, location: selectedLocation },
    })
      .then(res => {
        if (res.data?.success) setUserStats(res.data.data);
      })
      .catch(err => console.error('Failed to fetch user stats:', err.message));
  }, [selectedClient, selectedLocation]);

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

  const filteredLocations = selectedClient === 0
    ? allLocations
    : allLocations.filter(loc => loc.ClientId === selectedClient);

  const handleClientSelect = useCallback((clientId) => {
    setSelectedClient(clientId);
    setSelectedLocation(0);
    setClientOpen(false);
  }, []);

  const handleLocationSelect = useCallback((locationId) => {
    setSelectedLocation(locationId);
    setLocationOpen(false);
  }, []);

  const clientDisplayText = selectedClient === 0
    ? "All"
    : clients.find(c => c.id === selectedClient)?.name || "All";

  const locationDisplayText = selectedLocation === 0
    ? "All"
    : allLocations.find(l => l.id === selectedLocation)?.name || "All";

  const milestones = userStats?.milestones || {};

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

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Dropdown
              label="Client"
              displayText={clientDisplayText}
              open={clientOpen}
              setOpen={setClientOpen}
              dropdownRef={clientRef}
            >
              <DropdownItem selected={selectedClient === 0} onClick={() => handleClientSelect(0)}>All</DropdownItem>
              {clients.map(c => (
                <DropdownItem key={c.id} selected={selectedClient === c.id} onClick={() => handleClientSelect(c.id)}>
                  {c.name}
                </DropdownItem>
              ))}
            </Dropdown>

            <Dropdown
              label="Location"
              displayText={locationDisplayText}
              open={locationOpen}
              setOpen={setLocationOpen}
              dropdownRef={locationRef}
            >
              <DropdownItem selected={selectedLocation === 0} onClick={() => handleLocationSelect(0)}>All</DropdownItem>
              {filteredLocations.map(loc => (
                <div key={loc.id}>
                  <DropdownItem isHeader>{loc.name}</DropdownItem>
                  <DropdownItem indent selected={selectedLocation === loc.id} onClick={() => handleLocationSelect(loc.id)}>
                    {loc.name} - All
                  </DropdownItem>
                  {loc.Processes?.map(proc => (
                    <DropdownItem key={proc.id} indent selected={false} onClick={() => handleLocationSelect(loc.id)}>
                      {proc.name}
                    </DropdownItem>
                  ))}
                </div>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Milestones */}
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <SectionHeader>Milestones</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <MilestoneCard
                icon={ListChecks}
                value={milestones.ready_to_audit ?? 0}
                label="Ready to Audit"
                subtitle="All Time Count"
                bg="#f0f7ff"
                accent="#2563eb"
                iconBg="rgba(37,99,235,0.1)"
              />
              <MilestoneCard
                icon={ClipboardCheck}
                value={milestones.qc_pass ?? 0}
                label="Agree"
                subtitle="Today's Count"
                bg="#ecfdf5"
                accent="#10b981"
                iconBg="rgba(16,185,129,0.1)"
              />
              <MilestoneCard
                icon={MessageSquareWarning}
                value={milestones.qc_fail ?? 0}
                label="Feedback Provided"
                subtitle="Today's Count"
                bg="#fef2f2"
                accent="#ef4444"
                iconBg="rgba(239,68,68,0.1)"
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <SectionHeader>Status</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <StatusCard
                value={userStats?.complete_status ?? 0}
                label="Complete"
                accent="#10b981"
                icon={CheckCircle2}
              />
              <StatusCard
                value={userStats?.incomplete_status ?? 0}
                label="Incomplete"
                accent="#ef4444"
                icon={AlertCircle}
              />
            </div>
          </div>
        </div>

        <AuditLogs />
      </div>
    </DashboardLayout>
  );
};

export default AuditorDashboard;
