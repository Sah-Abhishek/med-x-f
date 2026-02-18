import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const Avatar = ({ src, name, size = 40 }) => {
  const [err, setErr] = useState(false);
  if (!src || err) {
    if (!name) return null;
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #f5a623, #f7c948)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      }}>{initials}</div>
    );
  }
  return (
    <img src={src} alt={name || ""} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
};

const SectionCard = ({ title, subtitle, action, children, style }) => (
  <div style={{
    background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20, ...style,
  }}>
    {(title || action) && (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", borderBottom: "1px solid #f0f1f3",
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1d23", margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: "#8c919a", margin: "2px 0 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div style={{ padding: "20px 24px" }}>{children}</div>
  </div>
);

const FormField = ({ label, value, required, type = "text", options, placeholder, readOnly = true }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    {type === "select" ? (
      <select disabled={readOnly} style={{
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: "1px solid #e2e8f0", background: readOnly ? "#f8fafc" : "#fff",
        fontSize: 13, color: value ? "#1a1d23" : "#94a3b8", cursor: readOnly ? "default" : "pointer",
      }}>
        <option value="">{placeholder || "Select..."}</option>
        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input type={type} value={value || ""} readOnly={readOnly} placeholder={placeholder || ""}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          border: "1px solid #e2e8f0", background: readOnly ? "#f8fafc" : "#fff",
          fontSize: 13, color: "#1a1d23", boxSizing: "border-box",
        }} />
    )}
  </div>
);

