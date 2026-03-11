export default function StatsRow({ stats }) {
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-val">{stats.total}</div>
        <div className="stat-label">Calls Made</div>
      </div>
      <div className="stat">
        <div className="stat-val">{stats.scheduled}</div>
        <div className="stat-label">Scheduled</div>
      </div>
      <div className="stat">
        <div className="stat-val">~45s</div>
        <div className="stat-label">Avg Call Time</div>
      </div>
    </div>
  );
}
