import { useState } from "react";
import Header from "./components/Header";
import SchedulerForm from "./components/SchedulerForm";
import StatusPanel from "./components/StatusPanel";
import StatsRow from "./components/StatsRow";
import Dashboard from "./components/Dashboard";
import "./App.css";

const BACKEND_URL = "https://interview-scheduler-production-5c57.up.railway.app";

const AGENT_ID = import.meta.env.VITE_AGENT_ID;
const BOLNA_API_KEY = import.meta.env.VITE_BOLNA_API_KEY;

export default function App() {
  const [status, setStatus] = useState(null); // null | 'calling' | 'success' | 'error'
  const [logs, setLogs] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const [stats, setStats] = useState({ total: 0, scheduled: 0 });
  const [loading, setLoading] = useState(false);

  const addLog = (msg, type = "") => {
    setLogs((prev) => [
      ...prev,
      {
        msg,
        type,
        ts: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      },
    ]);
  };

  const runDemoMode = (formData) => {
    setLoading(true);
    setLogs([]);
    setSuccessData(null);
    setStatus("calling");

    const steps = [
      [0, "[DEMO MODE] Add your API key for real calls", "red"],
      [400, "Connecting to Bolna API...", "purple"],
      [800, "Agent Maya initialized", "purple"],
      [1200, `Dialing ${formData.phone}...`, ""],
      [1700, "Candidate picked up", "green"],
      [2100, `Maya: "Hi, am I speaking with ${formData.name}?"`, ""],
      [2700, "Candidate confirmed identity", "green"],
      [3200, `Maya: Offering slot — ${formData.day} at ${formData.time}`, ""],
      [3900, "Candidate accepted the slot ✓", "green"],
      [4300, "Maya: Confirming interview details...", ""],
      [4800, "Call completed successfully", "green"],
    ];

    steps.forEach(([delay, msg, type]) => {
      setTimeout(() => addLog(msg, type), delay);
    });

    setTimeout(() => {
      setStatus("success");
      setSuccessData(formData);
      setStats((s) => ({ total: s.total + 1, scheduled: s.scheduled + 1 }));
      setLoading(false);
    }, 5200);
  };

  const handleSchedule = async (formData) => {
    setLoading(true);
    setLogs([]);
    setSuccessData(null);
    setStatus("calling");

    addLog(`Initiating call to ${formData.name}`, "purple");
    addLog(`Phone: ${formData.phone}`, "");
    addLog(`Slot: ${formData.day} at ${formData.time}`, "");

    try {
      // Step 1 — Save to YOUR backend first
      const saveRes = await fetch(`${BACKEND_URL}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const saveData = await saveRes.json();
      addLog(`Interview saved to database ✓`, "green");

      // Step 2 — Now call Bolna API
      const res = await fetch("https://api.bolna.dev/call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BOLNA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          recipient_phone_number: formData.phone,
          user_data: {
            candidate_name: formData.name,
            day: formData.day,
            time: formData.time,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const callId = data.execution_id || data.call_id || data.id;
        addLog("Call placed successfully ✓", "green");
        addLog(`Execution ID: ${callId}`, "");

        // Update backend with the call ID
        await fetch(
          `${BACKEND_URL}/interviews/${saveData.interview.id}/callid`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callId }),
          },
        );

        setStatus("success");
        setSuccessData(formData);
        setStats((s) => ({ total: s.total + 1, scheduled: s.scheduled + 1 }));
      } else {
        throw new Error(data.message || "Bolna API error");
      }
    } catch (err) {
      addLog(`Error: ${err.message}`, "red");
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="container">
        <Header />
        <SchedulerForm onSchedule={handleSchedule} loading={loading} />
        <StatusPanel status={status} logs={logs} successData={successData} />
        <Dashboard /> {/* ← Add this */}
        <StatsRow stats={stats} />
      </div>
    </div>
  );
}
