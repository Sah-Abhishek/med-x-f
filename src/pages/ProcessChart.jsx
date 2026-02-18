import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { MEDX_API_URL } from "../utils/constants";
import { useChartsStore } from "../store/chartsStore";
import { useJobStatus } from "../hooks/useJobStatus";
import axios from "axios";
import {
  FileText, File as FileIcon, FileImage, Layers,
  ClipboardPaste, X, Plus, Trash2, Upload, Loader2, CheckCircle2, AlertCircle,
  Eye, ExternalLink, Wifi, WifiOff, Clock,
} from "lucide-react";

/* ── SVG Icon components ── */
const IconBuilding = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
  </svg>
);
const IconGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconHospital = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M9 8h6M12 5v6M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconClipboard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

/* ── Reusable components ── */

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

const ToggleButton = ({ open, onClick, variant = "add" }) => {
  const isRemove = variant === "remove";
  return (
    <button onClick={onClick} style={{
      width: 28, height: 28, borderRadius: "50%", border: "none",
      background: isRemove ? "#fef2f2" : "#fff3e0",
      color: isRemove ? "#ef4444" : "#f5a623",
      fontSize: 18, fontWeight: 500, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      lineHeight: 1,
    }}>
      {open ? "−" : "+"}
    </button>
  );
};

const CollapsibleSection = ({ title, subtitle, defaultOpen = false, children, headerAction }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 16,
      overflow: "hidden",
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

const CollapsibleCard = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", borderBottom: open ? "1px solid #f0f1f3" : "none",
        cursor: "pointer", userSelect: "none",
      }} onClick={() => setOpen(o => !o)}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1d23", margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: "#8c919a", margin: "2px 0 0 0" }}>{subtitle}</p>}
        </div>
        <ToggleButton open={open} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} />
      </div>
      {open && <div style={{ padding: "20px 24px" }}>{children}</div>}
    </div>
  );
};

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

