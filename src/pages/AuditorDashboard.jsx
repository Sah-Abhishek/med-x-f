import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ListChecks, ClipboardCheck, MessageSquareWarning, CheckCircle2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
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
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 0.3 }}>{children}</span>
    <span style={{ flex: 1, height: 1, borderBottom: "2px dotted #cbd5e1" }} />
  </div>
);

/* ── Milestone Card ──────────────────────────────────────────────── */
const MilestoneCard = ({ icon: Icon, value, label, subtitle, bg, accent, iconBg }) => (
  <div style={{
    background: bg, borderRadius: 12, padding: "18px 20px",
    minHeight: 130, display: "flex", flexDirection: "column",
    justifyContent: "space-between", position: "relative",
    border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8,
      background: iconBg || "rgba(0,0,0,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={18} style={{ color: accent }} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginTop: 4 }}>{label}</div>
    </div>
    <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</div>
  </div>
);

/* ── Status Card ─────────────────────────────────────────────────── */
const StatusCard = ({ value, label, accent, icon: Icon }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "18px 20px",
    minHeight: 130, display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "relative",
    border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 32, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: accent }}>{label}</span>
    </div>
    <div style={{
      width: 72, height: 72, borderRadius: 16,
      background: accent === "#10b981" ? "#ecfdf5" : "#fef2f2",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={32} style={{ color: accent, opacity: 0.7 }} />
    </div>
    <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Today's Count</div>
  </div>
);

/* ── Badge Components ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const isComplete = status === "Complete";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: isComplete ? "#e8f8ef" : "#fff8e1",
      color: isComplete ? "#1b9e4b" : "#e6a817",
      border: `1px solid ${isComplete ? "#b7ebc9" : "#ffe082"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isComplete ? "#1b9e4b" : "#e6a817" }} />
      {status}
    </span>
  );
};

const MilestoneBadge = ({ milestone }) => {
  const isDone = milestone?.includes("Done");
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
      background: isDone ? "#e8f8ef" : "#e3f2fd",
      color: isDone ? "#1b9e4b" : "#1565c0",
      border: `1px solid ${isDone ? "#b7ebc9" : "#90caf9"}`,
    }}>{milestone}</span>
  );
};

/* ── Table Config ────────────────────────────────────────────────── */
const COLUMNS = [
  { key: "SNo", label: "S. NO.", width: 60 },
  { key: "Worklist", label: "WORKLIST #", width: 100 },
  { key: "Client", label: "CLIENT", width: 80 },
  { key: "Location", label: "LOCATION", width: 160 },
  { key: "Specialty", label: "SPECIALTY", width: 120 },
  { key: "chart_no", label: "CHART #", width: 100 },
  { key: "DateOfService", label: "DATE OF SERVICE", width: 115 },
  { key: "ReceivedDate", label: "RECEIVED DATE", width: 115 },
  { key: "OriginalCoder", label: "ORIGINAL CODER", width: 120 },
  { key: "OriginalAuditor", label: "ORIGINAL AUDITOR", width: 120 },
  { key: "Status", label: "CHART STATUS", width: 110 },
  { key: "Milestone", label: "MILESTONE", width: 140 },
  { key: "qc_status", label: "QC STATUS", width: 90 },
  { key: "Process", label: "PROCESS", width: 90 },
];

const SORT_MAP = {
  SNo: "SNo",
  Worklist: "Worklist",
  Client: "Client",
  Location: "Location",
  Specialty: "Specialty",
  chart_no: "chart_no",
  DateOfService: "DateOfService",
  ReceivedDate: "ReceivedDate",
  Status: "Status",
  Milestone: "MilestoneId",
  Process: "Process",
  qc_status: "qc_status",
};

const PRIORITY_TABS = ["Critical", "High", "Medium", "Low", "Done"];

/* ── Main Component ──────────────────────────────────────────────── */
const AuditorDashboard = () => {
  const navigate = useNavigate();

  // Master data + filters
  const [masterData, setMasterData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [selectedClient, setSelectedClient] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [clientOpen, setClientOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const clientRef = useRef(null);
  const locationRef = useRef(null);

  // Charts table state
  const [charts, setCharts] = useState([]);
  const [counts, setCounts] = useState({ Critical: 0, High: 0, Medium: 0, Low: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Critical");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortCol, setSortCol] = useState("MilestoneId");
  const [sortDir, setSortDir] = useState("ASC");

  // ── Fetch master data on mount ────────────────────────────────────
  useEffect(() => {
    api.get('/hn-master-data')
      .then(res => { if (res.data?.success) setMasterData(res.data.data); })
      .catch(err => console.error('Failed to fetch master data:', err.message));
  }, []);

  // ── Fetch user stats when filters change ──────────────────────────
  useEffect(() => {
    api.get('/charts/user-stats', {
      params: { client: selectedClient, location: selectedLocation },
    })
      .then(res => { if (res.data?.success) setUserStats(res.data.data); })
      .catch(err => console.error('Failed to fetch user stats:', err.message));
  }, [selectedClient, selectedLocation]);

  // ── Fetch charts ──────────────────────────────────────────────────
  const fetchCharts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post('/charts/', {}, {
        params: {
          priority: activeTab,
          page: currentPage,
          size: pageSize,
          column: sortCol,
          direction: sortDir,
          client: selectedClient,
          location: selectedLocation,
        },
      });
      if (res.data?.success) {
        setCharts(res.data.data.charts || []);
        setCounts(res.data.data.counts || { Critical: 0, High: 0, Medium: 0, Low: 0, done: 0 });
      }
    } catch (e) {
      console.error('Failed to fetch charts:', e.message);
      setCharts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, sortCol, sortDir, selectedClient, selectedLocation]);

  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  // ── Close dropdowns on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (clientRef.current && !clientRef.current.contains(e.target)) setClientOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived data ──────────────────────────────────────────────────
  const clients = masterData?.clients || [];
  const allLocations = masterData?.locations || [];
  const filteredLocations = selectedClient === 0 ? allLocations : allLocations.filter(loc => loc.ClientId === selectedClient);
  const milestones = userStats?.milestones || {};

  const clientDisplayText = selectedClient === 0 ? "All" : clients.find(c => c.id === selectedClient)?.name || "All";
  const locationDisplayText = selectedLocation === 0 ? "All" : allLocations.find(l => l.id === selectedLocation)?.name || "All";

  const totalPages = Math.max(1, Math.ceil((counts[activeTab] || counts.done || 0) / pageSize));

  // ── Handlers ──────────────────────────────────────────────────────
  const handleClientSelect = useCallback((id) => {
    setSelectedClient(id);
    setSelectedLocation(0);
    setClientOpen(false);
    setCurrentPage(1);
  }, []);

  const handleLocationSelect = useCallback((id) => {
    setSelectedLocation(id);
    setLocationOpen(false);
    setCurrentPage(1);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSort = (colKey) => {
    const apiCol = SORT_MAP[colKey];
    if (!apiCol) return;
    if (sortCol === apiCol) {
      setSortDir(d => d === "ASC" ? "DESC" : "ASC");
    } else {
      setSortCol(apiCol);
      setSortDir("ASC");
    }
    setCurrentPage(1);
  };

  // Find which visible column key maps to the current sortCol
  const activeSortKey = Object.entries(SORT_MAP).find(([, v]) => v === sortCol)?.[0] || null;

  const tabs = PRIORITY_TABS.map(key => ({
    key,
    count: key === "Done" ? (counts.done ?? 0) : (counts[key] ?? 0),
  }));

  // ── Render cell ───────────────────────────────────────────────────
  const renderCell = (chart, col) => {
    switch (col.key) {
      case "Status":
        return chart.Status ? <StatusBadge status={chart.Status} /> : "--";
      case "Milestone":
        return chart.Milestone ? <MilestoneBadge milestone={chart.Milestone} /> : "--";
      case "OriginalCoder":
        return chart.CoderFirstName ? `${chart.CoderFirstName} ${chart.CoderLastName || ""}`.trim() : "--";
      case "OriginalAuditor":
        return chart.AuditorFirstName ? `${chart.AuditorFirstName} ${chart.AuditorLastName || ""}`.trim() : "--";
      case "qc_status":
        return chart.qc_status || "--";
      default:
        return chart[col.key] ?? "--";
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header row with title + filters */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">Auditor Dashboard</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">View audit logs and generate reports</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Dropdown label="Client" displayText={clientDisplayText} open={clientOpen} setOpen={setClientOpen} dropdownRef={clientRef}>
              <DropdownItem selected={selectedClient === 0} onClick={() => handleClientSelect(0)}>All</DropdownItem>
              {clients.map(c => (
                <DropdownItem key={c.id} selected={selectedClient === c.id} onClick={() => handleClientSelect(c.id)}>{c.name}</DropdownItem>
              ))}
            </Dropdown>
            <Dropdown label="Location" displayText={locationDisplayText} open={locationOpen} setOpen={setLocationOpen} dropdownRef={locationRef}>
              <DropdownItem selected={selectedLocation === 0} onClick={() => handleLocationSelect(0)}>All</DropdownItem>
              {filteredLocations.map(loc => (
                <div key={loc.id}>
                  <DropdownItem isHeader>{loc.name}</DropdownItem>
                  <DropdownItem indent selected={selectedLocation === loc.id} onClick={() => handleLocationSelect(loc.id)}>{loc.name} - All</DropdownItem>
                  {loc.Processes?.map(proc => (
                    <DropdownItem key={proc.id} indent selected={false} onClick={() => handleLocationSelect(loc.id)}>{proc.name}</DropdownItem>
                  ))}
                </div>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <SectionHeader>Milestones</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <MilestoneCard icon={ListChecks} value={milestones.ready_to_audit ?? 0} label="Ready to Audit" subtitle="All Time Count" bg="#f0f7ff" accent="#2563eb" iconBg="rgba(37,99,235,0.1)" />
              <MilestoneCard icon={ClipboardCheck} value={milestones.qc_pass ?? 0} label="Agree" subtitle="Today's Count" bg="#ecfdf5" accent="#10b981" iconBg="rgba(16,185,129,0.1)" />
              <MilestoneCard icon={MessageSquareWarning} value={milestones.qc_fail ?? 0} label="Feedback Provided" subtitle="Today's Count" bg="#fef2f2" accent="#ef4444" iconBg="rgba(239,68,68,0.1)" />
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <SectionHeader>Status</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <StatusCard value={userStats?.complete_status ?? 0} label="Complete" accent="#10b981" icon={CheckCircle2} />
              <StatusCard value={userStats?.incomplete_status ?? 0} label="Incomplete" accent="#ef4444" icon={AlertCircle} />
            </div>
          </div>
        </div>

        {/* Charts Table */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          {/* Priority Tabs + Page Size */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", borderBottom: "1px solid #f0f1f3",
          }}>
            <div style={{ display: "flex", gap: 0 }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                  padding: "14px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  background: "none", border: "none", position: "relative",
                  color: activeTab === tab.key ? "#1a1d23" : "#8c919a",
                  borderBottom: activeTab === tab.key ? "2.5px solid #f5a623" : "2.5px solid transparent",
                  transition: "all 0.15s ease",
                }}>
                  {tab.key} ({tab.count})
                </button>
              ))}
            </div>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{
              padding: "7px 12px", borderRadius: 8, border: "1px solid #e0e2e6",
              fontSize: 13, color: "#4a4f58", cursor: "pointer", background: "#fff",
            }}>
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: 60, textAlign: "center", color: "#8c919a" }}>
              <div style={{
                width: 32, height: 32, border: "3px solid #f0f1f3",
                borderTopColor: "#f5a623", borderRadius: "50%",
                animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
              }} />
              Loading charts...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                minWidth: COLUMNS.reduce((s, c) => s + c.width, 0),
              }}>
                <thead>
                  <tr style={{ background: "#fafbfc" }}>
                    {COLUMNS.map(col => {
                      const isSortable = !!SORT_MAP[col.key];
                      const isActive = col.key === activeSortKey;
                      return (
                        <th key={col.key}
                          onClick={() => isSortable && handleSort(col.key)}
                          style={{
                            padding: "12px 14px", fontSize: 10.5, fontWeight: 700,
                            color: "#8c919a", textAlign: "left", textTransform: "uppercase",
                            letterSpacing: "0.6px", whiteSpace: "nowrap",
                            borderBottom: "1px solid #f0f1f3", width: col.width,
                            cursor: isSortable ? "pointer" : "default", userSelect: "none",
                          }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            {col.label}
                            {isSortable && (
                              <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                                <path d="M4 0L7 4H1L4 0Z" fill={isActive && sortDir === "ASC" ? "#f5a623" : "#ccc"} />
                                <path d="M4 10L1 6H7L4 10Z" fill={isActive && sortDir === "DESC" ? "#f5a623" : "#ccc"} />
                              </svg>
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {charts.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} style={{ padding: 60, textAlign: "center", color: "#b0b5be", fontSize: 14 }}>
                        No charts found for this priority level.
                      </td>
                    </tr>
                  ) : (
                    charts.map((chart, idx) => (
                      <tr key={chart.Id}
                        onClick={() => navigate(`/process-chart/${chart.Id}`)}
                        style={{
                          borderBottom: "1px solid #f4f5f7",
                          background: idx % 2 === 0 ? "#fff" : "#fdfdfe",
                          cursor: "pointer", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fafbfc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fdfdfe"; }}
                      >
                        {COLUMNS.map(col => (
                          <td key={col.key} style={{
                            padding: "14px 14px", fontSize: 13, color: "#3a3f48",
                            whiteSpace: col.key === "Location" ? "normal" : "nowrap",
                            verticalAlign: "middle",
                          }}>
                            {renderCell(chart, col)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              padding: "16px 20px", gap: 6, borderTop: "1px solid #f0f1f3",
            }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid #e0e2e6",
                  background: "#fff", cursor: currentPage === 1 ? "default" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#6b7280",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{
                  width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: currentPage === i + 1 ? "none" : "1px solid #e0e2e6",
                  background: currentPage === i + 1 ? "linear-gradient(135deg, #f5a623, #f7b731)" : "#fff",
                  color: currentPage === i + 1 ? "#fff" : "#6b7280",
                  cursor: "pointer", boxShadow: currentPage === i + 1 ? "0 2px 6px rgba(245,166,35,0.3)" : "none",
                }}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid #e0e2e6",
                  background: "#fff", cursor: currentPage === totalPages ? "default" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#6b7280",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditorDashboard;
