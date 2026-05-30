import { useState } from "react";
import { getBestScore } from "../utils/storage";

const DIFFICULTIES = [
  {
    level: 3,
    label: "Easy",
    desc: "Close color matches — no time pressure",
    icon: "◎",
  },
  {
    level: 4,
    label: "Medium",
    desc: "Nearly identical colors — timed selection",
    icon: "◑",
  },
  {
    level: 5,
    label: "Hard",
    desc: "Pixel-perfect memory — heavy distractions",
    icon: "●",
  },
];

export default function Home({ onStart }) {
  const [difficulty, setDifficulty] = useState(3);
  const [rounds, setRounds] = useState(5);
  const bestScore = getBestScore();

  return (
    <div style={styles.wrapper}>
      <div style={styles.glow} />

      <div style={styles.layout}>
        {/* Left / Top — Branding */}
        <div style={styles.brandSide}>
          <div style={styles.pill} className="mono">COLOR MEMORY GAME</div>
          <h1 style={styles.title}>Color<br />Drift</h1>
          <p style={styles.subtitle}>
            Memorize the color.<br />Recall it perfectly.
          </p>

          {bestScore > 0 && (
            <div style={styles.bestScore}>
              <span style={styles.bestLabel} className="mono">YOUR BEST</span>
              <span style={styles.bestNum}>{bestScore}</span>
            </div>
          )}

          <div style={styles.colorDots}>
            {["#e74c3c","#e67e22","#f1c40f","#2ecc71","#3498db","#9b59b6"].map((c, i) => (
              <div key={i} style={{ ...styles.dot, background: c }} />
            ))}
          </div>
        </div>

        {/* Right / Bottom — Controls */}
        <div style={styles.controlSide}>
          <div style={styles.section}>
            <label style={styles.sectionLabel} className="mono">SELECT DIFFICULTY</label>
            <div style={styles.diffGrid}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.level}
                  style={{
                    ...styles.diffBtn,
                    ...(difficulty === d.level ? styles.diffBtnActive : {}),
                  }}
                  onClick={() => setDifficulty(d.level)}
                >
                  <div style={styles.diffTop}>
                    <span style={styles.diffIcon}>{d.icon}</span>
                    <span style={styles.diffLabel}>{d.label}</span>
                    {d.level >= 4 && (
                      <span style={styles.timerTag} className="mono">TIMED</span>
                    )}
                  </div>
                  <span style={styles.diffDesc} className="mono">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.sectionLabel} className="mono">
              ROUNDS — <span style={{ color: "var(--accent)" }}>{rounds}</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderTicks} className="mono">
              {[3,4,5,6,7,8,9,10].map(n => (
                <span key={n} style={{ color: n === rounds ? "var(--accent)" : "var(--muted)" }}>{n}</span>
              ))}
            </div>
          </div>

          <button
            style={styles.startBtn}
            onClick={() => onStart({ difficulty, rounds })}
          >
            Start Game →
          </button>

          <p style={styles.hint} className="mono">
            {difficulty === 3 && "6 color options · no timer during selection"}
            {difficulty === 4 && "6 color options · 5s to pick · mild distractions"}
            {difficulty === 5 && "6 color options · 3s to pick · heavy distractions"}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(20px, 4vw, 48px)",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "fixed",
    width: "700px",
    height: "700px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,106,255,0.10) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "clamp(32px, 6vw, 80px)",
    width: "100%",
    maxWidth: "960px",
    position: "relative",
    zIndex: 1,
    alignItems: "center",
  },
  brandSide: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  pill: {
    display: "inline-flex",
    alignSelf: "flex-start",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "99px",
    padding: "5px 14px",
    fontSize: "10px",
    color: "var(--muted)",
    letterSpacing: "0.1em",
  },
  title: {
    fontSize: "clamp(60px, 9vw, 100px)",
    fontWeight: 800,
    lineHeight: 0.88,
    letterSpacing: "-0.03em",
    color: "var(--text)",
  },
  subtitle: {
    fontSize: "clamp(14px, 1.6vw, 17px)",
    color: "var(--muted)",
    lineHeight: 1.6,
  },
  bestScore: {
    display: "inline-flex",
    alignItems: "center",
    gap: "16px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "14px 20px",
    alignSelf: "flex-start",
  },
  bestLabel: {
    fontSize: "10px",
    letterSpacing: "0.12em",
    color: "var(--muted)",
  },
  bestNum: {
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--accent)",
  },
  colorDots: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
  },
  dot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    opacity: 0.7,
  },
  controlSide: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionLabel: {
    fontSize: "10px",
    letterSpacing: "0.12em",
    color: "var(--muted)",
  },
  diffGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  diffBtn: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px 18px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--muted)",
    transition: "var(--transition)",
    cursor: "pointer",
    textAlign: "left",
  },
  diffBtnActive: {
    background: "var(--surface2)",
    border: "1px solid var(--accent)",
    color: "var(--text)",
  },
  diffTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  diffIcon: {
    fontSize: "16px",
  },
  diffLabel: {
    fontSize: "16px",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    flex: 1,
  },
  timerTag: {
    fontSize: "9px",
    letterSpacing: "0.1em",
    background: "rgba(255,90,90,0.15)",
    color: "var(--danger)",
    border: "1px solid rgba(255,90,90,0.3)",
    borderRadius: "99px",
    padding: "2px 8px",
  },
  diffDesc: {
    fontSize: "11px",
    opacity: 0.6,
    lineHeight: 1.4,
  },
  slider: {
    width: "100%",
    accentColor: "var(--accent)",
    cursor: "pointer",
  },
  sliderTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
  },
  startBtn: {
    width: "100%",
    padding: "18px",
    background: "var(--accent)",
    color: "#0a0a0f",
    borderRadius: "var(--radius-md)",
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    border: "none",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  hint: {
    textAlign: "center",
    fontSize: "11px",
    color: "var(--muted)",
    letterSpacing: "0.04em",
  },
};
