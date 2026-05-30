import { useEffect, useState } from "react";
import { getBestScore } from "../utils/storage";
import { hslToString } from "../utils/colorUtils";

function getRating(score) {
  if (score >= 90) return { label: "Chromatic Master", emoji: "🎯", color: "var(--success)" };
  if (score >= 75) return { label: "Color Savant",     emoji: "👁️", color: "var(--accent)" };
  if (score >= 60) return { label: "Sharp Eye",        emoji: "👍", color: "#ffb84d" };
  if (score >= 40) return { label: "Getting There",    emoji: "🙂", color: "#ff9f43" };
  return               { label: "Keep Practicing",    emoji: "😅", color: "var(--danger)" };
}

export default function Results({ score, rounds, difficulty, roundScores, roundHistory, onReplay, onHome }) {
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const rating = getRating(score);

  useEffect(() => {
    const best = getBestScore();
    setBestScore(best);
    setIsNewBest(score >= best && score > 0);
  }, [score]);

  const difficultyLabel = ["", "", "", "Easy", "Medium", "Hard"][difficulty];

  return (
    <div style={styles.wrapper}>
      <div style={styles.glow} />
      <div style={styles.container} className="fade-in">

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.emoji}>{rating.emoji}</span>
          <h2 style={{ ...styles.rating, color: rating.color }}>{rating.label}</h2>
          {isNewBest && <div style={styles.newBestBadge} className="mono">✦ NEW BEST</div>}
        </div>

        {/* Score */}
        <div style={styles.scoreBlock}>
          <span style={{ ...styles.scoreNum, color: rating.color }}>{score}</span>
          <span style={styles.scoreMax} className="mono">/100 avg</span>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statValue} className="mono">{rounds}</span>
            <span style={styles.statLabel} className="mono">ROUNDS</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue} className="mono">{difficultyLabel}</span>
            <span style={styles.statLabel} className="mono">DIFFICULTY</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue} className="mono">{bestScore}</span>
            <span style={styles.statLabel} className="mono">BEST</span>
          </div>
        </div>

        {/* Round color swatches — like reference image */}
        {roundHistory && roundHistory.length > 0 && (
          <div style={styles.swatchSection}>
            <p style={styles.swatchTitle} className="mono">ROUND BREAKDOWN</p>
            <div style={styles.swatchList}>
              {roundHistory.map((r, i) => {
                const scoreColor =
                  r.score >= 80 ? "var(--success)" : r.score >= 50 ? "#ffb84d" : "var(--danger)";
                return (
                  <div key={i} style={styles.swatchRow}>
                    <span style={styles.swatchRound} className="mono">R{i + 1}</span>
                    <div style={styles.swatchPair}>
                      {/* Original */}
                      <div style={styles.swatchItem}>
                        <div style={{
                          ...styles.swatch,
                          background: hslToString(r.target),
                        }} />
                        <span style={styles.swatchLabel} className="mono">original</span>
                      </div>
                      {/* Arrow */}
                      <span style={styles.swatchArrow}>→</span>
                      {/* Picked */}
                      <div style={styles.swatchItem}>
                        {r.selected ? (
                          <div style={{
                            ...styles.swatch,
                            background: hslToString(r.selected),
                            outline: `2px solid ${scoreColor}`,
                            outlineOffset: "2px",
                          }} />
                        ) : (
                          <div style={{
                            ...styles.swatch,
                            background: "var(--surface2)",
                            border: "2px dashed var(--danger)",
                          }} />
                        )}
                        <span style={styles.swatchLabel} className="mono">
                          {r.selected ? "your pick" : "timed out"}
                        </span>
                      </div>
                    </div>
                    {/* Score pill */}
                    <span style={{ ...styles.swatchScore, color: scoreColor }} className="mono">
                      {r.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.replayBtn} onClick={onReplay}>Play Again</button>
          <button style={styles.homeBtn} onClick={onHome}>Home</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", padding: "clamp(20px, 4vw, 48px)",
    position: "relative", overflow: "hidden",
  },
  glow: {
    position: "fixed", width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 70%)",
    top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none",
  },
  container: {
    width: "100%", maxWidth: "480px", display: "flex",
    flexDirection: "column", gap: "24px", position: "relative", zIndex: 1,
  },
  header: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" },
  emoji: { fontSize: "36px", lineHeight: 1 },
  rating: { fontSize: "clamp(26px, 6vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em" },
  newBestBadge: {
    display: "inline-flex", background: "var(--accent)", color: "#0a0a0f",
    borderRadius: "99px", padding: "4px 12px", fontSize: "11px",
    fontWeight: 600, letterSpacing: "0.08em",
  },
  scoreBlock: { display: "flex", alignItems: "baseline", gap: "8px" },
  scoreNum: { fontSize: "clamp(64px, 14vw, 88px)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" },
  scoreMax: { fontSize: "18px", color: "var(--muted)" },
  statsRow: {
    display: "flex", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "18px 20px",
  },
  statItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  statValue: { fontSize: "18px", fontWeight: 500, color: "var(--text)" },
  statLabel: { fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em" },
  statDivider: { width: "1px", background: "var(--border)", margin: "0 4px" },

  swatchSection: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "20px",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  swatchTitle: { fontSize: "11px", letterSpacing: "0.1em", color: "var(--muted)" },
  swatchList: { display: "flex", flexDirection: "column", gap: "14px" },
  swatchRow: {
    display: "flex", alignItems: "center", gap: "12px",
  },
  swatchRound: { fontSize: "11px", color: "var(--muted)", width: "22px", flexShrink: 0 },
  swatchPair: { display: "flex", alignItems: "center", gap: "8px", flex: 1 },
  swatchItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  swatch: {
    width: "clamp(44px, 10vw, 60px)",
    height: "clamp(44px, 10vw, 60px)",
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
  },
  swatchLabel: { fontSize: "9px", color: "var(--muted)", letterSpacing: "0.06em" },
  swatchArrow: { fontSize: "14px", color: "var(--muted)", flexShrink: 0 },
  swatchScore: { fontSize: "16px", fontWeight: 700, minWidth: "32px", textAlign: "right", flexShrink: 0 },

  actions: { display: "flex", gap: "12px" },
  replayBtn: {
    flex: 1, padding: "16px", background: "var(--accent)", color: "#0a0a0f",
    borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: 700,
    border: "none", cursor: "pointer",
  },
  homeBtn: {
    flex: 1, padding: "16px", background: "var(--surface)", color: "var(--text)",
    borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: 600,
    border: "1px solid var(--border)", cursor: "pointer",
  },
};
