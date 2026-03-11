import { useState, useEffect } from "react";

const BACKEND_URL = "https://interview-scheduler-production-5c57.up.railway.app";

const STATUS_CONFIG = {
  calling:   { label: "Calling...",  color: "#ffd700" },
  scheduled: { label: "Scheduled",  color: "#00e5a0" },
  busy:      { label: "Busy",       color: "#ff6584" },
  failed:    { label: "Failed",     color: "#ff6584" },
  completed: { label: "Completed",  color: "#00e5a0" },
};

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll backend every 5 seconds for real updates
  useEffect(() => {
    fetchInterviews();
    const interval = setInterval(fetchInterviews, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/interviews`);
      const data = await res.json();
      setInterviews(data.reverse()); // newest first
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setLoading(false);
    }
  };

  const deleteInterview = async (id) => {
    await fetch(`${BACKEND_URL}/interviews/${id}`, { method: "DELETE" });
    fetchInterviews();
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner" /> Loading interviews...
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="card-title">// Scheduled Interviews</div>
        <div className="dashboard-count">{interviews.length} total</div>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state">
          No interviews scheduled yet. Use the form above to schedule one!
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="interview-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Requested Slot</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => {
                const statusCfg = STATUS_CONFIG[interview.status] || 
                                  STATUS_CONFIG.calling;
                return (
                  <tr key={interview.id}>
                    <td className="td-name">{interview.name}</td>
                    <td className="td-mono">{interview.phone}</td>
                    <td className="td-mono">{interview.role}</td>
                    <td className="td-mono">
                      {interview.confirmedSlot || 
                       `${interview.requestedDay} · ${interview.requestedTime}`}
                      {interview.confirmedSlot && (
                        <span className="confirmed-badge">confirmed</span>
                      )}
                    </td>
                    <td>
                      <div className="status-badge" 
                           style={{ color: statusCfg.color,
                                    borderColor: statusCfg.color }}>
                        <div className="status-dot-small" 
                             style={{ background: statusCfg.color,
                                      boxShadow: `0 0 6px ${statusCfg.color}` }} 
                        />
                        {statusCfg.label}
                      </div>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteInterview(interview.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}