import React, { useState, useRef, useEffect } from "react";
import "./Wearables.css";

type Role = "coach" | "athlete" | "specialist";

type Player = {
  id: string;
  name: string;
  nickname?: string;
  sensorId?: string;
  connected?: boolean;
  currentHR?: number;
  avgHR?: number;
  maxHR?: number;
  zonesBoundaries: {
    z1: [number, number];
    z2: [number, number];
    z3: [number, number];
    z4: [number, number];
  };
  timeInZones: { z1: number; z2: number; z3: number; z4: number };
};

type ViewMode = "list" | "team" | "comparison";

function getRole(): Role {
  const stored = (localStorage.getItem("role") || "coach").toLowerCase();
  if (stored === "coach" || stored === "athlete" || stored === "specialist")
    return stored as Role;
  return "coach";
}

function parseHeartRate(v: DataView) {
  const flags = v.getUint8(0);
  return flags & 1 ? v.getUint16(1, true) : v.getUint8(1);
}

/* ------------------------------ ATHLETE ------------------------------ */
function AthleteView() {
  const [status, setStatus] = useState<Record<string, string>>({});
  const [hr, setHr] = useState<Record<string, number>>({});
  const supported = typeof navigator !== "undefined" && !!(navigator as any).bluetooth;

  async function connectDevice(vendor: string) {
    try {
      if (!supported) return alert("Ваш браузер не поддерживает Web Bluetooth");
      setStatus((s) => ({ ...s, [vendor]: "Подключение..." }));
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const ch = await service.getCharacteristic("heart_rate_measurement");
      await ch.startNotifications();
      ch.addEventListener("characteristicvaluechanged", (e: any) => {
        const bpm = parseHeartRate(e.target.value as DataView);
        setHr((h) => ({ ...h, [vendor]: bpm }));
      });
      setStatus((s) => ({
        ...s,
        [vendor]: `Подключено: ${device.name || "HR Sensor"}`,
      }));
    } catch (e: any) {
      setStatus((s) => ({ ...s, [vendor]: `Ошибка: ${e.message}` }));
    }
  }

  return (
    <div className="wearables-container">
      <h2 className="tab-title">Wearables — Athlete</h2>
      <div className="device-row">
        {["Polar", "Garmin", "Oura", "Whoop"].map((v) => (
          <div key={v} className="card device-card">
            <div className="device-card__title">{v}</div>
            <button className="btn primary" onClick={() => connectDevice(v)}>
              Connect
            </button>
            <div className="device-status">{status[v] || "Ожидает подключения..."}</div>
            <div className="metric-large">
              {hr[v] ?? "--"} <span>bpm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- COACH ------------------------------- */
function CoachView() {
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem("players");
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<ViewMode>("list");
  const [sessionActive, setSessionActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const btRefs = useRef<Record<string, { device: BluetoothDevice }>>({});

  useEffect(() => {
    if (!sessionActive) return;
    const id = setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) => {
          const hr = p.currentHR || 0;
          const zb = p.zonesBoundaries;
          const inc = { z1: 0, z2: 0, z3: 0, z4: 0 } as any;
          if (hr >= zb.z1[0] && hr <= zb.z1[1]) inc.z1 = 1;
          else if (hr >= zb.z2[0] && hr <= zb.z2[1]) inc.z2 = 1;
          else if (hr >= zb.z3[0] && hr <= zb.z3[1]) inc.z3 = 1;
          else if (hr >= zb.z4[0] && hr <= zb.z4[1]) inc.z4 = 1;
          const t = p.timeInZones;
          return {
            ...p,
            timeInZones: {
              z1: t.z1 + inc.z1,
              z2: t.z2 + inc.z2,
              z3: t.z3 + inc.z3,
              z4: t.z4 + inc.z4,
            },
          };
        })
      );
    }, 1000);
    return () => clearInterval(id);
  }, [sessionActive]);

  function savePlayers(updated: Player[]) {
    setPlayers(updated);
    localStorage.setItem("players", JSON.stringify(updated));
  }

  function startSession() {
    setSessionActive(true);
  }

  function endSession() {
    setSessionActive(false);
    Object.values(btRefs.current).forEach((ref) => {
      try {
        if (ref.device.gatt.connected) ref.device.gatt.disconnect();
      } catch {}
    });
  }

  async function addPlayer(data: any) {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const ch = await service.getCharacteristic("heart_rate_measurement");
      await ch.startNotifications();

      const id = `p_${Date.now()}`;
      const newPlayer: Player = {
        id,
        name: data.name,
        nickname: data.nickname,
        sensorId: data.sensorId,
        connected: true,
        maxHR: data.z4max,
        zonesBoundaries: {
          z1: [data.z1min, data.z1max],
          z2: [data.z2min, data.z2max],
          z3: [data.z3min, data.z3max],
          z4: [data.z4min, data.z4max],
        },
        timeInZones: { z1: 0, z2: 0, z3: 0, z4: 0 },
      };

      btRefs.current[id] = { device };
      ch.addEventListener("characteristicvaluechanged", (e: any) => {
        const bpm = parseHeartRate(e.target.value as DataView);
        setPlayers((prev) => {
          const updated = prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  currentHR: bpm,
                  avgHR: p.avgHR ? Math.round(p.avgHR * 0.8 + bpm * 0.2) : bpm,
                }
              : p
          );
          localStorage.setItem("players", JSON.stringify(updated));
          return updated;
        });
      });

      const updatedPlayers = [...players, newPlayer];
      savePlayers(updatedPlayers);
      setShowModal(false);
    } catch (e: any) {
      alert("Ошибка подключения: " + e.message);
    }
  }

  return (
    <div className="wearables-container">
      <h2 className="tab-title">Wearables — Coach</h2>

      <div className="card top-controls">
        <div className="btn-row">
          <button className="btn success" onClick={startSession} disabled={sessionActive}>
            Start Session
          </button>
          <button className="btn danger" onClick={endSession} disabled={!sessionActive}>
            End Session
          </button>
          <button className="btn primary" onClick={() => setShowModal(true)}>
            ADD
          </button>
        </div>
      </div>

      <TeamDashboard view={view} setView={setView} players={players} />

      {showModal && <AddModal onClose={() => setShowModal(false)} onConnect={addPlayer} />}
    </div>
  );
}

