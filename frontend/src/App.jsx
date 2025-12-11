// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const api = axios.create({ baseURL: "/api" });

function NumberInput({ label, value, onChange, min = 0, max = 99 }) {
  return (
    <label className="field">
      <div className="field-label">{label}</div>
      <div className="number-wrap" role="group" aria-label={label}>
        <button
          type="button"
          className="step"
          onClick={() => onChange(Math.max(min, Number(value) - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          className="number-input"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Number(e.target.value || 0);
            if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          aria-label={label}
        />
        <button
          type="button"
          className="step"
          onClick={() => onChange(Math.min(max, Number(value) + 1))}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </label>
  );
}

/* Booking Page */
function BookingPage() {
  const [courts, setCourts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    courtId: "",
    date: "",
    startTime: "18:00",
    durationHours: 1,
    rackets: 0,
    shoes: 0,
    coachId: ""
  });
  const [price, setPrice] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cRes, chRes] = await Promise.all([api.get("/courts"), api.get("/coaches")]);
        setCourts(cRes.data || []);
        setCoaches(chRes.data || []);
        if ((cRes.data || []).length > 0 && !form.courtId) {
          setForm((f) => ({ ...f, courtId: cRes.data[0]._id }));
        }
      } catch (err) {
        console.error(err);
        setMessage("Unable to load courts or coaches. Check backend.");
      }
    }
    load();
    // eslint-disable-next-line
  }, []);

  function toDateTime(date, time) {
    if (!date) return null;
    return new Date(`${date}T${time}:00`);
  }

  async function handleQuote() {
    setMessage("");
    setPrice(null);
    if (!form.date) {
      setMessage("Please select a date.");
      return;
    }
    if (!form.courtId) {
      setMessage("Please select a court.");
      return;
    }
    const start = toDateTime(form.date, form.startTime);
    const end = new Date(start.getTime() + form.durationHours * 60 * 60 * 1000);

    setLoadingQuote(true);
    try {
      const res = await api.post("/bookings/quote", {
        courtId: form.courtId,
        startTime: start,
        endTime: end,
        rackets: Number(form.rackets),
        shoes: Number(form.shoes),
        coachId: form.coachId || null
      });
      setPrice(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Unable to fetch quote.");
    } finally {
      setLoadingQuote(false);
    }
  }

  async function handleBook() {
    setMessage("");
    if (!form.userName.trim()) {
      setMessage("Please enter your name.");
      return;
    }
    if (!form.date) {
      setMessage("Please choose a date.");
      return;
    }
    const start = toDateTime(form.date, form.startTime);
    const end = new Date(start.getTime() + form.durationHours * 60 * 60 * 1000);

    setSaving(true);
    try {
      const res = await api.post("/bookings", {
        userName: form.userName,
        courtId: form.courtId,
        startTime: start,
        endTime: end,
        rackets: Number(form.rackets),
        shoes: Number(form.shoes),
        coachId: form.coachId || null
      });
      setMessage(`Booking confirmed — Total ₹${Math.round(res.data.pricingBreakdown.total)}`);
      setPrice(res.data.pricingBreakdown || null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Booking failed");
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="container booking-outer">
      <div className="card booking-card">
        <header className="card-header">
          <h2 className="title">Book a Court</h2>
          <p className="subtitle">Reserve court, equipment and coach in a single flow</p>
        </header>

        <div className="form-grid" role="form" aria-label="Booking form">
          <label className="field">
            <div className="field-label">Your name</div>
            <input
              className="input"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              placeholder="Full name"
            />
          </label>

          <label className="field">
            <div className="field-label">Court</div>
            <select
              className="input"
              value={form.courtId}
              onChange={(e) => setForm({ ...form, courtId: e.target.value })}
            >
              <option value="">Select court</option>
              {courts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.sport} - ₹{c.basePricePerHour}/hr
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <div className="field-label">Date</div>
            <input
              className="input"
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label className="field">
            <div className="field-label">Start time</div>
            <input
              className="input"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </label>

          <label className="field">
            <div className="field-label">Duration (hours)</div>
            <div>
              <input
                className="range"
                type="range"
                min="1"
                max="4"
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
                aria-valuemin={1}
                aria-valuemax={4}
              />
              <div className="range-value">{form.durationHours} hr{form.durationHours>1 ? 's':''}</div>
            </div>
          </label>

          <NumberInput
            label="Rackets"
            value={form.rackets}
            min={0}
            max={6}
            onChange={(v) => setForm({ ...form, rackets: v })}
          />

          <NumberInput
            label="Shoes"
            value={form.shoes}
            min={0}
            max={6}
            onChange={(v) => setForm({ ...form, shoes: v })}
          />

          <label className="field">
            <div className="field-label">Coach (optional)</div>
            <select
              className="input"
              value={form.coachId}
              onChange={(e) => setForm({ ...form, coachId: e.target.value })}
            >
              <option value="">No coach</option>
              {coaches.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.name} - ₹{ch.hourlyRate}/hr
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button className="btn" onClick={handleQuote} disabled={loadingQuote}>
            {loadingQuote ? "Calculating…" : "Get Price Quote"}
          </button>
          <button className="btn primary" onClick={handleBook} disabled={saving}>
            {saving ? "Booking…" : "Confirm Booking"}
          </button>
        </div>

        {price && (
          <div className="price-box" aria-live="polite">
            <h3>Price breakdown</h3>
            <ul>
              <li>Base: ₹{Math.round(price.basePrice)}</li>
              <li>Peak extra: ₹{Math.round(price.peakHourFee)}</li>
              <li>Weekend extra: ₹{Math.round(price.weekendFee)}</li>
              <li>Equipment fee: ₹{Math.round(price.equipmentFee)}</li>
              <li>Coach fee: ₹{Math.round(price.coachFee)}</li>
            </ul>
            <div className="total">Total: ₹{Math.round(price.total)}</div>
          </div>
        )}

        {message && <div className="message" role="status">{message}</div>}
      </div>
    </section>
  );
}

/* Admin Dashboard */
function AdminDashboard() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "PEAK_HOUR",
    startHour: 18,
    endHour: 22,
    multiplier: 1.5,
    equipmentFeePerItem: 30
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const res = await api.get("/rules");
      setRules(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateRule() {
    setSaving(true);
    setMsg("");
    try {
      const body = { ...form };
      if (body.type !== "EQUIPMENT_FEE") body.equipmentFeePerItem = 0;
      if (body.type === "EQUIPMENT_FEE") {
        body.startHour = null;
        body.endHour = null;
      }
      await api.post("/rules", body);
      setMsg("Rule added");
      setForm({
        name: "",
        type: "PEAK_HOUR",
        startHour: 18,
        endHour: 22,
        multiplier: 1.5,
        equipmentFeePerItem: 30
      });
      await loadRules();
    } catch (err) {
      console.error(err);
      setMsg("Error adding rule");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="container booking-outer">
      <div className="card admin-card">
        <header className="card-header">
          <h2 className="title">Admin — Pricing Rules</h2>
          <p className="subtitle">Manage dynamic pricing rules</p>
        </header>

        <div className="form-grid admin-grid">
          <label className="field">
            <div className="field-label">Rule name</div>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>

          <label className="field">
            <div className="field-label">Type</div>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="PEAK_HOUR">Peak Hour</option>
              <option value="WEEKEND">Weekend</option>
              <option value="EQUIPMENT_FEE">Equipment Fee</option>
            </select>
          </label>

          {form.type === "PEAK_HOUR" && (
            <>
              <label className="field">
                <div className="field-label">Start hour (0–23)</div>
                <input className="input" type="number" min="0" max="23" value={form.startHour} onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })} />
              </label>
              <label className="field">
                <div className="field-label">End hour (1–24)</div>
                <input className="input" type="number" min="1" max="24" value={form.endHour} onChange={(e) => setForm({ ...form, endHour: Number(e.target.value) })} />
              </label>
              <label className="field">
                <div className="field-label">Multiplier</div>
                <input className="input" type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })} />
              </label>
            </>
          )}

          {form.type === "WEEKEND" && (
            <label className="field">
              <div className="field-label">Multiplier</div>
              <input className="input" type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })} />
            </label>
          )}

          {form.type === "EQUIPMENT_FEE" && (
            <label className="field">
              <div className="field-label">Fee per item (₹)</div>
              <input className="input" type="number" value={form.equipmentFeePerItem} onChange={(e) => setForm({ ...form, equipmentFeePerItem: Number(e.target.value) })} />
            </label>
          )}
        </div>

        <div className="actions">
          <button className="btn primary" onClick={handleCreateRule} disabled={saving}>
            {saving ? "Saving…" : "Add Rule"}
          </button>
          {msg && <div className="message">{msg}</div>}
        </div>

        <div className="list">
          <h3>Existing Rules</h3>
          <ul>
            {rules.map((r) => (
              <li key={r._id}>
                <strong>{r.name}</strong> — {r.type}{" "}
                {r.type === "PEAK_HOUR" && `(Hrs ${r.startHour}-${r.endHour}, x${r.multiplier})`}
                {r.type === "WEEKEND" && `(x${r.multiplier} on weekends)`}
                {r.type === "EQUIPMENT_FEE" && `(₹${r.equipmentFeePerItem} per item)`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* App root and header */
export default function App() {
  const [view, setView] = useState("book");

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-title">Sports Facility Booking</div>
            <div className="brand-sub">Court | Coach | Equipment</div>
          </div>

          <nav className="nav" role="navigation" aria-label="Main">
            <button className={view === "book" ? "tab active" : "tab"} onClick={() => setView("book")}>
              Book a Court
            </button>
            <button className={view === "admin" ? "tab active" : "tab"} onClick={() => setView("admin")}>
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main>
        {view === "book" ? <BookingPage /> : <AdminDashboard />}
      </main>

    </div>
  );
}