const PriorityBadge = ({ priority }) => {
  const colors = {
    Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    High: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    Medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    Low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  };
  const c = colors[priority] || colors.Medium;
  return (
    <span style={{
      padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{priority}</span>
  );
};

const CollapsibleSection = ({ title, subtitle, defaultOpen = false, children, headerAction }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 16,
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", cursor: "pointer", userSelect: "none",
        }}
      >
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1a1d23", margin: 0 }}>{title}</h4>
          {subtitle && <p style={{ fontSize: 11, color: "#8c919a", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {headerAction}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {open && <div style={{ padding: "0 20px 20px" }}>{children}</div>}
    </div>
  );
};

export default function ProcessChart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [timerStopTime, setTimerStopTime] = useState(null);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/charts/${id}`);
      if (response.data.success) {
        setChart(response.data.data);
      } else {
        setError("Failed to load chart data");
      }
    } catch (e) {
      console.error("Failed to fetch chart:", e.message);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m} : ${s}`;
  };

  const formatTimeShort = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  };

  const handleTimerStart = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      setTimerStartTime(now());
      setTimerStopTime(null);
    }
  };

  const handleTimerStop = () => {
    if (timerRunning) {
      setTimerRunning(false);
      setTimerStopTime(now());
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 80, textAlign: "center", color: "#8c919a" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #f0f1f3",
            borderTopColor: "#f5a623", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          Loading chart...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !chart) {
    return (
      <DashboardLayout>
        <div style={{ padding: 80, textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontSize: 16, marginBottom: 16 }}>{error || "Chart not found"}</p>
          <button onClick={() => navigate(-1)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #f5a623, #f7b731)",
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  const userName = [chart.UserFirstName, chart.UserLastName].filter(Boolean).join(" ");

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Previous / Next Chart buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #f5a623, #f7b731)",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Previous Chart
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #f5a623, #f7b731)",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
          }}>
            Next Chart
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Main content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* ===== LEFT COLUMN ===== */}
          <div>
            {/* Chart Header Card */}
            <div style={{
              background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px", marginBottom: 20,
              display: "grid", gridTemplateColumns: "1fr auto", gap: 24,
            }}>
              {/* Left: Chart info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1d23", margin: 0 }}>
                    Chart: {chart.ChartNo}
                  </h2>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Priority</span>
                  <PriorityBadge priority={chart.Priority} />
                </div>

                {/* Metadata badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 12.5, color: "#64748b", marginBottom: 20 }}>
                  <span>🏢 Client: {chart.ClientName || "—"}</span>
                  <span>⚙️ Process: {chart.Process || "—"}</span>
                  <span>🏥 Primary Specialty: {chart.Specialty || "—"}</span>
                  <span>📍 Location: {chart.Location || "—"}</span>
                  <span>👤 Allocated User: {userName || "—"}</span>
                  <span>📋 Sub Specialty: {chart.SubSpecialty || "—"}</span>
                  <span>🔍 Qc status: {chart.qc_status || "—"}</span>
                </div>

                {/* Info grid row 1 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
                  borderTop: "1px solid #f0f1f3", paddingTop: 16, marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.Worklist || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Worklist #</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.Milestone || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Milestone</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.Status || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Status</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.auditedWeek || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Audited week</div>
                  </div>
                </div>

                {/* Info grid row 2 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.SNo || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>S. No.</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfService || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Date of service</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.ReceivedDate || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Received date</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfCompletion || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Completion date</div>
                  </div>
                </div>

                {/* Info grid row 3 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfCoderAllocation || "NA"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Date of Coder Allocation</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfAuditorAllocation || "NA"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Date of Auditor Allocation</div>
                  </div>
                </div>
              </div>

              {/* Right: Timer */}
              <div style={{
                background: "linear-gradient(135deg, #f5a623, #f7b731)",
                borderRadius: 14, padding: "24px 28px", minWidth: 180,
                display: "flex", flexDirection: "column", alignItems: "center",
                color: "#fff", textAlign: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>Timer</div>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  {formatTime(timerSeconds)}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={handleTimerStart} style={{
                    padding: "8px 24px", borderRadius: 8, border: "none",
                    background: timerRunning ? "rgba(255,255,255,0.3)" : "#10b981",
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Start</button>
                  <button onClick={handleTimerStop} style={{
                    padding: "8px 24px", borderRadius: 8, border: "none",
                    background: !timerRunning && timerStartTime ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Stop</button>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, opacity: 0.9 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Start</div>
                    <div>{timerStartTime || "00:00"}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Stop</div>
                    <div>{timerStopTime || "00:00"}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Time</div>
                    <div>{formatTimeShort(timerSeconds)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Info Section */}
            <SectionCard
              title="Chart Info"
              subtitle="All relevant chart fields"
              action={
                <button style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
              }
            >
              {/* Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Chart #" value={chart.ChartNo} required />
                <FormField label="MR#" value={chart.MR_No} required />
                <FormField label="Date of Service" value={chart.DateOfService} required />
              </div>
              {/* Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Admit date" value={chart.AdmitDate} required />
                <FormField label="Discharge date" value={chart.DischargeDate} required />
              </div>
              {/* Row 3 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Disposition" value={chart.Disposition} required type="select" />
                <div>
                  <FormField label="Primary diagnosis" value={chart.PrimaryDiagnosis} required />
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 600, cursor: "pointer" }}>AI Suggest</span>
                    <span style={{
                      padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: "#f0f1f3", color: "#64748b", cursor: "pointer",
                    }}>Procedure codes</span>
                    <span style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 600, cursor: "pointer" }}>View Evidence</span>
                  </div>
                </div>
              </div>
              {/* Row 4 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Primary Health Plan" value={chart.PrimaryHealth} type="select" />
                <FormField label="Facility" value={chart.Facility} type="select" />
              </div>
              {/* Row 5 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="POA" value={chart.poa} required />
                <FormField label="LOS" value={chart.los} required />
                <FormField label="DRG Value" value={chart.drg_value} required />
              </div>
              {/* Row 6 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Procedure code" value={chart.procedure_code} required />
                <FormField label="Sub Specialty" value={chart.SubSpecialty} required />
              </div>
              {/* Row 7 */}
              <div style={{ marginBottom: 16 }}>
                <FormField label="Secondary Diagnosis" value="" required />
              </div>
            </SectionCard>

            {/* Processing Info Section */}
            <SectionCard
              title="Processing Info"
              subtitle="All fields related to processing this chart"
            >
              {/* Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Chart status" value={chart.Status} required type="select" options={["Open", "Complete", "Incomplete"]} />
                <FormField label="Responsible party" value="" required type="select" />
              </div>
              {/* Row 2 */}
              <div style={{ marginBottom: 16 }}>
                <FormField label="Hold reason" value="" type="select" placeholder="Select..." />
              </div>
              {/* Row 3 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  Coder comments to client <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea readOnly rows={3} value={chart.CoderComments || ""} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #e2e8f0", background: "#f8fafc",
                  fontSize: 13, color: "#1a1d23", resize: "vertical", boxSizing: "border-box",
                }} />
              </div>
              {/* Row 4 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Date of completion" value={chart.DateOfCompletion} />
                <FormField label="Audit options" value="" required type="select" />
                <FormField label="Coder QC Status" value={chart.qc_status} required type="select" />
              </div>
              {/* Row 5 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Allocate to auditor" value="" type="select" />
                <FormField label="Allocate to Coder" value="" type="select" />
                <FormField label="Priority" value={chart.Priority} type="select" options={["Critical", "High", "Medium", "Low"]} />
              </div>
              {/* Row 6 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <FormField label="Therapy sessions taken" value="" required />
                <FormField label="Date of latest appointment" value="" required type="text" placeholder="Select a Date" />
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                    AI Confidence Score
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input readOnly value="" style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      border: "1px solid #e2e8f0", background: "#f8fafc",
                      fontSize: 13, color: "#1a1d23", boxSizing: "border-box",
                    }} />
                    <span style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: "#f0f1f3", color: "#64748b", whiteSpace: "nowrap",
                    }}>NO</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Audit Information Section */}
            <SectionCard
              title="Audit Information"
              action={
                <button style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
              }
            >
              <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                No audit information available
              </p>
            </SectionCard>

            {/* Save button */}
            <button style={{
              padding: "12px 32px", borderRadius: 10, border: "none",
              background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", marginBottom: 20,
            }}>
              Save
            </button>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div>
            {/* Users Section (Top) */}
            <CollapsibleSection title="Users" defaultOpen={true}
              headerAction={
                <button style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fef2f2", color: "#ef4444", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>−</button>
              }
            >
              {/* Current Allocation (Allocated User) */}
              {userName && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #f0f1f3",
                }}>
                  <Avatar name={userName} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{userName}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Current Allocation</div>
                  </div>
                </div>
              )}

              {/* Original Coder */}
              {chart.coders?.length > 0 && chart.coders.map(coder => (
                <div key={coder.id || coder.name} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #f0f1f3",
                }}>
                  <Avatar src={coder.image_url} name={coder.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{coder.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      {coder.role || "Coder"}
                    </div>
                  </div>
                  {chart.date_of_coding && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{chart.date_of_coding}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>Date of Coding</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Auditors */}
              {chart.auditors?.length > 0 && chart.auditors.map(auditor => (
                <div key={auditor.id || auditor.name} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                }}>
                  <Avatar src={auditor.image_url} name={auditor.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{auditor.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      {auditor.role || "Auditor"}
                    </div>
                  </div>
                  {chart.date_of_auditing && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{chart.date_of_auditing}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>Date of Auditing</div>
                    </div>
                  )}
                </div>
              ))}

              {!userName && chart.coders?.length === 0 && chart.auditors?.length === 0 && (
                <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No users assigned</p>
              )}
            </CollapsibleSection>

            {/* Conversation Log */}
            <CollapsibleSection title="Conversation Log" subtitle="Internal comments within the team"
              headerAction={
                <button style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
              }
            >
              <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No comments yet</p>
            </CollapsibleSection>

            {/* Time Tracker */}
            <CollapsibleSection title="Time Tracker" subtitle="Overall processing time by user"
              headerAction={
                <button style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
              }
            >
              {chart.timer ? (
                <div style={{ fontSize: 13, color: "#1a1d23" }}>
                  Timer: {chart.timer}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No time tracked yet</p>
              )}
            </CollapsibleSection>

            {/* AI ICD Prediction */}
            <CollapsibleSection title="🤖 AI ICD Prediction" defaultOpen={false}>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>No predictions available</p>
                <button style={{
                  padding: "10px 24px", borderRadius: 10, border: "2px solid #1a1d23",
                  background: "#fff", color: "#1a1d23", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Regenerate</button>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