/* ── Metadata item with icon ── */
const MetaItem = ({ icon, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#64748b" }}>
    <span style={{ display: "flex", color: "#94a3b8" }}>{icon}</span>
    {children}
  </span>
);

/* ── Main Page Component ── */

export default function ProcessChart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart navigation from Zustand store
  const getPrevId = useChartsStore((s) => s.getPrevId);
  const getNextId = useChartsStore((s) => s.getNextId);
  const currentId = Number(id);
  const prevId = getPrevId(currentId);
  const nextId = getNextId(currentId);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [timerStopTime, setTimerStopTime] = useState(null);

  // Upload section state
  const [activeTab] = useState("coding"); // default tab context
  const [dragActive, setDragActive] = useState({ document: false, image: false });
  const [uploads, setUploads] = useState({
    coding: { documents: [], imageGroups: [], texts: [] },
  });
  const [stagedImages, setStagedImages] = useState([]);
  const [groupLabel, setGroupLabel] = useState("");
  const [textInput, setTextInput] = useState("");

  const currentUploads = uploads[activeTab] || { documents: [], imageGroups: [], texts: [] };
  const currentTab = { icon: Upload, label: "Coding" };

  const getTabColor = (tab, variant) => {
    const colors = {
      light: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    };
    return colors[variant] || "";
  };

  const acceptedDocumentTypes = ".pdf,.doc,.docx";

  const getFileTypeInfo = (type) => {
    if (type === "application/pdf") return { label: "PDF", color: "text-red-600", bgColor: "bg-red-50" };
    if (type?.includes("word") || type?.includes("doc")) return { label: "DOC", color: "text-blue-600", bgColor: "bg-blue-50" };
    return { label: "FILE", color: "text-slate-600", bgColor: "bg-slate-50" };
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleDrag = (e, zone, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [zone]: active }));
  };

  const processFiles = (files, type) => {
    const fileArray = Array.from(files);
    if (type === "documents") {
      const newDocs = fileArray.map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: formatFileSize(f.size),
        type: f.type,
        file: f,
      }));
      setUploads((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          documents: [...prev[activeTab].documents, ...newDocs],
        },
      }));
    } else if (type === "images") {
      const newImages = fileArray.map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        file: f,
        preview: URL.createObjectURL(f),
      }));
      setStagedImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ document: false, image: false });
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files, type);
  };

  const handleFileInput = (e, type) => {
    if (e.target.files?.length) processFiles(e.target.files, type);
    e.target.value = "";
  };

  const removeItem = (type, itemId) => {
    setUploads((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [type]: prev[activeTab][type].filter((item) => item.id !== itemId),
      },
    }));
  };

  const removeStagedImage = (imgId) => {
    setStagedImages((prev) => {
      const img = prev.find((i) => i.id === imgId);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== imgId);
    });
  };

  const addImageGroup = () => {
    if (stagedImages.length === 0) return;
    const group = {
      id: Date.now(),
      label: groupLabel || `Group ${currentUploads.imageGroups.length + 1}`,
      images: stagedImages,
      totalSize: stagedImages.reduce((sum, img) => sum + img.size, 0),
    };
    setUploads((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        imageGroups: [...prev[activeTab].imageGroups, group],
      },
    }));
    setStagedImages([]);
    setGroupLabel("");
  };

  const removeImageGroup = (groupId) => {
    setUploads((prev) => {
      const group = prev[activeTab].imageGroups.find((g) => g.id === groupId);
      group?.images.forEach((img) => { if (img.preview) URL.revokeObjectURL(img.preview); });
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          imageGroups: prev[activeTab].imageGroups.filter((g) => g.id !== groupId),
        },
      };
    });
  };

  const addTextEntry = () => {
    if (!textInput.trim()) return;
    const entry = {
      id: Date.now(),
      text: textInput.trim(),
      preview: textInput.trim().slice(0, 120) + (textInput.trim().length > 120 ? "..." : ""),
    };
    setUploads((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        texts: [...prev[activeTab].texts, entry],
      },
    }));
    setTextInput("");
  };

  // Document processing API
  const DOCUMENT_PROCESS_URL = `${MEDX_API_URL}/documents/process`;
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [docViewerUrl, setDocViewerUrl] = useState(null); // for document popup

  // WebSocket job status tracking
  const jobId = uploadResult?.jobId || null;
  const { status: jobStatus, phase: jobPhase, message: jobMessage, isConnected: wsConnected } = useJobStatus(jobId);

  // Phase progression for the visual tracker
  const PHASES = [
    { key: "processing", label: "Queued" },
    { key: "ocr_started", label: "OCR Started" },
    { key: "ocr_completed", label: "OCR Done" },
    { key: "ai_started", label: "AI Analysis" },
    { key: "ai_completed", label: "AI Done" },
    { key: "saving_results", label: "Saving" },
    { key: "completed", label: "Completed" },
  ];

  const getPhaseIndex = (p) => {
    const idx = PHASES.findIndex((ph) => ph.key === p);
    return idx >= 0 ? idx : -1;
  };

  const currentPhaseIndex = getPhaseIndex(jobPhase);

  const processDocuments = async () => {
    const docs = currentUploads.documents;
    if (docs.length === 0) return;

    setUploadStatus("uploading");
    setUploadResult(null);
    setUploadError(null);

    try {
      const formData = new FormData();

      // Append each file
      docs.forEach((doc) => {
        formData.append("files", doc.file);
      });

      // Build transactions array
      const transactions = docs.map((doc, idx) => ({
        type: doc.type === "application/pdf" ? "pdf" : "doc",
        fileIndex: idx,
        label: doc.name,
      }));

      formData.append("sessionId", chart?.id?.toString() || "");
      formData.append("documentType", "ed-notes");
      formData.append("mrn", chart?.MR_No || "");
      formData.append("chartNumber", chart?.ChartNo || "");
      formData.append("facility", chart?.Facility || "");
      formData.append("specialty", chart?.Specialty || "");
      formData.append("dateOfService", chart?.DateOfService || "");
      formData.append("provider", "");
      formData.append("transactions", JSON.stringify(transactions));

      const token = localStorage.getItem("token");
      const response = await axios.post(DOCUMENT_PROCESS_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.data.success) {
        setUploadStatus("success");
        setUploadResult(response.data);
      } else {
        setUploadStatus("error");
        setUploadError(response.data.message || "Upload failed");
      }
    } catch (e) {
      console.error("Document upload failed:", e);
      setUploadStatus("error");
      setUploadError(e.response?.data?.message || e.message || "Upload failed");
    }
  };

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
          <button
            onClick={() => prevId != null ? navigate(`/process-chart/${prevId}`) : navigate('/coder')}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #f5a623, #f7b731)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            {prevId != null ? "Previous Chart" : "Back to Dashboard"}
          </button>
          <button
            onClick={() => nextId != null ? navigate(`/process-chart/${nextId}`) : navigate('/coder')}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #f5a623, #f7b731)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
            }}
          >
            {nextId != null ? "Next Chart" : "Back to Dashboard"}
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

                {/* Metadata badges with SVG icons */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 20 }}>
                  <MetaItem icon={<IconBuilding />}>Client: {chart.ClientName || "—"}</MetaItem>
                  <MetaItem icon={<IconGear />}>Process: {chart.Process || "—"}</MetaItem>
                  <MetaItem icon={<IconHospital />}>Primary Specialty: {chart.Specialty || "—"}</MetaItem>
                  <MetaItem icon={<IconMapPin />}>Location: {chart.Location || "—"}</MetaItem>
                  <MetaItem icon={<IconUser />}>Allocated User: {userName || "—"}</MetaItem>
                  <MetaItem icon={<IconClipboard />}>Sub Specialty: {chart.SubSpecialty || "—"}</MetaItem>
                  <MetaItem icon={<IconSearch />}>Qc status: {chart.qc_status || "—"}</MetaItem>
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

            {/* Upload Header Text */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1d23", margin: 0 }}>
                Upload medical documents to generate AI insights
              </h3>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden" style={{ marginBottom: 20 }}>
              <div className={`px-6 py-4 ${getTabColor(activeTab, 'light')} border-b ${getTabColor(activeTab, 'border')}`}>
                <div className="flex items-center gap-3">
                  {React.createElement(currentTab.icon, { className: `w-5 h-5 ${getTabColor(activeTab, 'text')}` })}
                  <div>
                    <h2 className={`font-semibold ${getTabColor(activeTab, 'text')}`}>{currentTab.label} Upload</h2>
                    <p className="text-sm text-slate-500">Add documents (PDF, Word), grouped images, or paste clinical text</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Document Upload (PDF + Word) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">Document Upload</span>
                      </div>
                      {currentUploads.documents.length > 0 && <span className="text-xs text-slate-500">{currentUploads.documents.length} file(s)</span>}
                    </div>

                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 ${dragActive.document ? 'border-slate-400 bg-slate-50/50' : 'border-slate-200'}`}
                      onDragEnter={(e) => handleDrag(e, 'document', true)}
                      onDragLeave={(e) => handleDrag(e, 'document', false)}
                      onDragOver={(e) => handleDrag(e, 'document', true)}
                      onDrop={(e) => handleDrop(e, 'documents')}
                    >
                      <input
                        type="file"
                        accept={acceptedDocumentTypes}
                        multiple
                        onChange={(e) => handleFileInput(e, 'documents')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">Drop documents here</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or Word (.doc, .docx)</p>
                    </div>

                    {currentUploads.documents.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {currentUploads.documents.map((file) => {
                          const fileInfo = getFileTypeInfo(file.type);
                          return (
                            <div key={file.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${fileInfo.bgColor}`}>
                                <FileText className={`w-3.5 h-3.5 ${fileInfo.color}`} />
                              </div>
                              <span className="text-xs text-slate-700 truncate flex-1">{file.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${fileInfo.bgColor} ${fileInfo.color}`}>
                                {fileInfo.label}
                              </span>
                              <span className="text-xs text-slate-400">{file.size}</span>
                              <button onClick={() => removeItem('documents', file.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Image Upload with Grouping */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">Image Groups</span>
                      </div>
                      {currentUploads.imageGroups.length > 0 && (
                        <span className="text-xs text-slate-500">{currentUploads.imageGroups.length} group(s)</span>
                      )}
                    </div>

                    {/* Staging Area */}
                    <div className={`border-2 rounded-xl transition-all ${stagedImages.length > 0 ? 'border-blue-300 bg-blue-50/30' : 'border-dashed border-slate-200'}`}>
                      {/* Drop Zone */}
                      <div
                        className={`relative p-4 text-center transition-all cursor-pointer hover:bg-blue-50/50 ${dragActive.image ? 'bg-blue-50/50' : ''}`}
                        onDragEnter={(e) => handleDrag(e, 'image', true)}
                        onDragLeave={(e) => handleDrag(e, 'image', false)}
                        onDragOver={(e) => handleDrag(e, 'image', true)}
                        onDrop={(e) => handleDrop(e, 'images')}
                      >
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.tiff,.webp"
                          multiple
                          onChange={(e) => handleFileInput(e, 'images')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileImage className="w-6 h-6 text-blue-300 mx-auto mb-1" />
                        <p className="text-sm text-slate-600 font-medium">
                          {stagedImages.length > 0 ? 'Add more images' : 'Drop images here'}
                        </p>
                        <p className="text-xs text-slate-400">Multi-page documents</p>
                      </div>

                      {/* Staged Images Preview */}
                      {stagedImages.length > 0 && (
                        <div className="border-t border-blue-200 p-3 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Staging: {stagedImages.length} image(s)</span>
                          </div>

                          {/* Thumbnail Grid */}
                          <div className="grid grid-cols-4 gap-2">
                            {stagedImages.map((img) => (
                              <div key={img.id} className="relative group">
                                <img
                                  src={img.preview}
                                  alt={img.name}
                                  className="w-full h-14 object-cover rounded-lg border border-blue-200"
                                />
                                <button
                                  onClick={() => removeStagedImage(img.id)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Group Label & Add Button */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Group label (optional)"
                              value={groupLabel}
                              onChange={(e) => setGroupLabel(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                              onClick={addImageGroup}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Group
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Added Image Groups */}
                    {currentUploads.imageGroups.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentUploads.imageGroups.map((group) => (
                          <div key={group.id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 group">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-slate-800">{group.label}</span>
                              </div>
                              <button
                                onClick={() => removeImageGroup(group.id)}
                                className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {group.images.slice(0, 4).map((img) => (
                                <img
                                  key={img.id}
                                  src={img.preview}
                                  alt={img.name}
                                  className="w-10 h-10 object-cover rounded-md border border-blue-200"
                                />
                              ))}
                              {group.images.length > 4 && (
                                <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                                  +{group.images.length - 4}
                                </div>
                              )}
                              <span className="ml-auto text-xs text-slate-500">
                                {group.images.length} page(s) • {(group.totalSize / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Paste */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <ClipboardPaste className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">Clinical Text</span>
                      </div>
                      {currentUploads.texts.length > 0 && <span className="text-xs text-slate-500">{currentUploads.texts.length} entry(s)</span>}
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 transition-all focus-within:border-emerald-400 focus-within:bg-emerald-50/20">
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste clinical text here..."
                        className="w-full h-20 text-sm text-slate-700 placeholder-slate-400 bg-transparent resize-none outline-none"
                      />
                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={addTextEntry}
                          disabled={!textInput.trim()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Entry
                        </button>
                      </div>
                    </div>

                    {currentUploads.texts.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {currentUploads.texts.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg group">
                            <ClipboardPaste className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-700 flex-1 line-clamp-2">{entry.preview}</span>
                            <button onClick={() => removeItem('texts', entry.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Process Documents Button & Status */}
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={processDocuments}
                      disabled={currentUploads.documents.length === 0 || uploadStatus === "uploading"}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                      {uploadStatus === "uploading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Process Documents
                        </>
                      )}
                    </button>

                    {uploadStatus === "error" && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                        <AlertCircle className="w-4 h-4" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Job Status Tracker */}
                  {uploadResult && jobId && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">AI Processing Status</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {jobId.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {wsConnected ? (
                            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className={`text-xs ${wsConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {wsConnected ? 'Live' : 'Connecting...'}
                          </span>
                        </div>
                      </div>

                      {/* Phase Progress Bar */}
                      <div className="flex items-center gap-1">
                        {PHASES.map((ph, idx) => {
                          const isActive = idx === currentPhaseIndex;
                          const isDone = idx < currentPhaseIndex;
                          const isFailed = jobStatus === 'failed';
                          return (
                            <div key={ph.key} className="flex-1 flex flex-col items-center gap-1.5">
                              <div
                                className={`h-2 w-full rounded-full transition-all duration-500 ${
                                  isFailed && isActive ? 'bg-red-400' :
                                  isDone ? 'bg-emerald-400' :
                                  isActive ? 'bg-amber-400 animate-pulse' :
                                  'bg-slate-200'
                                }`}
                              />
                              <span className={`text-[10px] font-medium leading-none ${
                                isFailed && isActive ? 'text-red-600' :
                                isDone ? 'text-emerald-600' :
                                isActive ? 'text-amber-700' :
                                'text-slate-400'
                              }`}>
                                {ph.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Status Message */}
                      {jobMessage && (
                        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                          jobStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          jobStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {jobStatus === 'completed' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> :
                           jobStatus === 'failed' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> :
                           <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />}
                          <span>{jobMessage}</span>
                        </div>
                      )}

                      {/* Uploaded Documents List with View buttons */}
                      {uploadResult.documents?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded Documents</span>
                          {uploadResult.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{doc.filename}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{doc.documentType}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    doc.status === 'uploaded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {doc.status}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">{doc.transactionId}</span>
                                </div>
                              </div>
                              {doc.s3Url && (
                                <button
                                  onClick={() => setDocViewerUrl(doc.s3Url)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors flex-shrink-0"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Document
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Info Section — Collapsible */}
            <CollapsibleCard title="Chart Info" subtitle="All relevant chart fields" defaultOpen={true}>
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
            </CollapsibleCard>

            {/* Processing Info Section — Collapsible */}
            <CollapsibleCard title="Processing Info" subtitle="All fields related to processing this chart" defaultOpen={true}>
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
            </CollapsibleCard>

            {/* Audit Information Section — Collapsible */}
            <CollapsibleCard title="Audit Information" defaultOpen={false}>
              <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                No audit information available
              </p>
            </CollapsibleCard>

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
                <button onClick={(e) => e.stopPropagation()} style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fef2f2", color: "#ef4444", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
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
                <button onClick={(e) => e.stopPropagation()} style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              }
            >
              <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No comments yet</p>
            </CollapsibleSection>

            {/* Time Tracker */}
            <CollapsibleSection title="Time Tracker" subtitle="Overall processing time by user"
              headerAction={
                <button onClick={(e) => e.stopPropagation()} style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
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
            <CollapsibleSection
              title={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <IconBot /> AI ICD Prediction
                </span>
              }
              defaultOpen={false}
            >
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

      {/* Document Viewer Popup */}
      {docViewerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setDocViewerUrl(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Document Viewer</h3>
                  <p className="text-xs text-slate-400 truncate max-w-md">{docViewerUrl.split('/').pop()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={docViewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => setDocViewerUrl(null)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Popup Body */}
            <div className="flex-1 bg-slate-100">
              <iframe
                src={docViewerUrl}
                title="Document Viewer"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
