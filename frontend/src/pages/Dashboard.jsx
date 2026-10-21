import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import statsService from "../services/statsService";
import "../styles/pages/Dashboard.css";

const DAYS = 14;

const SOURCES = [
  { key: "voice", label: "Voice responses" },
  { key: "faq", label: "FAQs" },
  { key: "ai", label: "AI (Gemini)" },
  { key: "fallback", label: "No answer" },
];

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const formatDay = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const lastDays = (daily) =>
  Array.from({ length: DAYS }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (DAYS - 1) + i);
    return { key: dayKey(date), label: formatDay(date), count: daily[dayKey(date)] || 0 };
  });

// Counts from 0 up to value with an ease-out; jumps straight there for reduced motion.
const CountUp = ({ value, suffix = "" }) => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    let id;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <>
      {shown}
      {suffix}
    </>
  );
};

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    statsService
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Couldn't load analytics. Please refresh to try again."));
  }, []);

  const header = (
    <>
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">How your assistant is doing.</p>
    </>
  );

  if (error || !stats) {
    return (
      <AdminLayout>
        {header}
        <p className={error ? "dashboard-error" : "dashboard-muted"}>{error || "Loading..."}</p>
      </AdminLayout>
    );
  }

  const { totals, sources, daily, gaps } = stats;
  const days = lastDays(daily);
  const recent = days.reduce((sum, d) => sum + d.count, 0);
  const peak = Math.max(...days.map((d) => d.count), 1);
  const answeredByContent = sources.voice + sources.faq;

  return (
    <AdminLayout>
      {header}

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <div className="dashboard-card-label">Conversations</div>
          <div className="dashboard-card-value"><CountUp value={totals.conversations} /></div>
          <div className="dashboard-card-note">{recent} in the last {DAYS} days</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-label">Answered by your content</div>
          <div className="dashboard-card-value">
            {totals.conversations ? (
              <CountUp value={percent(answeredByContent, totals.conversations)} suffix="%" />
            ) : (
              "-"
            )}
          </div>
          <div className="dashboard-card-note">from voice responses and FAQs</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-label">Leads</div>
          <div className="dashboard-card-value"><CountUp value={totals.leads} /></div>
          <div className="dashboard-card-note">{totals.newLeads} not contacted yet</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-label">Active content</div>
          <div className="dashboard-card-value">
            <CountUp value={totals.faqs + totals.voiceResponses} />
          </div>
          <div className="dashboard-card-note">
            {totals.faqs} FAQs · {totals.voiceResponses} voice responses
          </div>
        </div>
      </div>

      <div className="dashboard-panels">
        <section className="dashboard-panel">
          <h2 className="dashboard-panel-title">Conversations per day</h2>
          <p className="dashboard-panel-sub">Last {DAYS} days</p>

          <div
            className="chart-bars"
            role="img"
            aria-label={`Conversations per day: ${days.map((d) => `${d.label} ${d.count}`).join(", ")}`}
          >
            <span className="chart-peak">{peak}</span>
            {days.map((d, i) => (
              <div className="chart-col" key={d.key} tabIndex={0} style={{ "--i": i }}>
                <div className="chart-bar" style={{ height: `${(d.count / peak) * 100}%` }} />
                <span className="chart-tip">
                  {d.label}: <strong>{d.count}</strong>
                </span>
              </div>
            ))}
          </div>
          <div className="chart-axis">
            <span>{days[0].label}</span>
            <span>Today</span>
          </div>
        </section>

        <section className="dashboard-panel">
          <h2 className="dashboard-panel-title">How questions were answered</h2>
          <p className="dashboard-panel-sub">All time</p>

          <div className="source-list">
            {SOURCES.map(({ key, label }) => (
              <div className="source-row" key={key}>
                <span className="source-label">{label}</span>
                <div className="source-track">
                  <div
                    className="source-fill"
                    style={{ width: `${percent(sources[key], totals.conversations)}%` }}
                  />
                </div>
                <span className="source-value">
                  {sources[key]} <span>({percent(sources[key], totals.conversations)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="dashboard-panel">
        <h2 className="dashboard-panel-title">Questions your content didn't answer</h2>
        <p className="dashboard-panel-sub">
          These went to AI or got no answer. Turn the common ones into FAQs.
        </p>

        {gaps.length === 0 ? (
          <p className="dashboard-muted">Nothing here. Your content covers every question so far.</p>
        ) : (
          <ul className="gap-list">
            {gaps.map((gap) => (
              <li className="gap-row" key={gap.question}>
                <div className="gap-main">
                  <span className="gap-question">{gap.question}</span>
                  <span className="gap-meta">
                    Asked {gap.count}× · last {formatDay(new Date(gap.lastAsked))} ·{" "}
                    {gap.source === "ai" ? "answered by AI" : "no answer"}
                  </span>
                </div>
                <button
                  type="button"
                  className="gap-add"
                  onClick={() => navigate("/admin/faqs", { state: { question: gap.question } })}
                >
                  Add as FAQ
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminLayout>
  );
};

export default Dashboard;
