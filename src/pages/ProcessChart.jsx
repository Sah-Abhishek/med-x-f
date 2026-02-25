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
  Eye, ExternalLink, Wifi, WifiOff, Clock, ChevronLeft, ChevronRight, List,
  Minimize2, Maximize2, Sparkles, ChevronDown, ChevronUp, Check, XCircle, Pencil, Save,
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

const StyledDropdown = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10,
          border: open ? "1.5px solid #c084fc" : "1.5px solid #e9d5ff",
          background: "#fff", textAlign: "left", cursor: "pointer",
          fontSize: 12, fontWeight: 600, color: selected ? "#1e293b" : "#94a3b8",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s",
          position: "relative",
        }}
      >
        {selected?.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected.dot, flexShrink: 0 }} />}
        {selected?.label || placeholder || "Select..."}
        <ChevronDown style={{
          width: 14, height: 14, color: "#a855f7", position: "absolute", right: 10, top: "50%",
          transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          transition: "transform 0.2s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 10, border: "1.5px solid #e9d5ff",
          boxShadow: "0 8px 24px rgba(168, 85, 247, 0.12)", overflow: "hidden",
          maxHeight: 200, overflowY: "auto",
        }}>
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: "100%", padding: "9px 12px", border: "none", textAlign: "left",
                  cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#7c3aed" : "#1e293b",
                  background: isActive ? "#f5f3ff" : "transparent",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#fdf4ff"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {opt.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />}
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isActive && <Check style={{ width: 14, height: 14, color: "#7c3aed" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
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

const CollapsibleCard = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", borderBottom: open ? "1px solid #f0f1f3" : "none",
        cursor: "pointer", userSelect: "none",
        borderRadius: open ? "14px 14px 0 0" : 14,
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

const FormFieldDropdown = ({ value, onChange, options = [], placeholder, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef(null);
  const searchRef = React.useRef(null);

  const normalizedOpts = options.map(opt =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const selected = normalizedOpts.find(o => o.value === value);
  const filtered = search
    ? normalizedOpts.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : normalizedOpts;
  const showSearch = normalizedOpts.length > 6;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && showSearch && searchRef.current) searchRef.current.focus();
  }, [open, showSearch]);

  if (readOnly) {
    return (
      <div style={{
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: "1px solid #d1d5db", background: "#e5e7eb",
        fontSize: 13, color: value ? "#6b7280" : "#9ca3af",
        boxSizing: "border-box", minHeight: 40, cursor: "not-allowed",
      }}>
        {selected?.label || value || placeholder || "Select..."}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 32px 10px 12px", borderRadius: 8,
          border: open ? "1.5px solid #a78bfa" : "1px solid #e2e8f0",
          background: "#fff", textAlign: "left", cursor: "pointer",
          fontSize: 13, fontWeight: 500, color: selected ? "#1a1d23" : "#94a3b8",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(167, 139, 250, 0.1)" : "none",
          position: "relative", boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selected?.label || placeholder || "Select..."}
        </span>
        <ChevronDown style={{
          width: 14, height: 14, color: "#94a3b8", position: "absolute", right: 10, top: "50%",
          transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          transition: "transform 0.2s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}>
          {showSearch && (
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: 6,
                  border: "1px solid #e2e8f0", fontSize: 12, color: "#1a1d23",
                  outline: "none", boxSizing: "border-box", background: "#f8fafc",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                No options found
              </div>
            )}
            {filtered.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange?.(opt.value); setOpen(false); setSearch(""); }}
                  style={{
                    width: "100%", padding: "8px 12px", border: "none", textAlign: "left",
                    cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#7c3aed" : "#1e293b",
                    background: isActive ? "#f5f3ff" : "transparent",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? "#f5f3ff" : "transparent"; }}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                  {isActive && <Check style={{ width: 14, height: 14, color: "#7c3aed", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FormField = ({ label, value, required, type = "text", options, placeholder, readOnly = true, onChange }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    {type === "select" ? (
      <FormFieldDropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    ) : (
      <input type={type} value={value || ""} readOnly={readOnly} placeholder={placeholder || ""}
        onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          border: `1px solid ${readOnly ? "#d1d5db" : "#e2e8f0"}`,
          background: readOnly ? "#e5e7eb" : "#fff",
          fontSize: 13, color: readOnly ? "#6b7280" : "#1a1d23", boxSizing: "border-box",
          cursor: readOnly ? "not-allowed" : "text",
        }} />
    )}
  </div>
);

const FormFieldMultiSelect = ({ value = [], onChange, options = [], placeholder, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef(null);
  const searchRef = React.useRef(null);

  const normalizedOpts = options.map(opt =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const filtered = search
    ? normalizedOpts.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : normalizedOpts;
  const showSearch = normalizedOpts.length > 6;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && showSearch && searchRef.current) searchRef.current.focus();
  }, [open, showSearch]);

  const toggleOption = (optValue) => {
    const arr = Array.isArray(value) ? value : [];
    if (arr.includes(optValue)) {
      onChange(arr.filter(v => v !== optValue));
    } else {
      onChange([...arr, optValue]);
    }
  };

  if (readOnly) {
    const display = Array.isArray(value) && value.length > 0 ? value.join(", ") : (placeholder || "Select...");
    return (
      <div style={{
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: "1px solid #d1d5db", background: "#e5e7eb",
        fontSize: 13, color: value?.length ? "#6b7280" : "#9ca3af",
        boxSizing: "border-box", minHeight: 40, cursor: "not-allowed",
      }}>
        {display}
      </div>
    );
  }

  const selectedLabels = normalizedOpts.filter(o => (value || []).includes(o.value)).map(o => o.label);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 32px 10px 12px", borderRadius: 8,
          border: open ? "1.5px solid #a78bfa" : "1px solid #e2e8f0",
          background: "#fff", textAlign: "left", cursor: "pointer",
          fontSize: 13, fontWeight: 500, color: selectedLabels.length > 0 ? "#1a1d23" : "#94a3b8",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(167, 139, 250, 0.1)" : "none",
          position: "relative", boxSizing: "border-box", minHeight: 40,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : (placeholder || "Select...")}
        </span>
        <ChevronDown style={{
          width: 14, height: 14, color: "#94a3b8", position: "absolute", right: 10, top: "50%",
          transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          transition: "transform 0.2s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}>
          {showSearch && (
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: 6,
                  border: "1px solid #e2e8f0", fontSize: 12, color: "#1a1d23",
                  outline: "none", boxSizing: "border-box", background: "#f8fafc",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                No options found
              </div>
            )}
            {filtered.map((opt) => {
              const isChecked = (value || []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  style={{
                    width: "100%", padding: "8px 12px", border: "none", textAlign: "left",
                    cursor: "pointer", fontSize: 13, fontWeight: isChecked ? 600 : 400,
                    color: isChecked ? "#7c3aed" : "#1e293b",
                    background: isChecked ? "#f5f3ff" : "transparent",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = isChecked ? "#f5f3ff" : "transparent"; }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 3, border: isChecked ? "none" : "1.5px solid #cbd5e1",
                    background: isChecked ? "#7c3aed" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isChecked && <Check style={{ width: 11, height: 11, color: "#fff" }} />}
                  </span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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

/* ── Audit rows configuration ── */
const AUDIT_ROWS = [
  { key: "primaryDiagnosis", label: "Primary Diagnosis", feedKey: "prim_diag_feed" },
  { key: "secondaryDiagnosis", label: "Secondary Diagnosis", feedKey: "sec_diag_feed" },
  { key: "procedures", label: "Procedures", feedKey: "procedure_feed" },
  { key: "edEmLevel", label: "ED/EM Level", isDropdown: true, feedKey: "ed_em_feed" },
  { key: "modifier", label: "Modifier", feedKey: "modifier_feed" },
  { key: "poaIndicator", label: "POA Indicator", feedKey: "poa_feed" },
  { key: "drgValue", label: "DRG Value", feedKey: "drug_feed" },
  { key: "total", label: "Total", noFeedback: true },
];

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
  const [config, setConfig] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [formData, setFormData] = useState({});
  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const updateCustomField = (fieldId, value) => setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
  const [auditData, setAuditData] = useState({});
  const updateAuditField = (rowKey, field, value) =>
    setAuditData(prev => ({ ...prev, [rowKey]: { ...prev[rowKey], [field]: value } }));

  // Chart navigation from Zustand store
  const getPrevId = useChartsStore((s) => s.getPrevId);
  const getNextId = useChartsStore((s) => s.getNextId);
  const currentId = Number(id);
  const prevId = getPrevId(currentId);
  const nextId = getNextId(currentId);

  // Timer state — server is source of truth; localStorage only persists start/stop display times
  const timerStorageKey = `timer_${id}`;
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(timerStorageKey)); return saved?.startTime || null; } catch { return null; }
  });
  const [timerStopTime, setTimerStopTime] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(timerStorageKey)); return saved?.stopTime || null; } catch { return null; }
  });
  const [timerStopped, setTimerStopped] = useState(true);
  const [isAnotherChartProcessing, setIsAnotherChartProcessing] = useState(null);
  const [timerMessage, setTimerMessage] = useState("");

  // Toast state
  const [toast, setToast] = useState(null); // { message, type: 'error' | 'warning' | 'info' }

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

  // MedEx AI data for this session
  const [aiData, setAiData] = useState(null);
  const [aiDataLoading, setAiDataLoading] = useState(false);
  const [aiNoSession, setAiNoSession] = useState(false);

  // Document processing API
  const DOCUMENT_PROCESS_URL = `${MEDX_API_URL}/documents/process`;
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [docViewerUrl, setDocViewerUrl] = useState(null); // for document popup
  const [docSidebarOpen, setDocSidebarOpen] = useState(true); // sidebar in popup
  const [popupMinimized, setPopupMinimized] = useState(false); // popup collapsed to mini sidebar
  const [popupSidebarView, setPopupSidebarView] = useState("documents"); // "documents" | "ai-summary"
  const [uploadSectionOpen, setUploadSectionOpen] = useState(false); // upload section collapsed/expanded

  // Review & Edit popup state
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [codeDecisions, setCodeDecisions] = useState({}); // { [code]: { status, editedCode?, editedDesc? } }
  const [selectedCode, setSelectedCode] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [reviewTab, setReviewTab] = useState("document"); // "document" | "ai-summary"
  const [reviewDocIndex, setReviewDocIndex] = useState(0); // which document to show in review popup
  const [customCodes, setCustomCodes] = useState([]); // user-added codes
  const [addingCode, setAddingCode] = useState(false); // whether the add-code form is open
  const [newCodeForm, setNewCodeForm] = useState({ code: '', description: '', type: 'icd', category: 'Secondary' });
  const [submitPopupOpen, setSubmitPopupOpen] = useState(false); // review & submit popup

  // WebSocket job status tracking — recover jobId from upload result or from aiData on page reload
  const jobId = uploadResult?.jobId || aiData?.activeJobId || null;
  const { status: jobStatus, phase: jobPhase, message: jobMessage, isConnected: wsConnected } = useJobStatus(jobId);

  // Phase progression for the visual tracker
  const PHASES = [
    { key: "pending", label: "Queued" },
    { key: "processing", label: "Processing" },
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

      formData.append("sessionId", id);
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
        const c = response.data.data;
        setChart(c);
        setFormData({
          chartNo: c.ChartNo || "",
          mrNo: c.MR_No || "",
          dateOfService: c.DateOfService || "",
          admitDate: c.AdmitDate || "",
          dischargeDate: c.DischargeDate || "",
          disposition: c.Disposition || "",
          em: c.EM || "",
          primaryDiagnosis: c.PrimaryDiagnosis || "",
          primaryHealth: c.PrimaryHealth || "",
          facility: c.Facility || "",
          poa: c.poa || "",
          los: c.los || "",
          drgValue: c.drg_value || "",
          procedureCode: c.procedure_code || "",
          subSpecialty: c.SubSpecialty || "",
          chartStatus: c.Status || "",
          responsibleParty: c.ResponsibleParty ? (Array.isArray(c.ResponsibleParty) ? c.ResponsibleParty : c.ResponsibleParty.split(",").map(s => s.trim()).filter(Boolean)) : [],
          holdReason: c.HoldReason ? (Array.isArray(c.HoldReason) ? c.HoldReason : c.HoldReason.split(",").map(s => s.trim()).filter(Boolean)) : [],
          coderComments: c.CoderComments || "",
          rejectionComments: c.RejectionComments || "",
          deficiencyComments: c.DeficiencyComments || "",
          auditOption: c.AuditOption ? (Array.isArray(c.AuditOption) ? c.AuditOption : c.AuditOption.split(",").map(s => s.trim()).filter(Boolean)) : [],
          qcStatus: c.qc_status || "",
          priority: c.Priority || null,
          feedbackType: c.FeedbackType || "",
          auditorQcStatus: c.AuditorQcStatus || "",
          allocateAuditor: c.AllocateAuditor || "",
          allocateCoder: c.AllocateCoder || "",
        });
        fetchCustomFields(c.ClientId, c.LocationId);
        fetchConfiguration(c.ClientId, c.LocationId);
        fetchMasterData(c.ClientId, c.LocationId);
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

  const fetchAiData = useCallback(async () => {
    setAiDataLoading(true);
    setAiNoSession(false);
    try {
      const response = await axios.get(`${MEDX_API_URL}/charts/session/${id}`, {
        headers: {
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
        },
      });
      if (response.data.success) {
        setAiData(response.data.chart);
        setAiNoSession(false);
      } else {
        setAiNoSession(true);
      }
    } catch (e) {
      // No AI data for this session yet
      setAiNoSession(true);
      console.log("No AI data found for session:", id);
    } finally {
      setAiDataLoading(false);
    }
  }, [id]);

  const fetchConfiguration = useCallback(async (clientId = 0, locationId = 1) => {
    try {
      const response = await api.get(
        `https://uat-app.valerionhealth.com/users/getcongfiguration/${clientId}/${locationId}`
      );
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch configuration:", e.message);
    }
  }, []);

  const fetchMasterData = useCallback(async (clientId = 0, locationId = 0) => {
    try {
      const response = await api.get("/hn-master-data", {
        params: { client: clientId, location: locationId },
      });
      if (response.data.success) {
        setMasterData(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch master data:", e.message);
    }
  }, []);

  const fetchCustomFields = useCallback(async (clientId, locationId) => {
    try {
      const response = await api.get(`/users/configurations/chart-custom-fields/${clientId}/${locationId}`);
      if (response.data?.data) {
        setCustomFields(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch custom fields:", e.message);
    }
  }, []);

  // Check if a chart is under process on page load
  const checkTimerStatus = useCallback(async () => {
    try {
      const res = await api.get("/users/processing-chart");
      if (res.data?.success) {
        setIsAnotherChartProcessing(res.data.isChartUnderProcess);
      }
    } catch (e) {
      console.error("Failed to check timer status on load:", e.message);
    }
  }, []);

  useEffect(() => {
    fetchChart();
    fetchAiData();
    checkTimerStatus();
  }, [fetchChart, fetchAiData, checkTimerStatus]);

  // Combined timer logic: decide timer state from MilestoneId + isAnotherChartProcessing
  useEffect(() => {
    if (!chart || isAnotherChartProcessing === null) return;

    if (chart.MilestoneId === 3) {
      // Chart is being coded — compute elapsed from server timestamp
      if (chart.timer) {
        const serverStart = new Date(chart.timer).getTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - serverStart) / 1000));
        setTimerSeconds(elapsed);
      } else {
        setTimerSeconds(0);
      }
      setTimerRunning(true);
      setTimerStopped(false);
      setTimerStartTime(now());
      setTimerMessage("");
    } else {
      // MilestoneId < 3 — chart is NOT under coding
      setTimerSeconds(0);
      setTimerRunning(false);
      setTimerStopped(true);
      setTimerStartTime(null);
      if (isAnotherChartProcessing) {
        setTimerMessage("Another chart is in process");
      } else {
        setTimerMessage("");
      }
    }
  }, [chart, isAnotherChartProcessing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch AI data when job completes
  useEffect(() => {
    if (jobStatus === "completed") {
      fetchAiData();
    }
  }, [jobStatus, fetchAiData]);

  // Poll aiData while aiStatus is processing/queued (handles page refresh mid-processing)
  useEffect(() => {
    if (!aiData) return;
    const status = aiData.aiStatus;
    if (status !== 'processing' && status !== 'queued') return;

    const interval = setInterval(() => {
      fetchAiData();
    }, 5000);

    return () => clearInterval(interval);
  }, [aiData?.aiStatus, fetchAiData]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Persist timer state to localStorage
  useEffect(() => {
    const data = { seconds: timerSeconds, running: timerRunning, startTime: timerStartTime, stopTime: timerStopTime, stopped: timerStopped };
    if (timerRunning) data.runStartedAt = Date.now();
    localStorage.setItem(timerStorageKey, JSON.stringify(data));
  }, [timerSeconds, timerRunning, timerStartTime, timerStopTime, timerStopped, timerStorageKey]);

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

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;

    // --- Required field validation ---
    const missing = [];
    if (!formData.chartNo) missing.push("Chart #");
    if (!formData.mrNo) missing.push("MR#");
    if (!formData.dateOfService) missing.push("Date of Service");
    if (!formData.admitDate) missing.push("Admit Date");
    if (!formData.dischargeDate) missing.push("Discharge Date");
    if (!formData.disposition) missing.push("Disposition");
    if (!formData.primaryDiagnosis) missing.push("Primary Diagnosis");
    if (!formData.facility) missing.push("Facility");
    if (!formData.poa) missing.push("POA");
    if (!formData.los) missing.push("LOS");
    if (!formData.drgValue) missing.push("DRG Value");
    if (!formData.subSpecialty) missing.push("Sub Specialty");
    if (!formData.chartStatus || formData.chartStatus === "Open") missing.push("Chart Status");
    if (formData.chartStatus === "Incomplete" && (!formData.holdReason || formData.holdReason.length === 0)) missing.push("Hold Reason");
    if (!formData.coderComments || !formData.coderComments.trim()) missing.push("Coder Comments");

    // Custom mandatory fields
    for (const field of customFields) {
      if (field.validation === "Mandatory") {
        const val = customFieldValues[field.id];
        if (field.type === "dropdown" && field.isMultiSelect) {
          if (!val || !Array.isArray(val) || val.length === 0) missing.push(field.name);
        } else {
          if (!val) missing.push(field.name);
        }
      }
    }

    if (missing.length > 0) {
      showToast("Required fields missing: " + missing.join(", "));
      return;
    }

    setSaving(true);
    try {
      // Resolve next_user_id from allocateCoder or allocateAuditor
      let nextUserId = null;
      if (formData.allocateCoder) {
        const coder = masterData?.coders_active?.find(c => c.name === formData.allocateCoder);
        nextUserId = coder?.id || null;
      } else if (formData.allocateAuditor) {
        const auditor = masterData?.auditors_active?.find(a => a.name === formData.allocateAuditor);
        nextUserId = auditor?.id || null;
      }

      // Resolve IDs from config
      const dispositionId = config?.dispositions?.find(d => d.disposition_name === formData.disposition)?.id || null;
      const facilityId = config?.facility?.find(f => f.FacilityName === formData.facility)?.id || null;
      const primaryHealthId = config?.primary_health?.find(p => p.PrimaryHealthName === formData.primaryHealth)?.id || null;
      const subSpecialtyId = config?.subspecialties?.find(s => s.SubSpecialtyName === formData.subSpecialty)?.id || null;
      const statusId = formData.chartStatus === "Complete" ? 2 : formData.chartStatus === "Incomplete" ? 3 : null;
      const qcStatusId = masterData?.qc_status?.find(q => q.name === formData.qcStatus)?.id || null;
      const responsiblePartyIds = (formData.responsibleParty || []).map(name => config?.responsible_parties?.find(r => r.resp_party_name === name)?.id).filter(Boolean);
      const holdReasonIds = (formData.holdReason || []).map(name => config?.hold_reasons?.find(h => h.hold_reason === name)?.id).filter(Boolean);
      const auditOptionIds = (formData.auditOption || []).map(name => config?.audit_options?.find(a => a.audit_opt === name)?.id).filter(Boolean);

      const payload = {
        admit_date: formData.admitDate || null,
        chart_no: formData.chartNo || null,
        coder_comments: null,
        date_of_completion: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        date_of_service: formData.dateOfService || null,
        discharge_date: formData.dischargeDate || null,
        em: formData.em || null,
        mr_no: formData.mrNo || null,
        primary_diagnosis: formData.primaryDiagnosis || null,
        next_user_id: nextUserId,
        poa: formData.poa || null,
        los: formData.los ? Number(formData.los) : null,
        drg_value: formData.drgValue ? Number(formData.drgValue) : null,
        procedure_code: formData.procedureCode || null,
        denial_comments: formData.rejectionComments || null,
        ResponsibleParties: responsiblePartyIds,
        deficiency_comments: formData.deficiencyComments || null,
        HoldReasons: holdReasonIds,
        DispositionId: dispositionId,
        FacilityId: facilityId,
        PrimaryHealthId: primaryHealthId,
        SubSpecialtyId: subSpecialtyId,
        StatusId: statusId,
        QCStatusId: qcStatusId,
        AuditOptions: auditOptionIds,
        comment_msg: formData.coderComments || null,
        chartInfoCustomFields: customFieldValues,
      };

      await api.post(`/charts/${id}`, payload);
      showToast("Chart saved successfully!", "success");
    } catch (e) {
      console.error("Failed to save chart:", e.message);
      showToast("Failed to save chart. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTimerStart = async () => {
    if (timerRunning) return;

    // Step 1: Check if documents are uploaded
    if (aiNoSession || !aiData?.documents || aiData.documents.length === 0) {
      showToast("Please upload documents before starting the timer.", "warning");
      return;
    }

    // Step 2: Check if another chart is already being processed
    try {
      const res = await api.get("/users/processing-chart");
      if (res.data?.success && res.data?.isChartUnderProcess) {
        showToast("You already have a chart under process. Please complete or release it before starting a new one.", "warning");
        return;
      }
    } catch (e) {
      console.error("Failed to check processing-chart status:", e.message);
      showToast("Unable to verify processing status. Please try again.", "error");
      return;
    }

    // Step 3: Call timer API to register start on backend
    try {
      const timerRes = await api.post(`/charts/${id}/timer`);
      if (!timerRes.data?.success) {
        showToast(timerRes.data?.message || "Failed to start timer. Please try again.", "warning");
        return;
      }
    } catch (e) {
      console.error("Failed to start timer:", e.message);
      showToast(e.response?.data?.message || "Failed to start timer. Please try again.", "error");
      return;
    }

    // All checks passed and backend confirmed — start the local timer
    setTimerRunning(true);
    setTimerStopped(false);
    setTimerStartTime(now());
    setTimerStopTime(null);
    setTimerMessage("");
  };

  const handleTimerStop = async () => {
    if (!timerRunning) return;

    // Call timer API to register stop on backend
    try {
      const timerRes = await api.post(`/charts/${id}/timer`);
      if (!timerRes.data?.success) {
        const msg = timerRes.data?.message;
        if (msg === "Chart status has to be updated") {
          showToast("Please save the chart before stopping the timer.", "warning");
        } else {
          showToast(msg || "Failed to stop timer. Please try again.", "warning");
        }
        return;
      }
    } catch (e) {
      console.error("Failed to stop timer:", e.message);
      const msg = e.response?.data?.message;
      if (msg === "Chart status has to be updated") {
        showToast("Please save the chart before stopping the timer.", "warning");
      } else {
        showToast(msg || "Failed to stop timer. Please try again.", "error");
      }
      return;
    }

    // Backend confirmed — stop local timer and reset
    setTimerRunning(false);
    setTimerStopTime(now());
    setTimerSeconds(0);
    setTimerStopped(true);
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

  const renderCustomFields = (placement) => {
    const fields = customFields.filter(f => f.placement === placement);
    if (fields.length === 0) return null;
    const rows = [];
    for (let i = 0; i < fields.length; i += 3) {
      rows.push(fields.slice(i, i + 3));
    }
    return rows.map((row, rowIdx) => (
      <div key={`cf-${placement}-${rowIdx}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
        {row.map(field => {
          const isRequired = field.validation === "Mandatory";
          const options = field.ChartInfoDropdowns?.map(item => ({ value: item.name, label: item.name })) || [];
          if (field.type === "dropdown" && field.isMultiSelect) {
            return (
              <div key={field.id} style={{ flex: 1, minWidth: 0 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  {field.name}{isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                </label>
                <FormFieldMultiSelect
                  value={customFieldValues[field.id] || []}
                  onChange={(v) => updateCustomField(field.id, v)}
                  options={options}
                  placeholder="Select..."
                  readOnly={timerStopped}
                />
              </div>
            );
          }
          if (field.type === "dropdown") {
            return (
              <FormField
                key={field.id}
                label={field.name}
                value={customFieldValues[field.id] || ""}
                required={isRequired}
                type="select"
                options={options}
                placeholder="Select..."
                readOnly={timerStopped}
                onChange={(v) => updateCustomField(field.id, v)}
              />
            );
          }
          return (
            <FormField
              key={field.id}
              label={field.name}
              value={customFieldValues[field.id] || ""}
              required={isRequired}
              type={field.type === "number" ? "number" : "text"}
              readOnly={timerStopped}
              onChange={(v) => updateCustomField(field.id, v)}
            />
          );
        })}
        {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => <div key={`empty-${i}`} />)}
      </div>
    ));
  };

  return (
    <DashboardLayout>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          padding: "14px 20px", borderRadius: 12, maxWidth: 400,
          background: toast.type === "warning" ? "#fef3c7" : toast.type === "error" ? "#fef2f2" : "#eff6ff",
          border: `1px solid ${toast.type === "warning" ? "#f59e0b" : toast.type === "error" ? "#ef4444" : "#3b82f6"}`,
          color: toast.type === "warning" ? "#92400e" : toast.type === "error" ? "#991b1b" : "#1e40af",
          fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "flex-start", gap: 10,
          animation: "slideInRight 0.3s ease-out",
        }}>
          <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            {toast.type === "warning" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ) : toast.type === "error" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            )}
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 16,
            color: "inherit", padding: 0, lineHeight: 1, opacity: 0.6,
          }}>&times;</button>
        </div>
      )}
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
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
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: timerMessage ? 8 : 16 }}>
                  {formatTime(timerSeconds)}
                </div>
                {timerMessage && (
                  <div style={{
                    background: "rgba(255,255,255,0.25)", borderRadius: 20,
                    padding: "4px 14px", fontSize: 11, fontWeight: 600,
                    marginBottom: 12, color: "#fff", letterSpacing: 0.3,
                  }}>
                    {timerMessage}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={handleTimerStart} disabled={!!timerMessage} style={{
                    padding: "8px 24px", borderRadius: 8, border: "none",
                    background: timerRunning || timerMessage ? "rgba(255,255,255,0.3)" : "#10b981",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: timerMessage ? "not-allowed" : "pointer",
                    opacity: timerMessage ? 0.6 : 1,
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

            {/* Upload Header — collapsible when documents exist */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden" style={{ marginBottom: 20 }}>
              <div
                className={`px-6 py-4 ${getTabColor(activeTab, 'light')} border-b ${getTabColor(activeTab, 'border')} cursor-pointer select-none`}
                onClick={() => setUploadSectionOpen(o => !o)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(currentTab.icon, { className: `w-5 h-5 ${getTabColor(activeTab, 'text')}` })}
                    <div>
                      <h2 className={`font-semibold ${getTabColor(activeTab, 'text')}`}>
                        {aiData?.documents?.length > 0 ? 'Upload More Documents' : 'Upload Medical Documents'}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {aiData?.documents?.length > 0
                          ? `${aiData.documents.length} document${aiData.documents.length !== 1 ? 's' : ''} uploaded — click to add more`
                          : 'Add documents (PDF, Word), grouped images, or paste clinical text'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {aiData?.documents?.length > 0 && !uploadSectionOpen && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                        {aiData.documents.length} uploaded
                      </span>
                    )}
                    {uploadSectionOpen ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-amber-500" />}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {(uploadSectionOpen || (!aiData?.documents?.length)) && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
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
                </div>}

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

                  {/* Live Job Progress Bar (during active processing) */}
                  {jobId && jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed' && (() => {
                    const progressPercent = jobStatus === 'failed' ? Math.round(((currentPhaseIndex >= 0 ? currentPhaseIndex : 0) / (PHASES.length - 1)) * 100)
                      : jobStatus === 'completed' ? 100
                      : currentPhaseIndex >= 0 ? Math.round(((currentPhaseIndex + 0.5) / (PHASES.length - 1)) * 100)
                      : 0;
                    const isFailed = jobStatus === 'failed';
                    const isComplete = jobStatus === 'completed';
                    const barColor = isFailed ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : 'bg-amber-500';
                    const textColor = isFailed ? 'text-red-700' : isComplete ? 'text-emerald-700' : 'text-amber-700';

                    return (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                             isFailed ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                             <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                            <span className={`text-sm font-semibold ${textColor}`}>
                              {isComplete ? 'Processing Complete' : isFailed ? 'Processing Failed' : 'Processing...'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${textColor}`}>{progressPercent}%</span>
                            <div className="flex items-center gap-1">
                              {wsConnected ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-slate-400" />}
                            </div>
                          </div>
                        </div>

                        {/* Single progress bar */}
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} ${!isComplete && !isFailed ? 'animate-pulse' : ''}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {jobMessage && (
                          <p className={`text-xs ${isFailed ? 'text-red-600' : 'text-slate-500'}`}>{jobMessage}</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* AI Status & Uploaded Documents (from saved session data) */}
                  {aiData && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {/* AI Status Header */}
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            aiData.aiStatus === 'ready' ? 'bg-emerald-50' :
                            aiData.aiStatus === 'failed' ? 'bg-red-50' :
                            aiData.aiStatus === 'processing' || aiData.aiStatus === 'queued' ? 'bg-amber-50' :
                            'bg-slate-50'
                          }`}>
                            {aiData.aiStatus === 'ready' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                             aiData.aiStatus === 'failed' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                             aiData.aiStatus === 'processing' || aiData.aiStatus === 'queued' ? <Loader2 className="w-5 h-5 text-amber-500 animate-spin" /> :
                             <Clock className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">AI Processing</h4>
                            <p className="text-xs text-slate-500">
                              {aiData.aiStatus === 'ready' ? 'Completed — AI results available' :
                               aiData.aiStatus === 'failed' ? 'Failed — processing encountered an error' :
                               aiData.aiStatus === 'processing' ? 'Processing — AI is analyzing documents' :
                               aiData.aiStatus === 'queued' ? 'Queued — waiting for processing' :
                               aiData.aiStatus === 'submitted' ? 'Submitted — codes sent to NextCode' :
                               `Status: ${aiData.aiStatus}`}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          aiData.aiStatus === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          aiData.aiStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                          aiData.aiStatus === 'processing' || aiData.aiStatus === 'queued' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          aiData.aiStatus === 'submitted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {aiData.aiStatus?.toUpperCase()}
                        </span>
                      </div>

                      {/* Error Message */}
                      {aiData.aiStatus === 'failed' && aiData.lastError && (
                        <div className="mx-5 mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Processing Error</p>
                            <p className="text-xs mt-0.5 text-red-600">{aiData.lastError}</p>
                            {aiData.retryCount > 0 && (
                              <p className="text-xs mt-1 text-red-500">Retried {aiData.retryCount} time(s)</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Uploaded Documents List */}
                      {aiData.documents?.length > 0 && (
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Uploaded Documents
                            </span>
                            <span className="text-xs text-slate-400">
                              {aiData.documents.length} file{aiData.documents.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {aiData.documents.map((doc) => {
                              const isPdf = doc.mimeType === 'application/pdf';
                              const isWord = doc.mimeType?.includes('word') || doc.mimeType?.includes('doc');
                              const isImage = doc.mimeType?.startsWith('image/');
                              const fileTypeLabel = isPdf ? 'PDF' : isWord ? 'DOC' : isImage ? 'IMG' : 'FILE';
                              const fileTypeColor = isPdf ? 'text-red-600 bg-red-50' : isWord ? 'text-blue-600 bg-blue-50' : isImage ? 'text-purple-600 bg-purple-50' : 'text-slate-600 bg-slate-50';
                              const iconColor = isPdf ? 'bg-red-50' : isWord ? 'bg-blue-50' : isImage ? 'bg-purple-50' : 'bg-slate-50';
                              const iconTextColor = isPdf ? 'text-red-500' : isWord ? 'text-blue-500' : isImage ? 'text-purple-500' : 'text-slate-500';

                              return (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors">
                                  <div className={`w-9 h-9 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
                                    {isImage ? <FileImage className={`w-4 h-4 ${iconTextColor}`} /> : <FileText className={`w-4 h-4 ${iconTextColor}`} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{doc.filename}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${fileTypeColor}`}>
                                        {fileTypeLabel}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {doc.fileSize < 1024 ? doc.fileSize + ' B' :
                                         doc.fileSize < 1048576 ? (doc.fileSize / 1024).toFixed(1) + ' KB' :
                                         (doc.fileSize / 1048576).toFixed(1) + ' MB'}
                                      </span>
                                      {doc.ocrStatus && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                          doc.ocrStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                          doc.ocrStatus === 'failed' ? 'bg-red-50 text-red-600' :
                                          'bg-amber-50 text-amber-600'
                                        }`}>
                                          OCR: {doc.ocrStatus}
                                        </span>
                                      )}
                                      {doc.transactionId && (
                                        <span className="text-[10px] text-slate-400 font-mono">{doc.transactionId}</span>
                                      )}
                                    </div>
                                  </div>
                                  {doc.s3Url && (
                                    <button
                                      onClick={() => setDocViewerUrl(doc.s3Url)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors flex-shrink-0"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      View
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* No documents yet */}
                      {(!aiData.documents || aiData.documents.length === 0) && (
                        <div className="p-5 text-center">
                          <p className="text-sm text-slate-400">No documents uploaded yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loading state for AI data */}
                  {aiDataLoading && !aiData && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading session data...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Info Section — Collapsible */}
            <CollapsibleCard title="Chart Info" subtitle="All relevant chart fields" defaultOpen={true}>
              <div style={timerStopped ? { pointerEvents: "none" } : {}}>
              {/* Row 1: Chart #, MR#, Date of Service */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Chart #" value={formData.chartNo} required readOnly={timerStopped} onChange={(v) => updateForm("chartNo", v)} />
                <FormField label="MR#" value={formData.mrNo} required readOnly={timerStopped} onChange={(v) => updateForm("mrNo", v)} />
                <FormField label="Date of Service" value={formData.dateOfService} required readOnly={timerStopped} onChange={(v) => updateForm("dateOfService", v)} />
              </div>
              {/* Row 2: Admit date, Discharge date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Admit date" value={formData.admitDate} required readOnly={timerStopped} onChange={(v) => updateForm("admitDate", v)} />
                <FormField label="Discharge date" value={formData.dischargeDate} required readOnly={timerStopped} onChange={(v) => updateForm("dischargeDate", v)} />
                <div />
              </div>
              {/* Row 3: Disposition, EM, Primary diagnosis */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Disposition" value={formData.disposition} type="select" required readOnly={timerStopped} onChange={(v) => updateForm("disposition", v)} options={config?.dispositions?.map(d => d.disposition_name) || []} />
                <FormField label="EM" value={formData.em} readOnly={timerStopped} onChange={(v) => updateForm("em", v)} />
                <FormField label="Primary diagnosis" value={formData.primaryDiagnosis} required readOnly={timerStopped} onChange={(v) => updateForm("primaryDiagnosis", v)} />
              </div>
              {/* Row 4: Primary Health Plan, Facility */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Primary Health Plan" value={formData.primaryHealth} type="select" readOnly={timerStopped} onChange={(v) => updateForm("primaryHealth", v)} options={config?.primary_health?.map(p => p.PrimaryHealthName) || []} />
                <FormField label="Facility" value={formData.facility} type="select" required readOnly={timerStopped} onChange={(v) => updateForm("facility", v)} options={config?.facility?.map(f => f.FacilityName) || []} />
              </div>
              {/* Row 5: POA, LOS, DRG Value */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="POA" value={formData.poa} required readOnly={timerStopped} onChange={(v) => updateForm("poa", v.slice(0, 1))} />
                <FormField label="LOS" value={formData.los} required readOnly={timerStopped} onChange={(v) => updateForm("los", v.slice(0, 3))} />
                <FormField label="DRG Value" value={formData.drgValue} required readOnly={timerStopped} onChange={(v) => updateForm("drgValue", v.slice(0, 3))} />
              </div>
              {/* Row 6: Procedure code, Sub Specialty */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <FormField label="Procedure code" value={formData.procedureCode} readOnly={timerStopped} onChange={(v) => updateForm("procedureCode", v)} />
                <FormField label="Sub Specialty" value={formData.subSpecialty} type="select" required readOnly={timerStopped} onChange={(v) => updateForm("subSpecialty", v)} options={config?.subspecialties?.map(s => s.SubSpecialtyName) || []} />
                <div />
              </div>
              {renderCustomFields("Chart Info")}
              </div>
            </CollapsibleCard>

            {/* Processing Info Section — Collapsible */}
            <CollapsibleCard title="Processing Info" subtitle="All fields related to processing this chart" defaultOpen={true}>
              <div style={timerStopped ? { pointerEvents: "none" } : {}}>
              {/* Row 1: Chart status, Responsible party */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Chart status" value={formData.chartStatus || "Open"} type="select" required readOnly={timerStopped} onChange={(v) => updateForm("chartStatus", v)} options={["Complete", "Incomplete"]} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Responsible party</label>
                  <FormFieldMultiSelect
                    value={formData.responsibleParty || []}
                    onChange={(v) => updateForm("responsibleParty", v)}
                    options={config?.responsible_parties?.map(r => r.resp_party_name) || []}
                    placeholder="Select..."
                    readOnly={timerStopped}
                  />
                </div>
              </div>
              {/* Row 2: Hold reason — disabled when Open or Complete */}
              <div style={{ marginBottom: 16, opacity: timerStopped ? 0.5 : ((formData.chartStatus || "Open") === "Incomplete" ? 1 : 0.5), pointerEvents: timerStopped ? "none" : ((formData.chartStatus || "Open") === "Incomplete" ? "auto" : "none") }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Hold reason{(formData.chartStatus === "Incomplete") && <span style={{ color: "#ef4444" }}> *</span>}</label>
                  <FormFieldMultiSelect
                    value={formData.holdReason || []}
                    onChange={(v) => updateForm("holdReason", v)}
                    options={config?.hold_reasons?.map(h => h.hold_reason) || []}
                    placeholder="Select..."
                    readOnly={timerStopped || (formData.chartStatus || "Open") !== "Incomplete"}
                  />
                </div>
              </div>
              {/* Row 3: Coder comments to client — disabled when Complete */}
              <div style={{ marginBottom: 16, opacity: timerStopped ? 0.5 : ((formData.chartStatus || "Open") === "Complete" ? 0.5 : 1), pointerEvents: timerStopped ? "none" : ((formData.chartStatus || "Open") === "Complete" ? "none" : "auto") }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  Coder comments to client<span style={{ color: "#ef4444" }}> *</span>
                </label>
                <textarea rows={3} value={formData.coderComments || ""} readOnly={timerStopped || (formData.chartStatus || "Open") === "Complete"} onChange={(e) => updateForm("coderComments", e.target.value)} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid ${timerStopped || (formData.chartStatus || "Open") === "Complete" ? "#d1d5db" : "#e2e8f0"}`,
                  background: timerStopped || (formData.chartStatus || "Open") === "Complete" ? "#e5e7eb" : "#fff",
                  fontSize: 13, color: timerStopped || (formData.chartStatus || "Open") === "Complete" ? "#6b7280" : "#1a1d23",
                  resize: "vertical", boxSizing: "border-box",
                  cursor: timerStopped || (formData.chartStatus || "Open") === "Complete" ? "not-allowed" : "text",
                }} />
              </div>
              {/* Row 4: Rejection / Denial Comments */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  Rejection / Denial Comments
                </label>
                <textarea rows={3} value={formData.rejectionComments || ""} readOnly={timerStopped} onChange={(e) => updateForm("rejectionComments", e.target.value)} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid ${timerStopped ? "#d1d5db" : "#e2e8f0"}`,
                  background: timerStopped ? "#e5e7eb" : "#fff",
                  fontSize: 13, color: timerStopped ? "#6b7280" : "#1a1d23", resize: "vertical", boxSizing: "border-box",
                  cursor: timerStopped ? "not-allowed" : "text",
                }} />
              </div>
              {/* Row 5: Deficiency Comments */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  Deficiency Comments
                </label>
                <textarea rows={3} value={formData.deficiencyComments || ""} readOnly={timerStopped} onChange={(e) => updateForm("deficiencyComments", e.target.value)} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid ${timerStopped ? "#d1d5db" : "#e2e8f0"}`,
                  background: timerStopped ? "#e5e7eb" : "#fff",
                  fontSize: 13, color: timerStopped ? "#6b7280" : "#1a1d23", resize: "vertical", boxSizing: "border-box",
                  cursor: timerStopped ? "not-allowed" : "text",
                }} />
              </div>
              {/* Row 6: Date of completion, Audit options, Coder QC Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <FormField label="Date of completion" value={new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} readOnly />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Audit options<span style={{ color: "#ef4444" }}> *</span></label>
                  <FormFieldMultiSelect
                    value={formData.auditOption || []}
                    onChange={(v) => updateForm("auditOption", v)}
                    options={config?.audit_options?.map(a => a.audit_opt) || []}
                    placeholder="Select..."
                    readOnly={timerStopped}
                  />
                </div>
                <FormField label="Coder QC Status" value={formData.qcStatus} required type="select" readOnly={timerStopped || chart?.MilestoneId !== 4} onChange={(v) => updateForm("qcStatus", v)} placeholder="Select..." />
              </div>
              {/* Row 7: Allocate to auditor, Allocate to Coder, Priority */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <FormField label="Allocate to auditor" value={formData.allocateAuditor} type="select" readOnly={timerStopped || !!formData.allocateCoder} onChange={(v) => updateForm("allocateAuditor", v)} placeholder="Select..." options={masterData?.auditors_active?.map(a => ({ value: a.name, label: a.name || "None" })) || []} />
                <FormField label="Allocate to Coder" value={formData.allocateCoder} type="select" readOnly={timerStopped} onChange={(v) => updateForm("allocateCoder", v)} placeholder="Select..." options={masterData?.coders_active?.map(c => ({ value: c.name, label: c.name || "None" })) || []} />
                <FormField label="Priority" value={formData.priority} type="select" readOnly={timerStopped || chart?.MilestoneId !== 4} onChange={(v) => updateForm("priority", v)} placeholder="Select..." options={["Critical", "High", "Medium", "Low"]} />
              </div>
              {renderCustomFields("Processing Info")}
              </div>
            </CollapsibleCard>

            {/* Audit Information Section — Collapsible */}
            <CollapsibleCard title="Audit Information" defaultOpen={false}>
              <div style={timerStopped || chart?.MilestoneId === 3 ? { pointerEvents: "none", opacity: 0.5, filter: "grayscale(0.6)", background: "#f3f4f6", borderRadius: 10, padding: 12 } : {}}>
                {/* Audit table */}
                <div style={{ border: "1px solid #e8eaed", borderRadius: 10, overflow: "visible" }}>
                  {/* Header row */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr",
                    background: "#fafafa", borderBottom: "1px solid #e8eaed",
                    borderRadius: "10px 10px 0 0",
                  }}>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase", borderRight: "1px dashed #e8eaed" }}>Area</div>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>Total Codes</div>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>Correct Codes</div>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>
                      <span style={{ background: "#fef3c7", borderRadius: 3, padding: "1px 4px" }}>Feedback</span> Category
                    </div>
                  </div>
                  {/* Data rows */}
                  {AUDIT_ROWS.map((row, idx) => (
                    <div key={row.key} style={{
                      display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr",
                      borderBottom: idx < AUDIT_ROWS.length - 1 ? "1px solid #f0f1f3" : "none",
                      alignItems: "center",
                    }}>
                      <div style={{
                        padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#334155",
                        borderRight: "1px dashed #e8eaed",
                      }}>{row.label}</div>
                      <div style={{ padding: "8px 12px" }}>
                        {row.isDropdown ? (
                          <FormFieldDropdown
                            value={auditData[row.key]?.totalCodes || ""}
                            onChange={(v) => updateAuditField(row.key, "totalCodes", v)}
                            options={config?.[row.feedKey]?.map(f => f.feedback_name) || []}
                            placeholder="Select..."
                            readOnly={timerStopped}
                          />
                        ) : (
                          <input
                            type="text"
                            value={auditData[row.key]?.totalCodes || ""}
                            readOnly={timerStopped}
                            onChange={timerStopped ? undefined : (e) => updateAuditField(row.key, "totalCodes", e.target.value)}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: `1px solid ${timerStopped ? "#d1d5db" : "#e2e8f0"}`,
                              background: timerStopped ? "#e5e7eb" : "#fff",
                              fontSize: 13, color: timerStopped ? "#6b7280" : "#1a1d23",
                              boxSizing: "border-box", cursor: timerStopped ? "not-allowed" : "text",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ padding: "8px 12px" }}>
                        {row.isDropdown ? (
                          <FormFieldDropdown
                            value={auditData[row.key]?.correctCodes || ""}
                            onChange={(v) => updateAuditField(row.key, "correctCodes", v)}
                            options={config?.[row.feedKey]?.map(f => f.feedback_name) || []}
                            placeholder="Select..."
                            readOnly={timerStopped}
                          />
                        ) : (
                          <input
                            type="text"
                            value={auditData[row.key]?.correctCodes || ""}
                            readOnly={timerStopped}
                            onChange={timerStopped ? undefined : (e) => updateAuditField(row.key, "correctCodes", e.target.value)}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: `1px solid ${timerStopped ? "#d1d5db" : "#e2e8f0"}`,
                              background: timerStopped ? "#e5e7eb" : "#fff",
                              fontSize: 13, color: timerStopped ? "#6b7280" : "#1a1d23",
                              boxSizing: "border-box", cursor: timerStopped ? "not-allowed" : "text",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ padding: "8px 12px" }}>
                        {!row.noFeedback && (
                          <FormFieldDropdown
                            value={auditData[row.key]?.feedbackCategory || ""}
                            onChange={(v) => updateAuditField(row.key, "feedbackCategory", v)}
                            options={config?.[row.feedKey]?.map(f => f.feedback_name) || []}
                            placeholder="Select..."
                            readOnly={timerStopped}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback Type & Auditor QC Status below table */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      <span style={{ background: "#fef3c7", borderRadius: 3, padding: "1px 4px" }}>Feedback</span> Type<span style={{ color: "#ef4444" }}> *</span>
                    </label>
                    <FormFieldDropdown
                      value={formData.feedbackType}
                      onChange={(v) => updateForm("feedbackType", v)}
                      options={config?.feedback_types?.map(f => f.feed_type_name) || []}
                      placeholder="Select..."
                      readOnly={timerStopped}
                    />
                  </div>
                  <FormField label="Auditor QC Status" value={formData.auditorQcStatus} required type="select" readOnly={timerStopped} onChange={(v) => updateForm("auditorQcStatus", v)} placeholder="Select..." />
                </div>

                {renderCustomFields("Audit Info")}
              </div>
            </CollapsibleCard>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "12px 32px", borderRadius: 10, border: "none",
                background: saving ? "#fca5a5" : "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer", marginBottom: 20,
                opacity: saving ? 0.7 : 1,
              }}>
              {saving ? "Saving..." : "Save"}
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
              defaultOpen={true}
            >
              {(() => {
                const str = (val) => { if (val == null) return ''; if (typeof val === 'string') return val; return String(val); };
                const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || '');
                const getDesc = (item) => str(item?.description || item?.finding || '');
                const dc = aiData?.diagnosisCodes;
                const procs = aiData?.procedures;
                const hasCodes = dc && (
                  dc.principal_diagnosis || dc.primary_diagnosis?.length > 0 ||
                  dc.secondary_diagnoses?.length > 0 || dc.reason_for_admit?.length > 0 ||
                  dc.ed_em_level?.length > 0
                );
                const hasProcs = procs?.length > 0;

                if (aiNoSession) {
                  return (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <Upload style={{ width: 24, height: 24, color: "#94a3b8", margin: "0 auto 8px" }} />
                      <p style={{ color: "#94a3b8", fontSize: 12 }}>Upload document to get ICD prediction</p>
                    </div>
                  );
                }

                if (!hasCodes && !hasProcs) {
                  return (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>No predictions available</p>
                      <button style={{
                        padding: "10px 24px", borderRadius: 10, border: "2px solid #1a1d23",
                        background: "#fff", color: "#1a1d23", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>Regenerate</button>
                    </div>
                  );
                }

                const CodeRow = ({ code, desc, bg, textColor }) => (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 8px", background: bg, borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: textColor, flexShrink: 0 }}>{code}</span>
                    {desc && <span style={{ fontSize: 11, color: textColor, opacity: 0.85 }}>{desc}</span>}
                  </div>
                );

                return (
                  <div style={{ padding: "4px 0" }}>
                    {dc?.principal_diagnosis && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 4, textTransform: "uppercase" }}>Principal</p>
                        <CodeRow code={getCode(dc.principal_diagnosis)} desc={getDesc(dc.principal_diagnosis)} bg="#f5f3ff" textColor="#6d28d9" />
                      </div>
                    )}
                    {dc?.primary_diagnosis?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#d97706", marginBottom: 4, textTransform: "uppercase" }}>Primary</p>
                        {dc.primary_diagnosis.map((dx, i) => <CodeRow key={i} code={getCode(dx)} desc={getDesc(dx)} bg="#fffbeb" textColor="#b45309" />)}
                      </div>
                    )}
                    {dc?.secondary_diagnoses?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Secondary</p>
                        {dc.secondary_diagnoses.map((dx, i) => <CodeRow key={i} code={getCode(dx)} desc={getDesc(dx)} bg="#f8fafc" textColor="#475569" />)}
                      </div>
                    )}
                    {dc?.reason_for_admit?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#0891b2", marginBottom: 4, textTransform: "uppercase" }}>Reason for Admit</p>
                        {dc.reason_for_admit.map((dx, i) => <CodeRow key={i} code={getCode(dx)} desc={getDesc(dx)} bg="#ecfeff" textColor="#0e7490" />)}
                      </div>
                    )}
                    {dc?.ed_em_level?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", marginBottom: 4, textTransform: "uppercase" }}>E/M Level</p>
                        {dc.ed_em_level.map((em, i) => <CodeRow key={i} code={getCode(em)} desc={getDesc(em)} bg="#eff6ff" textColor="#1d4ed8" />)}
                      </div>
                    )}
                    {hasProcs && (
                      <div style={{ marginBottom: 4 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#059669", marginBottom: 4, textTransform: "uppercase" }}>Procedures</p>
                        {procs.map((proc, i) => <CodeRow key={i} code={getCode(proc)} desc={getDesc(proc)} bg="#ecfdf5" textColor="#047857" />)}
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* Review and Edit Button */}
              <div style={{ padding: "8px 0 4px", borderTop: "1px solid #f1f5f9", marginTop: 8 }}>
                <button
                  disabled={!timerRunning}
                  onClick={() => { setReviewPopupOpen(true); setSelectedCode(null); }}
                  style={{
                    width: "100%", padding: "10px 16px", borderRadius: 10,
                    border: "none", fontSize: 13, fontWeight: 600, cursor: timerRunning ? "pointer" : "not-allowed",
                    background: timerRunning ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#e2e8f0",
                    color: timerRunning ? "#fff" : "#94a3b8",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                    opacity: timerRunning ? 1 : 0.7,
                  }}
                >
                  <Pencil style={{ width: 14, height: 14 }} />
                  Review and Edit
                </button>
                {!timerRunning && (
                  <p style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", marginTop: 6 }}>
                    Start the timer to review and edit
                  </p>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Document Viewer Popup */}
      {docViewerUrl && (() => {
        // Safe string renderer for AI data
        const str = (val) => {
          if (val == null) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          return JSON.stringify(val);
        };
        const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || (typeof item === 'string' ? item : ''));
        const getDesc = (item) => str(item?.description || item?.finding || '');
        const isAiView = popupSidebarView === "ai-summary";

        return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setDocViewerUrl(null); setDocSidebarOpen(true); setPopupSidebarView("documents"); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[94vw] h-[92vh] max-w-7xl flex overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Sidebar (open) ── */}
            {docSidebarOpen && (
              <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigator</span>
                  <button onClick={() => setDocSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {/* Document items */}
                  {aiData?.documents?.map((doc, idx) => {
                    const isActive = !isAiView && doc.s3Url === docViewerUrl;
                    const isPdf = doc.mimeType === 'application/pdf';
                    const isImage = doc.mimeType?.startsWith('image/');
                    const iconColor = isPdf ? 'text-red-500' : isImage ? 'text-purple-500' : 'text-blue-500';

                    return (
                      <button
                        key={doc.id}
                        onClick={() => { doc.s3Url && setDocViewerUrl(doc.s3Url); setPopupSidebarView("documents"); }}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-amber-100' : 'bg-slate-100'}`}>
                          {isImage
                            ? <FileImage className={`w-4 h-4 ${isActive ? 'text-amber-600' : iconColor}`} />
                            : <FileText className={`w-4 h-4 ${isActive ? 'text-amber-600' : iconColor}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-amber-800' : 'text-slate-700'}`}>{doc.filename}</p>
                          <span className="text-[10px] text-slate-400">
                            {doc.fileSize < 1024 ? doc.fileSize + ' B' : doc.fileSize < 1048576 ? (doc.fileSize / 1024).toFixed(1) + ' KB' : (doc.fileSize / 1048576).toFixed(1) + ' MB'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* AI Summary item */}
                  <button
                    onClick={() => setPopupSidebarView("ai-summary")}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isAiView ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isAiView ? 'bg-purple-100' : 'bg-slate-100'}`}>
                      <Sparkles className={`w-4 h-4 ${isAiView ? 'text-purple-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${isAiView ? 'text-purple-800' : 'text-slate-700'}`}>AI Summary</p>
                      <span className={`text-[10px] ${isAiView ? 'text-purple-500' : 'text-slate-400'}`}>
                        {aiData?.aiStatus === 'ready' ? 'Results available' : aiData?.aiStatus || 'No data'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── Sidebar (collapsed) ── */}
            {!docSidebarOpen && (
              <div className="w-14 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2">
                <button onClick={() => setDocSidebarOpen(true)} className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" title="Expand panel">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="w-8 border-t border-slate-200 my-1" />
                {aiData?.documents?.map((doc, idx) => {
                  const isActive = !isAiView && doc.s3Url === docViewerUrl;
                  const isPdf = doc.mimeType === 'application/pdf';
                  return (
                    <button
                      key={doc.id}
                      onClick={() => { doc.s3Url && setDocViewerUrl(doc.s3Url); setPopupSidebarView("documents"); }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors ${
                        isActive ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                      }`}
                      title={doc.filename}
                    >
                      {isPdf ? 'P' : 'D'}{idx + 1}
                    </button>
                  );
                })}
                <div className="w-8 border-t border-slate-200 my-1" />
                <button
                  onClick={() => setPopupSidebarView("ai-summary")}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isAiView ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                  }`}
                  title="AI Summary"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── Main content area ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAiView ? 'bg-purple-50' : 'bg-red-50'}`}>
                    {isAiView ? <Sparkles className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{isAiView ? 'AI Summary' : 'Document Viewer'}</h3>
                    {!isAiView && <p className="text-xs text-slate-400 truncate max-w-md">{docViewerUrl.split('/').pop()}</p>}
                    {isAiView && <p className="text-xs text-slate-400">AI-generated analysis of uploaded documents</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isAiView && (
                    <a href={docViewerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> New Tab
                    </a>
                  )}
                  <button
                    onClick={() => { setDocViewerUrl(null); setDocSidebarOpen(true); setPopupSidebarView("documents"); }}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {/* Document iframe */}
                {!isAiView && (
                  <iframe src={docViewerUrl} title="Document Viewer" className="w-full h-full border-0" />
                )}

                {/* AI Summary content */}
                {isAiView && (
                  <div className="h-full overflow-y-auto p-8">
                    {aiData?.aiStatus === 'ready' && aiData?.aiSummary ? (
                      <div className="max-w-4xl mx-auto space-y-6">
                        {/* Clinical Summary */}
                        {(aiData.aiSummary.clinical_summary || aiData.aiSummary.narrative) && (
                          <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-purple-500" /></div>
                              Clinical Summary
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {str(aiData.aiSummary.clinical_summary || aiData.aiSummary.narrative)}
                            </p>
                          </div>
                        )}

                        {/* Key Findings */}
                        {aiData.aiSummary.key_findings?.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Key Findings</h4>
                            <ul className="space-y-2">
                              {aiData.aiSummary.key_findings.map((finding, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                  {str(typeof finding === 'string' ? finding : finding?.description || finding?.finding) || str(finding)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Medications */}
                        {aiData.medications?.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Medications</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiData.medications.map((med, i) => (
                                <span key={i} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                                  {str(typeof med === 'string' ? med : med?.name || med?.medication) || str(med)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Coding Notes */}
                        {aiData.codingNotes && Object.keys(aiData.codingNotes).length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Coding Notes</h4>
                            <div className="space-y-4">
                              {/* Coding Tips */}
                              {aiData.codingNotes.coding_tips?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-indigo-600 mb-2">Coding Tips</p>
                                  <div className="space-y-2">
                                    {aiData.codingNotes.coding_tips.map((item, i) => (
                                      <div key={i} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                        <p className="text-sm text-slate-800 font-medium">{str(item.tip)}</p>
                                        {item.related_code && (
                                          <p className="text-xs text-slate-500 mt-1">
                                            <span className="font-medium">Related Code:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-700">{str(item.related_code)}</span>
                                          </p>
                                        )}
                                        {item.potential_impact && (
                                          <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Impact:</span> {str(item.potential_impact)}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Compliance Alerts */}
                              {aiData.codingNotes.compliance_alerts?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-600 mb-2">Compliance Alerts</p>
                                  <div className="space-y-2">
                                    {aiData.codingNotes.compliance_alerts.map((item, i) => (
                                      <div key={i} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                        <div className="flex items-start gap-2">
                                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                            item.severity === 'high' ? 'bg-red-100 text-red-700' :
                                            item.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-600'
                                          }`}>{str(item.severity)}</span>
                                          <p className="text-sm text-slate-800 font-medium">{str(item.alert)}</p>
                                        </div>
                                        {item.regulation && (
                                          <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Regulation:</span> {str(item.regulation)}</p>
                                        )}
                                        {item.recommended_action && (
                                          <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Action:</span> {str(item.recommended_action)}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Documentation Gaps */}
                              {aiData.codingNotes.documentation_gaps?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-rose-600 mb-2">Documentation Gaps</p>
                                  <div className="space-y-2">
                                    {aiData.codingNotes.documentation_gaps.map((item, i) => (
                                      <div key={i} className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                                        <div className="flex items-start gap-2">
                                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                            item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-600'
                                          }`}>{str(item.priority)}</span>
                                          <p className="text-sm text-slate-800 font-medium">{str(item.gap)}</p>
                                        </div>
                                        {item.impact && (
                                          <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Impact:</span> {str(item.impact)}</p>
                                        )}
                                        {item.suggestion && (
                                          <p className="text-xs text-emerald-700 mt-1 bg-emerald-50 px-2 py-1 rounded"><span className="font-medium">Suggestion:</span> {str(item.suggestion)}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Physician Queries Needed */}
                              {aiData.codingNotes.physician_queries_needed?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-violet-600 mb-2">Physician Queries Needed</p>
                                  <div className="space-y-2">
                                    {aiData.codingNotes.physician_queries_needed.map((item, i) => (
                                      <div key={i} className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                                        <div className="flex items-start gap-2">
                                          {item.priority && (
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                              item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                              item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                              'bg-slate-100 text-slate-600'
                                            }`}>{str(item.priority)}</span>
                                          )}
                                          <p className="text-sm text-slate-800 font-medium">{str(item.query)}</p>
                                        </div>
                                        {item.reason && (
                                          <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Reason:</span> {str(item.reason)}</p>
                                        )}
                                        {item.impact_on_coding && (
                                          <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Coding Impact:</span> {str(item.impact_on_coding)}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : aiData?.aiStatus === 'processing' || aiData?.aiStatus === 'queued' ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                        <p className="text-base font-medium text-slate-700">AI is processing...</p>
                        <p className="text-sm text-slate-400 mt-1">Summary will appear here when ready</p>
                      </div>
                    ) : aiData?.aiStatus === 'failed' ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
                        <p className="text-base font-medium text-red-700">Processing Failed</p>
                        <p className="text-sm text-red-500 mt-1">{str(aiData?.lastError) || 'An error occurred'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="w-10 h-10 text-slate-300 mb-4" />
                        <p className="text-base font-medium text-slate-500">No AI Summary</p>
                        <p className="text-sm text-slate-400 mt-1">Upload and process documents to generate AI insights</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── Review & Edit Popup Modal ── */}
      {reviewPopupOpen && (() => {
        const str = (val) => {
          if (val == null) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          return JSON.stringify(val);
        };
        const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || (typeof item === 'string' ? item : ''));
        const getDesc = (item) => str(item?.description || item?.finding || '');

        // Collect all codes into a flat list with category labels
        const allCodes = [];
        // Principal diagnosis (single object)
        if (aiData?.diagnosisCodes?.principal_diagnosis) {
          const dx = aiData.diagnosisCodes.principal_diagnosis;
          allCodes.push({ ...dx, _category: 'Principal', _key: 'principal-0', _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
        }
        if (aiData?.diagnosisCodes?.primary_diagnosis) {
          aiData.diagnosisCodes.primary_diagnosis.forEach((dx, i) => {
            allCodes.push({ ...dx, _category: 'Primary', _key: `primary-${i}`, _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
          });
        }
        if (aiData?.diagnosisCodes?.secondary_diagnoses) {
          aiData.diagnosisCodes.secondary_diagnoses.forEach((dx, i) => {
            allCodes.push({ ...dx, _category: 'Secondary', _key: `secondary-${i}`, _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
          });
        }
        if (aiData?.diagnosisCodes?.reason_for_admit) {
          aiData.diagnosisCodes.reason_for_admit.forEach((dx, i) => {
            allCodes.push({ ...dx, _category: 'Reason for Admit', _key: `admit-${i}`, _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
          });
        }
        if (aiData?.diagnosisCodes?.ed_em_level) {
          aiData.diagnosisCodes.ed_em_level.forEach((em, i) => {
            allCodes.push({ ...em, _category: 'E/M Level', _key: `em-${i}`, _code: getCode(em), _desc: getDesc(em), _type: 'icd' });
          });
        }
        // Procedures (CPT codes)
        if (aiData?.procedures) {
          aiData.procedures.forEach((proc, i) => {
            allCodes.push({ ...proc, _category: 'Procedure', _key: `proc-${i}`, _code: getCode(proc), _desc: str(proc.description || proc.procedure_name || ''), _type: 'cpt' });
          });
        }
        // User-added custom codes
        customCodes.forEach((cc) => {
          allCodes.push(cc);
        });

        const getBadgeStyle = (code) => {
          const decision = codeDecisions[code._key];
          const isSelected = selectedCode?._key === code._key;
          if (code._isCustom) return { bg: '#fdf4ff', border: '#e879f9', color: '#86198f' };
          if (decision?.status === 'accepted') return { bg: '#dcfce7', border: '#86efac', color: '#166534' };
          if (decision?.status === 'rejected') return { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' };
          if (decision?.status === 'edited') return { bg: '#dbeafe', border: '#93c5fd', color: '#1e40af' };
          if (isSelected) return { bg: '#fef3c7', border: '#fbbf24', color: '#92400e' };
          return { bg: '#f8fafc', border: '#e2e8f0', color: '#475569' };
        };

        const getStatusIcon = (code) => {
          const decision = codeDecisions[code._key];
          if (decision?.status === 'accepted') return <Check style={{ width: 10, height: 10 }} />;
          if (decision?.status === 'rejected') return <X style={{ width: 10, height: 10 }} />;
          if (decision?.status === 'edited') return <Pencil style={{ width: 10, height: 10 }} />;
          return null;
        };

        const handleAccept = (code) => {
          setCodeDecisions(prev => ({ ...prev, [code._key]: { status: 'accepted' } }));
          setEditingCode(null);
        };
        const handleReject = (code) => {
          setCodeDecisions(prev => ({ ...prev, [code._key]: { status: 'rejected' } }));
          setEditingCode(null);
        };
        const handleStartEdit = (code) => {
          const decision = codeDecisions[code._key];
          setEditingCode({
            _key: code._key,
            editedCode: decision?.editedCode || code._code,
            editedDesc: decision?.editedDesc || code._desc,
          });
        };
        const handleSaveEdit = () => {
          if (!editingCode) return;
          setCodeDecisions(prev => ({
            ...prev,
            [editingCode._key]: {
              status: 'edited',
              editedCode: editingCode.editedCode,
              editedDesc: editingCode.editedDesc,
            },
          }));
          setEditingCode(null);
        };

        const handleAddCode = () => {
          if (!newCodeForm.code.trim()) return;
          const key = `custom-${Date.now()}`;
          const newCode = {
            _key: key,
            _code: newCodeForm.code.trim(),
            _desc: newCodeForm.description.trim(),
            _category: newCodeForm.category,
            _type: newCodeForm.type,
            _isCustom: true,
          };
          setCustomCodes(prev => [...prev, newCode]);
          setCodeDecisions(prev => ({ ...prev, [key]: { status: 'accepted' } }));
          setNewCodeForm({ code: '', description: '', type: 'icd', category: 'Secondary' });
          setAddingCode(false);
          // Select the newly added code
          setTimeout(() => setSelectedCode(newCode), 0);
        };

        const handleDeleteCustomCode = (key) => {
          setCustomCodes(prev => prev.filter(c => c._key !== key));
          setCodeDecisions(prev => { const next = { ...prev }; delete next[key]; return next; });
          if (selectedCode?._key === key) setSelectedCode(null);
        };

        const isReviewAiView = reviewTab === "ai-summary";

        // Auto-select first code when popup opens
        if (!selectedCode && allCodes.length > 0) {
          // Use setTimeout to avoid setState during render
          setTimeout(() => setSelectedCode(allCodes[0]), 0);
        }

        // Navigate to next/previous code
        const currentIdx = allCodes.findIndex(c => c._key === selectedCode?._key);
        const goToNext = () => {
          if (currentIdx < allCodes.length - 1) {
            setSelectedCode(allCodes[currentIdx + 1]);
            setEditingCode(null);
          }
        };
        const goToPrev = () => {
          if (currentIdx > 0) {
            setSelectedCode(allCodes[currentIdx - 1]);
            setEditingCode(null);
          }
        };

        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => { setReviewPopupOpen(false); setEditingCode(null); }}
          >
            <div
              className="bg-slate-50 rounded-2xl shadow-2xl w-[96vw] h-[94vh] max-w-[1600px] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header Bar ── */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px", background: "#1a1d23", borderRadius: "16px 16px 0 0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    Review & Edit
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px",
                  }}>
                    <Clock style={{ width: 14, height: 14, color: "#fbbf24" }} />
                    <span style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>
                      {formatTime(timerSeconds)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setSubmitPopupOpen(true)}
                    style={{
                      padding: "7px 16px", borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Review & Submit
                  </button>
                  <button
                    onClick={() => { setReviewPopupOpen(false); setEditingCode(null); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: "none",
                      background: "rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* ── Left Panel (60%) ── */}
                <div style={{ width: "60%", display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
                  {/* Tab Switcher */}
                  <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                    {[
                      { key: "document", label: "Document", icon: <FileText style={{ width: 14, height: 14 }} /> },
                      { key: "ai-summary", label: "AI Summary", icon: <Sparkles style={{ width: 14, height: 14 }} /> },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setReviewTab(tab.key)}
                        style={{
                          flex: 1, padding: "10px 16px", border: "none", cursor: "pointer",
                          background: reviewTab === tab.key ? "#fff" : "#f8fafc",
                          borderBottom: reviewTab === tab.key ? "2px solid #f59e0b" : "2px solid transparent",
                          color: reviewTab === tab.key ? "#1a1d23" : "#94a3b8",
                          fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all 0.15s",
                        }}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Document Switcher (only in document tab when multiple docs) */}
                  {!isReviewAiView && aiData?.documents?.length > 1 && (
                    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", background: "#fff", overflowX: "auto" }}>
                      {aiData.documents.map((doc, idx) => (
                        <button
                          key={doc.id}
                          onClick={() => setReviewDocIndex(idx)}
                          style={{
                            padding: "8px 14px", border: "none", cursor: "pointer",
                            background: reviewDocIndex === idx ? "#fffbeb" : "#fff",
                            borderBottom: reviewDocIndex === idx ? "2px solid #d97706" : "2px solid transparent",
                            color: reviewDocIndex === idx ? "#92400e" : "#94a3b8",
                            fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                            display: "flex", alignItems: "center", gap: 5,
                            transition: "all 0.15s",
                          }}
                        >
                          {doc.mimeType === 'application/pdf'
                            ? <FileText style={{ width: 12, height: 12 }} />
                            : doc.mimeType?.startsWith('image/')
                            ? <FileImage style={{ width: 12, height: 12 }} />
                            : <FileIcon style={{ width: 12, height: 12 }} />
                          }
                          {doc.filename || `Document ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Content Area */}
                  <div style={{ flex: 1, overflow: "hidden", background: "#f8fafc" }}>
                    {!isReviewAiView ? (
                      (() => {
                        const currentDoc = aiData?.documents?.[reviewDocIndex];
                        const docUrl = currentDoc?.s3Url;
                        return docUrl ? (
                          <iframe src={docUrl} title="Document Viewer" style={{ width: "100%", height: "100%", border: "none" }} />
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                            <FileText style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ fontSize: 14, fontWeight: 500 }}>No document available</p>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
                        {aiData?.aiStatus === 'ready' && aiData?.aiSummary ? (
                          <div style={{ maxWidth: 700, margin: "0 auto" }}>
                            {/* Chief Complaint */}
                            {aiData.aiSummary.chief_complaint?.text && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <Sparkles style={{ width: 14, height: 14, color: "#a855f7" }} /> Chief Complaint
                                </h4>
                                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                                  {str(aiData.aiSummary.chief_complaint.text)}
                                </p>
                              </div>
                            )}

                            {/* History of Present Illness */}
                            {aiData.aiSummary.history_of_present_illness?.text && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>History of Present Illness</h4>
                                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                  {str(aiData.aiSummary.history_of_present_illness.text)}
                                </p>
                              </div>
                            )}

                            {/* Assessment & Plan */}
                            {aiData.aiSummary.assessment_and_plan && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Assessment & Plan</h4>
                                {aiData.aiSummary.assessment_and_plan.assessment && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>
                                    {str(aiData.aiSummary.assessment_and_plan.assessment)}
                                  </p>
                                )}
                                {aiData.aiSummary.assessment_and_plan.plan && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600 }}>Plan: </span>{str(aiData.aiSummary.assessment_and_plan.plan)}
                                  </p>
                                )}
                                {aiData.aiSummary.assessment_and_plan.diagnoses?.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Diagnoses: </span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                      {aiData.aiSummary.assessment_and_plan.diagnoses.map((d, i) => (
                                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#f5f3ff", border: "1px solid #e9d5ff", color: "#6d28d9" }}>
                                          {str(d)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {aiData.aiSummary.assessment_and_plan.follow_up && (
                                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                                    <span style={{ fontWeight: 600 }}>Follow-up: </span>{str(aiData.aiSummary.assessment_and_plan.follow_up)}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Past Medical History */}
                            {aiData.aiSummary.past_medical_history && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Past Medical History</h4>
                                {aiData.aiSummary.past_medical_history.conditions?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Conditions: </span>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{aiData.aiSummary.past_medical_history.conditions.map(str).join(', ')}</span>
                                  </div>
                                )}
                                {aiData.aiSummary.past_medical_history.surgeries?.length > 0 && (
                                  <div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Surgeries: </span>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{aiData.aiSummary.past_medical_history.surgeries.map(str).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Clinical Alerts */}
                            {aiData.aiSummary.clinical_alerts?.length > 0 && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #fef3c7", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <AlertCircle style={{ width: 14, height: 14, color: "#d97706" }} /> Clinical Alerts
                                </h4>
                                {aiData.aiSummary.clinical_alerts.map((alert, i) => (
                                  <div key={i} style={{ padding: "8px 10px", background: "#fffbeb", borderRadius: 8, marginBottom: 6, border: "1px solid #fef3c7" }}>
                                    <p style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>{str(alert.alert)}</p>
                                    {alert.action_required && (
                                      <p style={{ fontSize: 11, color: "#b45309", marginTop: 4 }}>Action: {str(alert.action_required)}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Medications */}
                            {aiData.aiSummary.medications?.current?.length > 0 && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Medications</h4>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {aiData.aiSummary.medications.current.map((med, i) => (
                                    <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#4338ca" }}>
                                      {str(med)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Patient Demographics */}
                            {aiData.aiSummary.patient_demographics && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Patient Demographics</h4>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#475569" }}>
                                  {aiData.aiSummary.patient_demographics.age && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Age:</span> {str(aiData.aiSummary.patient_demographics.age)}</span>}
                                  {aiData.aiSummary.patient_demographics.sex && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Sex:</span> {str(aiData.aiSummary.patient_demographics.sex)}</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                            <Sparkles style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ fontSize: 14, fontWeight: 500 }}>No AI summary available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Right Panel (40%) ── */}
                <div style={{ width: "40%", display: "flex", flexDirection: "column", background: "#fff" }}>
                  {/* Header */}
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>ICD & CPT Codes</h3>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>
                        {allCodes.length} codes &middot; {Object.keys(codeDecisions).length} reviewed
                      </p>
                    </div>
                    <button
                      onClick={() => setAddingCode(true)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "none",
                        background: "#f5f3ff", color: "#7c3aed",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5,
                        transition: "all 0.15s",
                      }}
                    >
                      <Plus style={{ width: 14, height: 14 }} /> Add Code
                    </button>
                  </div>

                  {/* Code Badges Grid */}
                  <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
                    {/* Add Code Form */}
                    {addingCode && (
                      <div style={{ background: "#fdf4ff", borderRadius: 14, border: "1.5px solid #e879f9", padding: 18, marginBottom: 16, boxShadow: "0 4px 20px rgba(168, 85, 247, 0.08)" }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#86198f", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 7, background: "#f0abfc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus style={{ width: 13, height: 13, color: "#fff" }} />
                          </div>
                          Add New Code
                        </h4>
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Code Type</label>
                            <StyledDropdown
                              value={newCodeForm.type}
                              onChange={(val) => setNewCodeForm(prev => ({ ...prev, type: val }))}
                              options={[
                                { value: 'icd', label: 'ICD-10', dot: '#3b82f6' },
                                { value: 'cpt', label: 'CPT', dot: '#10b981' },
                              ]}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
                            <StyledDropdown
                              value={newCodeForm.category}
                              onChange={(val) => setNewCodeForm(prev => ({ ...prev, category: val }))}
                              options={[
                                { value: 'Principal', label: 'Principal', dot: '#7c3aed' },
                                { value: 'Primary', label: 'Primary', dot: '#d97706' },
                                { value: 'Secondary', label: 'Secondary', dot: '#64748b' },
                                { value: 'Reason for Admit', label: 'Reason for Admit', dot: '#0891b2' },
                                { value: 'E/M Level', label: 'E/M Level', dot: '#2563eb' },
                                { value: 'Procedure', label: 'Procedure', dot: '#059669' },
                              ]}
                            />
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Code <span style={{ color: "#e879f9" }}>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={newCodeForm.type === 'icd' ? "e.g. K63.5, Z12.11" : "e.g. 45385, 99213"}
                            value={newCodeForm.code}
                            onChange={(e) => setNewCodeForm(prev => ({ ...prev, code: e.target.value }))}
                            style={{
                              width: "100%", padding: "9px 12px", borderRadius: 10,
                              border: "1.5px solid #e9d5ff", background: "#fff",
                              fontSize: 13, fontWeight: 600, color: "#1e293b",
                              outline: "none", boxSizing: "border-box",
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#c084fc'}
                            onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                          />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</label>
                          <input
                            type="text"
                            placeholder="Enter code description..."
                            value={newCodeForm.description}
                            onChange={(e) => setNewCodeForm(prev => ({ ...prev, description: e.target.value }))}
                            style={{
                              width: "100%", padding: "9px 12px", borderRadius: 10,
                              border: "1.5px solid #e9d5ff", background: "#fff",
                              fontSize: 13, color: "#475569",
                              outline: "none", boxSizing: "border-box",
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#c084fc'}
                            onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                          />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={handleAddCode}
                            disabled={!newCodeForm.code.trim()}
                            style={{
                              flex: 1, padding: "9px 14px", borderRadius: 10, border: "none",
                              background: newCodeForm.code.trim() ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "#e9d5ff",
                              color: "#fff", fontSize: 12, fontWeight: 700,
                              cursor: newCodeForm.code.trim() ? "pointer" : "not-allowed",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              boxShadow: newCodeForm.code.trim() ? "0 2px 8px rgba(168, 85, 247, 0.3)" : "none",
                            }}
                          >
                            <Plus style={{ width: 14, height: 14 }} /> Add Code
                          </button>
                          <button
                            onClick={() => { setAddingCode(false); setNewCodeForm({ code: '', description: '', type: 'icd', category: 'Secondary' }); }}
                            style={{
                              padding: "9px 16px", borderRadius: 10,
                              border: "1.5px solid #e9d5ff", background: "#fff", color: "#86198f",
                              fontSize: 12, fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {allCodes.length === 0 && !addingCode ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                        <p style={{ fontSize: 13 }}>No ICD codes available</p>
                      </div>
                    ) : allCodes.length > 0 ? (
                      <>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                          {allCodes.map((code) => {
                            const style = getBadgeStyle(code);
                            const decision = codeDecisions[code._key];
                            const displayCode = decision?.editedCode || code._code;
                            return (
                              <button
                                key={code._key}
                                onClick={() => { setSelectedCode(code); setEditingCode(null); }}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  padding: "6px 12px", borderRadius: 8,
                                  border: code._isCustom ? `2px dashed #d946ef` : `1.5px solid ${style.border}`,
                                  background: style.bg, color: style.color,
                                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  transition: "all 0.15s",
                                  outline: selectedCode?._key === code._key ? `2px solid #f59e0b` : "none",
                                  outlineOffset: 1,
                                  boxShadow: code._isCustom ? "0 0 0 1px rgba(217, 70, 239, 0.15)" : "none",
                                }}
                              >
                                {code._isCustom && <Plus style={{ width: 10, height: 10 }} />}
                                {getStatusIcon(code)}
                                {displayCode}
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                          {[
                            { label: "Accepted", bg: "#dcfce7", border: "#86efac" },
                            { label: "Rejected", bg: "#fef2f2", border: "#fca5a5" },
                            { label: "Edited", bg: "#dbeafe", border: "#93c5fd" },
                            { label: "Added", bg: "#fdf4ff", border: "#e879f9" },
                            { label: "Pending", bg: "#f8fafc", border: "#e2e8f0" },
                          ].map(item => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#94a3b8" }}>
                              <span style={{ width: 10, height: 10, borderRadius: 3, background: item.bg, border: `1px solid ${item.border}` }} />
                              {item.label}
                            </div>
                          ))}
                        </div>

                        {/* Selected Code Detail */}
                        {selectedCode && (
                          <div style={{
                            background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0",
                            padding: 16, marginTop: 4,
                          }}>
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  fontSize: 10, fontWeight: 700, color: selectedCode._isCustom ? "#86198f" : "#f59e0b",
                                  textTransform: "uppercase", letterSpacing: 0.5,
                                }}>
                                  {selectedCode._category}
                                  {selectedCode._isCustom && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "#fdf4ff", border: "1px solid #e879f9" }}>Added</span>}
                                </span>
                                {selectedCode._isCustom && (
                                  <button
                                    onClick={() => handleDeleteCustomCode(selectedCode._key)}
                                    style={{
                                      padding: "3px 8px", borderRadius: 6, border: "none",
                                      background: "#fef2f2", color: "#dc2626",
                                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", gap: 4,
                                    }}
                                  >
                                    <Trash2 style={{ width: 10, height: 10 }} /> Remove
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                                {codeDecisions[selectedCode._key]?.editedCode || selectedCode._code}
                              </div>
                              <div style={{ fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>
                                {codeDecisions[selectedCode._key]?.editedDesc || selectedCode._desc || 'No description'}
                              </div>
                              {/* Procedure name (for CPT codes) */}
                              {selectedCode.procedure_name && (
                                <div style={{ fontSize: 12, color: "#0d9488", marginTop: 4 }}>
                                  {str(selectedCode.procedure_name)}
                                </div>
                              )}
                              {/* Procedure findings */}
                              {selectedCode.findings?.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                                  {selectedCode.findings.map((f, i) => (
                                    <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#f0fdfa", border: "1px solid #99f6e4", color: "#0f766e" }}>
                                      {str(f)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {/* Evidence */}
                              {selectedCode.evidence && (
                                <div style={{ marginTop: 8 }}>
                                  {(Array.isArray(selectedCode.evidence) ? selectedCode.evidence : [selectedCode.evidence]).map((ev, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "#64748b", padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 6 }}>
                                      <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: 10, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                        Evidence {Array.isArray(selectedCode.evidence) && selectedCode.evidence.length > 1 ? `#${i + 1}` : ''}
                                        {ev.document_name ? ` — ${ev.document_name}` : ''}
                                      </span>
                                      <span style={{ fontStyle: "italic", lineHeight: 1.5 }}>"{str(ev.exact_text || ev)}"</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* AI Reasoning */}
                              {selectedCode.ai_reasoning && (
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, padding: "8px 10px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fef3c7" }}>
                                  <span style={{ fontWeight: 600, color: "#b45309", fontSize: 10, textTransform: "uppercase", display: "block", marginBottom: 4 }}>AI Reasoning</span>
                                  {str(selectedCode.ai_reasoning)}
                                </div>
                              )}
                              {/* Confidence */}
                              {selectedCode.confidence && (
                                <div style={{ marginTop: 8 }}>
                                  <span style={{
                                    display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                                    background: selectedCode.confidence === 'high' ? '#dcfce7' : selectedCode.confidence === 'medium' ? '#fef3c7' : '#fef2f2',
                                    color: selectedCode.confidence === 'high' ? '#166534' : selectedCode.confidence === 'medium' ? '#92400e' : '#991b1b',
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                  }}>
                                    {selectedCode.confidence} confidence
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {selectedCode._isCustom ? (
                              <div style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                                background: "#fdf4ff", borderRadius: 8, border: "1.5px dashed #d946ef",
                              }}>
                                <Plus style={{ width: 14, height: 14, color: "#a21caf" }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#86198f" }}>Manually added code</span>
                              </div>
                            ) : editingCode?._key !== selectedCode._key ? (
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  onClick={() => handleAccept(selectedCode)}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: codeDecisions[selectedCode._key]?.status === 'accepted' ? "#16a34a" : "#dcfce7",
                                    color: codeDecisions[selectedCode._key]?.status === 'accepted' ? "#fff" : "#166534",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <Check style={{ width: 14, height: 14 }} /> Accept
                                </button>
                                <button
                                  onClick={() => handleReject(selectedCode)}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: codeDecisions[selectedCode._key]?.status === 'rejected' ? "#dc2626" : "#fef2f2",
                                    color: codeDecisions[selectedCode._key]?.status === 'rejected' ? "#fff" : "#991b1b",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <X style={{ width: 14, height: 14 }} /> Reject
                                </button>
                                <button
                                  onClick={() => handleStartEdit(selectedCode)}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: codeDecisions[selectedCode._key]?.status === 'edited' ? "#2563eb" : "#dbeafe",
                                    color: codeDecisions[selectedCode._key]?.status === 'edited' ? "#fff" : "#1e40af",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <Pencil style={{ width: 14, height: 14 }} /> Edit
                                </button>
                              </div>
                            ) : (
                              /* Inline Edit Form */
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Code</label>
                                  <input
                                    type="text"
                                    value={editingCode.editedCode}
                                    onChange={(e) => setEditingCode(prev => ({ ...prev, editedCode: e.target.value }))}
                                    style={{
                                      width: "100%", padding: "8px 10px", borderRadius: 8,
                                      border: "1.5px solid #93c5fd", background: "#fff",
                                      fontSize: 13, fontWeight: 600, color: "#1e293b",
                                      outline: "none", boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Description</label>
                                  <textarea
                                    value={editingCode.editedDesc}
                                    onChange={(e) => setEditingCode(prev => ({ ...prev, editedDesc: e.target.value }))}
                                    rows={2}
                                    style={{
                                      width: "100%", padding: "8px 10px", borderRadius: 8,
                                      border: "1.5px solid #93c5fd", background: "#fff",
                                      fontSize: 13, color: "#475569", resize: "vertical",
                                      outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                                    }}
                                  />
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={handleSaveEdit}
                                    style={{
                                      flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                      background: "#2563eb", color: "#fff",
                                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}
                                  >
                                    <Save style={{ width: 14, height: 14 }} /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCode(null)}
                                    style={{
                                      flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                                      background: "#fff", color: "#64748b",
                                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Prev / Next Navigation */}
                            <div style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              marginTop: 14, paddingTop: 12, borderTop: "1px solid #e2e8f0",
                            }}>
                              <button
                                onClick={goToPrev}
                                disabled={currentIdx <= 0}
                                style={{
                                  padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                                  background: currentIdx <= 0 ? "#f8fafc" : "#fff",
                                  color: currentIdx <= 0 ? "#cbd5e1" : "#475569",
                                  fontSize: 12, fontWeight: 600, cursor: currentIdx <= 0 ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", gap: 5,
                                }}
                              >
                                <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
                              </button>
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                {currentIdx + 1} / {allCodes.length}
                              </span>
                              <button
                                onClick={goToNext}
                                disabled={currentIdx >= allCodes.length - 1}
                                style={{
                                  padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                                  background: currentIdx >= allCodes.length - 1 ? "#f8fafc" : "#fff",
                                  color: currentIdx >= allCodes.length - 1 ? "#cbd5e1" : "#475569",
                                  fontSize: 12, fontWeight: 600, cursor: currentIdx >= allCodes.length - 1 ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", gap: 5,
                                }}
                              >
                                Next <ChevronRight style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Review & Submit Popup ── */}
      {submitPopupOpen && (() => {
        const str = (val) => { if (val == null) return ''; if (typeof val === 'string') return val; return String(val); };
        const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || item?._code || '');
        const getDesc = (item) => str(item?.description || item?.finding || item?._desc || '');

        // Build final codes list (accepted + edited + custom, exclude rejected)
        const finalCodes = [];
        const dc = aiData?.diagnosisCodes;

        const addIfNotRejected = (item, category, key, type) => {
          const decision = codeDecisions[key];
          if (decision?.status === 'rejected') return;
          finalCodes.push({
            code: decision?.editedCode || getCode(item),
            description: decision?.editedDesc || getDesc(item),
            category,
            type,
            status: decision?.status || 'pending',
            isCustom: false,
          });
        };

        if (dc?.principal_diagnosis) addIfNotRejected(dc.principal_diagnosis, 'Principal', 'principal-0', 'icd');
        dc?.primary_diagnosis?.forEach((dx, i) => addIfNotRejected(dx, 'Primary', `primary-${i}`, 'icd'));
        dc?.secondary_diagnoses?.forEach((dx, i) => addIfNotRejected(dx, 'Secondary', `secondary-${i}`, 'icd'));
        dc?.reason_for_admit?.forEach((dx, i) => addIfNotRejected(dx, 'Reason for Admit', `admit-${i}`, 'icd'));
        dc?.ed_em_level?.forEach((em, i) => addIfNotRejected(em, 'E/M Level', `em-${i}`, 'icd'));
        aiData?.procedures?.forEach((proc, i) => addIfNotRejected(proc, 'Procedure', `proc-${i}`, 'cpt'));

        // Custom codes
        customCodes.forEach((cc) => {
          finalCodes.push({
            code: cc._code,
            description: cc._desc,
            category: cc._category,
            type: cc._type,
            status: 'added',
            isCustom: true,
          });
        });

        const statusLabel = (s) => {
          if (s === 'accepted') return { text: 'Accepted', bg: '#dcfce7', color: '#166534' };
          if (s === 'edited') return { text: 'Edited', bg: '#dbeafe', color: '#1e40af' };
          if (s === 'added') return { text: 'Added', bg: '#fdf4ff', color: '#86198f' };
          return { text: 'Pending', bg: '#f8fafc', color: '#94a3b8' };
        };

        return (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSubmitPopupOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: "16px 24px", background: "#1a1d23", borderRadius: "16px 16px 0 0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Review & Submit</h3>
                  <p style={{ color: "#94a3b8", fontSize: 11, margin: "4px 0 0" }}>
                    {finalCodes.length} codes will be submitted
                  </p>
                </div>
                <button
                  onClick={() => setSubmitPopupOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: "rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Code List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                {finalCodes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    <p style={{ fontSize: 13 }}>No codes to submit</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {finalCodes.map((fc, i) => {
                      const sl = statusLabel(fc.status);
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 14px", borderRadius: 10,
                          background: fc.isCustom ? "#fdf4ff" : "#f8fafc",
                          border: fc.isCustom ? "1.5px dashed #d946ef" : "1px solid #e2e8f0",
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{fc.code}</span>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                                background: fc.type === 'cpt' ? '#ecfdf5' : '#eff6ff',
                                color: fc.type === 'cpt' ? '#047857' : '#1d4ed8',
                                textTransform: "uppercase",
                              }}>
                                {fc.type === 'cpt' ? 'CPT' : 'ICD-10'}
                              </span>
                              <span style={{
                                fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                                background: sl.bg, color: sl.color, textTransform: "uppercase",
                              }}>
                                {sl.text}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                              {fc.description || 'No description'}
                            </p>
                            <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, display: "inline-block" }}>
                              {fc.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: "16px 24px", borderTop: "1px solid #e2e8f0",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <button
                  onClick={() => setSubmitPopupOpen(false)}
                  style={{
                    padding: "9px 20px", borderRadius: 8,
                    border: "1px solid #e2e8f0", background: "#fff", color: "#64748b",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Back to Review
                </button>
                <button
                  onClick={() => {
                    // Future: call backend API with finalCodes
                    alert('Codes submitted successfully!');
                    setSubmitPopupOpen(false);
                    setReviewPopupOpen(false);
                  }}
                  disabled={finalCodes.length === 0}
                  style={{
                    padding: "9px 24px", borderRadius: 8, border: "none",
                    background: finalCodes.length > 0 ? "linear-gradient(135deg, #10b981, #059669)" : "#e2e8f0",
                    color: finalCodes.length > 0 ? "#fff" : "#94a3b8",
                    fontSize: 13, fontWeight: 700, cursor: finalCodes.length > 0 ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <CheckCircle2 style={{ width: 15, height: 15 }} /> Final Submit
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
