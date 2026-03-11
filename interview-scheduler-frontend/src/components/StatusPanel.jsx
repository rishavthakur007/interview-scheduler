export default function StatusPanel({ status, logs, successData }) {
  if (!status) return null;

  const dotClass = `status-dot ${
    status === "calling" ? "calling" : status === "success" ? "success" : "error"
  }`;

  const titleMap = {
    calling: `Calling candidate...`,
    success: "Interview Scheduled ✓",
    error: "Call Failed",
  };

  return (
    <>
      <div className="status-panel">
        <div className="status-header">
          <div className={dotClass} />
          <span>{titleMap[status]}</span>
        </div>
        <div className="status-body">
          {logs.map((log, i) => (
            <div key={i} className={`log-line ${log.type}`}>
              <span className="ts">{log.ts}</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {successData && (
        <div className="success-card">
          <h3>✓ Interview Scheduled</h3>
          {[
            ["Candidate", successData.name],
            ["Phone", successData.phone],
            ["Role", successData.role],
            ["Round", successData.round],
            ["Slot", `${successData.day} · ${successData.time}`],
            ["Format", "Virtual · Google Meet · 45 min"],
            ["Confirmation", "Email sent via hr@techcorp.com"],
          ].map(([k, v]) => (
            <div className="detail-row" key={k}>
              <span className="dk">{k}</span>
              <span className="dv">{v}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
