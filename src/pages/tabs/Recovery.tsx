import React, { useState } from "react";
import "./Recovery.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Recovery v10.0
 * Athlete — manual input
 * Coach / Specialist — analytics dashboard (Recharts + modal date picker)
 */

type Role = "athlete" | "coach" | "specialist";

function getRole(): Role {
  const stored = localStorage.getItem("currentUser");
  if (!stored) return "athlete";
  const parsed = JSON.parse(stored);
  const r = (parsed.role || "").toLowerCase();
  if (r === "coach") return "coach";
  if (r === "specialist") return "specialist";
  return "athlete";
}

type FormState = {
  date: string;
  sleep: string;
  recovery: string;
  deep: string;
  rem: string;
  light: string;
  hr: string;
  hrv: string;
};

/* ------------------------- SAMPLE DATA (demo) ------------------------- */

const recoveryTrend = [
  { label: "D1", rec1: 82, rec2: 78 },
  { label: "D2", rec1: 88, rec2: 80 },
  { label: "D3", rec1: 79, rec2: 81 },
  { label: "D4", rec1: 90, rec2: 85 },
  { label: "D5", rec1: 86, rec2: 83 },
];

const sleepTrend = [
  { label: "D1", s1: 7.2, s2: 6.8 },
  { label: "D2", s1: 7.8, s2: 7.1 },
  { label: "D3", s1: 6.9, s2: 7.4 },
  { label: "D4", s1: 8.1, s2: 7.6 },
  { label: "D5", s1: 7.4, s2: 7.0 },
];

const hrTrend = [
  { label: "D1", hr1: 54, hr2: 58 },
  { label: "D2", hr1: 51, hr2: 56 },
  { label: "D3", hr1: 53, hr2: 57 },
  { label: "D4", hr1: 50, hr2: 55 },
  { label: "D5", hr1: 52, hr2: 56 },
];

const hrvTrend = [
  { label: "D1", hrv1: 70, hrv2: 66 },
  { label: "D2", hrv1: 74, hrv2: 69 },
  { label: "D3", hrv1: 72, hrv2: 68 },
  { label: "D4", hrv1: 76, hrv2: 70 },
  { label: "D5", hrv1: 73, hrv2: 69 },
];

/* ===================================================
   ATHLETE VIEW
=================================================== */