/* -------------------------- TEAM DASHBOARD -------------------------- */
function TeamDashboard({
  view,
  setView,
  players,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  players: Player[];
}) {
  return (
    <div className="card team-dashboard">
      <div className="card-header">
        <div className="title">Team Dashboard</div>
        <div className="segmented top-aligned">
          {["list", "team", "comparison"].map((m) => (
            <button
              key={m}
              className={`segm-btn ${view === m ? "active" : ""}`}
              onClick={() => setView(m as ViewMode)}
            >
              {m === "list"
                ? "List"
                : m === "team"
                ? "Whole Team"
                : "Comparison"}
            </button>
          ))}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="table">
          <div className="thead">
            <div>Player</div>
            <div>HR</div>
            <div>Avg HR</div>
            <div>% Max</div>
            <div>Zones (time)</div>
          </div>
          {players.length ? (
            players.map((p) => {
              const hr = Math.round(p.currentHR ?? 0);
              const avg = Math.round(p.avgHR ?? 0);
              const max = p.maxHR || 190;
              const pct = Math.round((hr / max) * 100);
              const tz = p.timeInZones;
              return (
                <div key={p.id} className="trow">
                  <div>
                    {p.name}{" "}
                    {p.nickname && (
                      <span className="muted">({p.nickname})</span>
                    )}
                    {p.sensorId && (
                      <span className="muted"> [{p.sensorId}]</span>
                    )}
                    {p.connected ? (
                      <span className="chip tiny ok">Connected</span>
                    ) : (
                      <span className="chip tiny">Not connected</span>
                    )}
                  </div>
                  <div>{hr || "--"} bpm</div>
                  <div>{avg || "--"} bpm</div>
                  <div>{pct}%</div>
                  <div className="zones-inline">
                    <span className="zone chip z1">Z1 {tz.z1}s</span>
                    <span className="zone chip z2">Z2 {tz.z2}s</span>
                    <span className="zone chip z3">Z3 {tz.z3}s</span>
                    <span className="zone chip z4">Z4 {tz.z4}s</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-note">Пока нет подключённых игроков.</div>
          )}
        </div>
      )}

      {/* WHOLE TEAM VIEW */}
      {view === "team" && (
        <div className="team-grid">
          {players.length ? (
            players.map((p) => {
              const hr = Math.round(p.currentHR ?? 0);
              const avg = Math.round(p.avgHR ?? 0);
              return (
                <div key={p.id} className="team-card">
                  <div className="team-card__head">
                    <span className="team-name">{p.name}</span>
                    {p.connected ? (
                      <span className="chip tiny ok">●</span>
                    ) : (
                      <span className="chip tiny">●</span>
                    )}
                  </div>
                  <div className="team-hr">
                    {hr || "--"}
                    <span> bpm</span>
                  </div>
                  <div className="team-avg">Avg {avg || "--"}</div>
                  <div className="zone-bars">
                    <div className="bar z1" />
                    <div className="bar z2" />
                    <div className="bar z3" />
                    <div className="bar z4" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-note">Пока нет подключённых игроков.</div>
          )}
        </div>
      )}

      {/* COMPARISON */}
      {view === "comparison" && (
        <div className="empty-note">Comparison пока не активен.</div>
      )}
    </div>
  );
}

/* ----------------------------- ADD MODAL ----------------------------- */
function AddModal({
  onClose,
  onConnect,
}: {
  onClose: () => void;
  onConnect: (data: any) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    sensorId: "",
    z1min: 90,
    z1max: 120,
    z2min: 121,
    z2max: 140,
    z3min: 141,
    z3max: 160,
    z4min: 161,
    z4max: 190,
  });
  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title">Add Player</div>
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return alert("Введите имя игрока");
            onConnect(form);
          }}
        >
          <label className="lbl">Имя игрока</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <label className="lbl">Nickname (опционально)</label>
          <input
            className="input"
            value={form.nickname}
            onChange={(e) => update("nickname", e.target.value)}
          />
          <label className="lbl">Sensor ID (опционально)</label>
          <input
            className="input"
            value={form.sensorId}
            onChange={(e) => update("sensorId", e.target.value)}
          />
          <div className="zones-mini-title">Heart Rate Zones (редактируемые)</div>
          <div className="zones-grid-compact">
            {["1", "2", "3", "4"].map((z) => (
              <div key={z} className="zone-mini">
                <div className="zone-name">Zone {z}</div>
                <input
                  className="input"
                  type="number"
                  value={(form as any)[`z${z}min`]}
                  onChange={(e) => update(`z${z}min`, Number(e.target.value))}
                />
                <input
                  className="input"
                  type="number"
                  value={(form as any)[`z${z}max`]}
                  onChange={(e) => update(`z${z}max`, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn primary" type="submit">
              Connect
            </button>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- SPECIALIST ----------------------------- */
function SpecialistView() {
  const [view, setView] = useState<ViewMode>("list");
  const [players] = useState<Player[]>(
    () => JSON.parse(localStorage.getItem("players") || "[]")
  );

  return (
    <div className="wearables-container">
      <h2 className="tab-title">Wearables — Specialist</h2>
      <TeamDashboard view={view} setView={setView} players={players} />
    </div>
  );
}

/* ------------------------------- ROOT ------------------------------- */
export default function Wearables() {
  const role = getRole();
  if (role === "athlete") return <AthleteView />;
  if (role === "specialist") return <SpecialistView />;
  return <CoachView />;
}
