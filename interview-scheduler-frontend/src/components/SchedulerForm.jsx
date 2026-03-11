import { useState } from "react";

const DAYS = ["Wednesday", "Thursday", "Next Wednesday", "Next Thursday"];
const TIMES = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
const ROUNDS = [
  "Round 1 — HR Screening",
  "Round 2 — Technical",
  "Round 3 — Final",
];

export default function SchedulerForm({ onSchedule, loading }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [round, setRound] = useState(ROUNDS[0]);
  const [day, setDay] = useState("Wednesday");
  const [time, setTime] = useState("2:00 PM");

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      alert("Please enter candidate name and phone number.");
      return;
    }
    if (!phone.startsWith("+")) {
      alert("Phone must include country code, e.g. +91XXXXXXXXXX");
      return;
    }
    onSchedule({ name, phone, role, round, day, time });
  };

  return (
    <div className="card">
      <div className="card-title">// Candidate Details</div>

      <div className="form-grid">
        <div className="field">
          <label>Candidate Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
          />
        </div>

        <div className="field">
          <label>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
          />
        </div>

        <div className="field">
          <label>Role Applied For</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Interview Round</label>
          <select value={round} onChange={(e) => setRound(e.target.value)}>
            {ROUNDS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="field full">
          <div className="slots-label">Preferred Day</div>
          <div className="slots">
            {DAYS.map((d) => (
              <div
                key={d}
                className={`slot ${day === d ? "active" : ""}`}
                onClick={() => setDay(d)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="field full">
          <div className="slots-label">Preferred Time</div>
          <div className="slots">
            {TIMES.map((t) => (
              <div
                key={t}
                className={`slot ${time === t ? "active" : ""}`}
                onClick={() => setTime(t)}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider" />

      

      <button className="btn" onClick={handleSubmit} disabled={loading}>
        <span className="btn-inner">
          {loading ? (
            <>
              <span className="spinner" /> Calling candidate...
            </>
          ) : (
            <>
              <PhoneIcon /> Schedule Interview via Maya
            </>
          )}
        </span>
      </button>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.15 1.23 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}