function AthleteView() {
  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().split("T")[0],
    sleep: "",
    recovery: "",
    deep: "",
    rem: "",
    light: "",
    hr: "",
    hrv: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = () => {
    localStorage.setItem("recovery.athlete", JSON.stringify(form));
    alert("Saved ✅");
  };

  const clear = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      sleep: "",
      recovery: "",
      deep: "",
      rem: "",
      light: "",
      hr: "",
      hrv: "",
    });
  };

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns:
      "repeat(8, minmax(60px, 1fr)) 70px 70px",
    gap: 8,
    alignItems: "end",
  };

  return (
    <div className="recovery-container">
      <h2 className="tab-title">Recovery — Athlete</h2>

      <div className="card">
        <div style={rowStyle}>
          {/* Date */}
          <div>
            <label className="lbl">Date</label>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
            />
          </div>

          {/* Sleep */}
          <div>
            <label className="lbl">Sleep (h)</label>
            <input
              className="input"
              name="sleep"
              type="number"
              step="0.1"
              value={form.sleep}
              onChange={onChange}
            />
          </div>

          {/* Recovery */}
          <div>
            <label className="lbl">Recovery (%)</label>
            <input
              className="input"
              name="recovery"
              type="number"
              step="1"
              value={form.recovery}
              onChange={onChange}
            />
          </div>

          {/* Deep */}
          <div>
            <label className="lbl">Deep (h)</label>
            <input
              className="input"
              name="deep"
              type="number"
              step="0.1"
              value={form.deep}
              onChange={onChange}
            />
          </div>

          {/* REM */}
          <div>
            <label className="lbl">REM (h)</label>
            <input
              className="input"
              name="rem"
              type="number"
              step="0.1"
              value={form.rem}
              onChange={onChange}
            />
          </div>

          {/* Light */}
          <div>
            <label className="lbl">Light (h)</label>
            <input
              className="input"
              name="light"
              type="number"
              step="0.1"
              value={form.light}
              onChange={onChange}
            />
          </div>

          {/* HR */}
          <div>
            <label className="lbl">HR (bpm)</label>
            <input
              className="input"
              name="hr"
              type="number"
              step="1"
              value={form.hr}
              onChange={onChange}
            />
          </div>

          {/* HRV */}
          <div>
            <label className="lbl">HRV (ms)</label>
            <input
              className="input"
              name="hrv"
              type="number"
              step="1"
              value={form.hrv}
              onChange={onChange}
            />
          </div>
           <button className="btn primary recovery-btn-small" onClick={save}>Save</button>
           <button className="btn recovery-btn-small" onClick={clear}>Clear</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   MODES & TYPES
=================================================== */

type Mode = "single" | "period" | "compare";

type ChartsSelection = {
  recovery: boolean;
  sleep: boolean;
  hr: boolean;
  hrv: boolean;
};

type ChartBlockProps = {
  mode: Mode;
  date1: string;
  date2: string;
  charts: ChartsSelection;
};

/* ===================================================
   RECHARTS BOARD
=================================================== */

function ChartsBoard({ mode, date1, date2, charts }: ChartBlockProps) {
  const isCompare = mode === "compare";

  const subtitle =
    mode === "single"
      ? `Single day • ${date1}`
      : mode === "period"
      ? `Period • ${date1} → ${date2}`
      : `Compare • ${date1} vs ${date2}`;

  const showSomething =
    charts.recovery || charts.sleep || charts.hr || charts.hrv;

  return (
    <div className="charts-board">
      <div className="charts-header-row">
        <div className="charts-subtitle">{subtitle}</div>
        <div className="charts-note">
          Demo data — Google Sheets sync coming next
        </div>
      </div>

      {!showSomething && (
        <div className="charts-empty">
          Select at least one metric in GRAPHICS panel.
        </div>
      )}

      <div className="charts-grid-new">
        {charts.recovery && (
          <div className="chart-block">
            <div className="chart-title">Recovery Score (%)</div>
            <ResponsiveContainer width="100%" height={220}>
              {mode === "single" ? (
                <BarChart
                  data={[
                    {
                      metric: "Recovery",
                      value: 86,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={6} />
                </BarChart>
              ) : (
                <LineChart data={recoveryTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" />
                  <YAxis domain={[70, 95]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rec1"
                    name={isCompare ? date1 || "Series 1" : "Recovery"}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  {(isCompare || mode === "period") && (
                    <Line
                      type="monotone"
                      dataKey="rec2"
                      name={isCompare ? date2 || "Series 2" : "Baseline"}
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {charts.sleep && (
          <div className="chart-block">
            <div className="chart-title">Sleep Duration (h)</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sleepTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis domain={[6, 9]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="s1"
                  name={isCompare ? date1 || "Sleep 1" : "Sleep"}
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                {(isCompare || mode === "period") && (
                  <Line
                    type="monotone"
                    dataKey="s2"
                    name={isCompare ? date2 || "Sleep 2" : "Baseline"}
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {charts.hr && (
          <div className="chart-block">
            <div className="chart-title">Avg HR (bpm)</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hrTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis domain={[48, 60]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hr1"
                  name={isCompare ? date1 || "HR 1" : "HR"}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                {(isCompare || mode === "period") && (
                  <Line
                    type="monotone"
                    dataKey="hr2"
                    name={isCompare ? date2 || "HR 2" : "Baseline"}
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {charts.hrv && (
          <div className="chart-block">
            <div className="chart-title">Avg HRV (ms)</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hrvTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis domain={[60, 80]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hrv1"
                  name={isCompare ? date1 || "HRV 1" : "HRV"}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
                {(isCompare || mode === "period") && (
                  <Line
                    type="monotone"
                    dataKey="hrv2"
                    name={isCompare ? date2 || "HRV 2" : "Baseline"}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================================================
   GRAPHICS MODAL
=================================================== */

type ChartsModalProps = {
  open: boolean;
  onClose: () => void;
  charts: ChartsSelection;
  setCharts: (c: ChartsSelection) => void;
};

function ChartsModal({ open, onClose, charts, setCharts }: ChartsModalProps) {
  if (!open) return null;

  const toggle = (key: keyof ChartsSelection) => {
    setCharts({ ...charts, [key]: !charts[key] });
  };

  return (
    <div className="charts-modal-overlay" onClick={onClose}>
      <div className="charts-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="charts-modal-title">GRAPHICS</h3>
        <p className="charts-modal-sub">
          Select metrics to display on the main analytics board.
        </p>

        <div className="charts-modal-list">
          <label className="charts-check">
            <input
              type="checkbox"
              checked={charts.recovery}
              onChange={() => toggle("recovery")}
            />
            <span>Recovery score</span>
          </label>

          <label className="charts-check">
            <input
              type="checkbox"
              checked={charts.sleep}
              onChange={() => toggle("sleep")}
            />
            <span>Sleep duration</span>
          </label>

          <label className="charts-check">
            <input
              type="checkbox"
              checked={charts.hr}
              onChange={() => toggle("hr")}
            />
            <span>Avg HR</span>
          </label>

          <label className="charts-check">
            <input
              type="checkbox"
              checked={charts.hrv}
              onChange={() => toggle("hrv")}
            />
            <span>Avg HRV</span>
          </label>
        </div>

        <button className="charts-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* ===================================================
   CALENDAR MODAL (iOS style, center)
=================================================== */

type CalendarModalProps = {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  date1: string;
  date2: string;
  setDate1: (v: string) => void;
  setDate2: (v: string) => void;
};

function CalendarModal({
  open,
  onClose,
  mode,
  date1,
  date2,
  setDate1,
  setDate2,
}: CalendarModalProps) {
  if (!open) return null;

  const title =
    mode === "single"
      ? "Select date"
      : mode === "period"
      ? "Select period"
      : "Compare two dates";

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="calendar-modal-title">{title}</h3>

        {mode === "single" && (
          <div className="calendar-field">
            <label>Day</label>
            <input
              type="date"
              className="input"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
            />
          </div>
        )}

        {mode === "period" && (
          <div className="calendar-fields-row">
            <div className="calendar-field">
              <label>From</label>
              <input
                type="date"
                className="input"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
              />
            </div>
            <div className="calendar-field">
              <label>To</label>
              <input
                type="date"
                className="input"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
              />
            </div>
          </div>
        )}

        {mode === "compare" && (
          <div className="calendar-fields-row">
            <div className="calendar-field">
              <label>Date A</label>
              <input
                type="date"
                className="input"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
              />
            </div>
            <div className="calendar-field">
              <label>Date B</label>
              <input
                type="date"
                className="input"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          className="calendar-modal-apply"
          type="button"
          onClick={onClose}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

/* ===================================================
   COACH / SPECIALIST ANALYTICS
=================================================== */

function AnalyticsView() {
  const today = new Date().toISOString().split("T")[0];

  const [mode, setMode] = useState<Mode>("single");
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(today);

  const [charts, setCharts] = useState<ChartsSelection>({
    recovery: true,
    sleep: false,
    hr: false,
    hrv: false,
  });

  const [graphicsOpen, setGraphicsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setCalendarOpen(true);
  };

  return (
    <div className="recovery-container">
      <h2 className="tab-title analytics-title">Recovery Analytics</h2>

      {/* TOP CONTROLS */}
      <div className="card analytics-top-card">
        <div className="mode-and-dates">
          <div className="mode-switch">
            <button
              className={`mode-btn ${mode === "single" ? "active" : ""}`}
              onClick={() => switchMode("single")}
            >
              Single day
            </button>
            <button
              className={`mode-btn ${mode === "period" ? "active" : ""}`}
              onClick={() => switchMode("period")}
            >
              Period
            </button>
            <button
              className={`mode-btn ${mode === "compare" ? "active" : ""}`}
              onClick={() => switchMode("compare")}
            >
              Compare
            </button>
          </div>
        </div>

        <button
          type="button"
          className="graphics-btn"
          onClick={() => setGraphicsOpen(true)}
        >
          GRAPHICS
        </button>
      </div>

      {/* CHARTS AREA */}
      <div className="card analytics-charts-card">
        <ChartsBoard mode={mode} date1={date1} date2={date2} charts={charts} />
      </div>

      {/* MODALS */}
      <ChartsModal
        open={graphicsOpen}
        onClose={() => setGraphicsOpen(false)}
        charts={charts}
        setCharts={setCharts}
      />

      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        mode={mode}
        date1={date1}
        date2={date2}
        setDate1={setDate1}
        setDate2={setDate2}
      />
    </div>
  );
}

/* ===================================================
   ROOT
=================================================== */

export default function Recovery() {
  const role = getRole();
  if (role === "coach" || role === "specialist") return <AnalyticsView />;
  return <AthleteView />;
}
