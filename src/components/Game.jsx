import { useState, useEffect, useRef, useCallback } from "react";
import {
  randomColor,
  hslToString,
  generateDistractors,
  shuffle,
  calcScore,
} from "../utils/colorUtils";

const SHOW_DURATION = 3000;
const DISTRACTOR_COUNT = 5;
const PICK_TIMER = { 3: null, 4: 5000, 5: 3000 };
const BLOB_CONFIG = {
  3: { count: 0 },
  4: { count: 5,  size: [60, 100], speed: [6, 10], opacity: 0.55 },
  5: { count: 12, size: [50, 130], speed: [3, 7],  opacity: 0.75 },
};

const FEEDBACK = [
  { min: 95, lines: ["PERFECT.", "Your eyes are calibrated."], color: "#4dffb4" },
  { min: 85, lines: ["SHARP.", "Almost pixel-perfect."], color: "#4dffb4" },
  { min: 70, lines: ["NICE EYE.", "You've got the gift."], color: "var(--accent)" },
  { min: 55, lines: ["CLOSE.", "Brain's warming up."], color: "var(--accent)" },
  { min: 40, lines: ["MEH.", "Colors are hard."], color: "#ffb84d" },
  { min: 20, lines: ["OOF.", "That was rough."], color: "#ff7c5c" },
  { min: 0,  lines: ["YIKES.", "Did you even look?"], color: "var(--danger)" },
];

const TIMESUP_LINES = ["TOO SLOW.", "Blink and you lose."];

function getFeedback(score) {
  return FEEDBACK.find((f) => score >= f.min);
}

function generateBlobs(target, count, config) {
  return Array.from({ length: count }, (_, i) => {
    const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
    const distractors = generateDistractors(target, 1, 3);
    return {
      id: i,
      color: hslToString(distractors[0]),
      size,
      x: Math.random() * 90,
      y: Math.random() * 90,
      duration: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
      delay: Math.random() * -10,
    };
  });
}

function FloatingBlobs({ target, difficulty }) {
  const config = BLOB_CONFIG[difficulty];
  if (!config || config.count === 0) return null;
  const [blobs] = useState(() => generateBlobs(target, config.count, config));
  return (
    <div style={blobStyles.container}>
      {blobs.map((blob) => (
        <div key={blob.id} style={{
          ...blobStyles.blob,
          width: blob.size,
          height: blob.size,
          background: blob.color,
          left: `${blob.x}%`,
          top: `${blob.y}%`,
          opacity: config.opacity,
          animationDuration: `${blob.duration}s`,
          animationDelay: `${blob.delay}s`,
        }} />
      ))}
    </div>
  );
}

const blobStyles = {
  container: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" },
  blob: {
    position: "absolute", borderRadius: "50%", filter: "blur(18px)",
    animation: "floatBlob linear infinite", transform: "translate(-50%, -50%)",
  },
};

export default function Game({ difficulty, rounds, onFinish }) {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("memorize");
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roundScore, setRoundScore] = useState(null);
  const [scores, setScores] = useState([]);
  const [roundHistory, setRoundHistory] = useState([]); // {target, selected, score}
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(SHOW_DURATION);
  const [pickTimeLeft, setPickTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pickDuration = PICK_TIMER[difficulty];

  const setupRound = useCallback(() => {
    const color = randomColor();
    const distractors = generateDistractors(color, DISTRACTOR_COUNT, difficulty);
    const allOptions = shuffle([color, ...distractors]);
    setTarget(color);
    setOptions(allOptions);
    setSelected(null);
    setRoundScore(null);
    setPhase("memorize");
    setMemorizeTimeLeft(SHOW_DURATION);
    setPickTimeLeft(pickDuration);
  }, [difficulty, pickDuration]);

  useEffect(() => { setupRound(); }, []);

  useEffect(() => {
    if (phase !== "memorize") return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, SHOW_DURATION - elapsed);
      setMemorizeTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        setPhase("pick");
        setPickTimeLeft(pickDuration);
        startTimeRef.current = Date.now();
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [phase, pickDuration]);

  useEffect(() => {
    if (phase !== "pick" || !pickDuration) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, pickDuration - elapsed);
      setPickTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        handleTimesUp();
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function handleTimesUp() {
    const result = { score: 0, deltaE: 99 };
    setRoundScore(result);
    setScores((prev) => [...prev, 0]);
    setRoundHistory((prev) => [...prev, { target, selected: null, score: 0 }]);
    setPhase("feedback");
  }

  function handlePick(color) {
    if (phase !== "pick" || selected) return;
    clearInterval(timerRef.current);
    setSelected(color);
    const result = calcScore(target, color);
    setRoundScore(result);
    setScores((prev) => [...prev, result.score]);
    setRoundHistory((prev) => [...prev, { target, selected: color, score: result.score }]);
    setPhase("feedback");
  }

  function handleNext() {
    if (round >= rounds) {
      const allScores = [...scores];
      const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      onFinish({ score: avg, rounds, difficulty, roundScores: allScores, roundHistory });
    } else {
      setRound((r) => r + 1);
      setupRound();
    }
  }

  if (!target) return null;

  const memPct = (memorizeTimeLeft / SHOW_DURATION) * 100;
  const pickPct = pickDuration ? (pickTimeLeft / pickDuration) * 100 : 100;
  const pickTimerColor = pickPct > 60 ? "var(--accent)" : pickPct > 30 ? "#ffb84d" : "var(--danger)";
  const fb = roundScore ? getFeedback(roundScore.score) : null;

  return (
    <div style={styles.wrapper}>
      {phase === "pick" && <FloatingBlobs target={target} difficulty={difficulty} />}

      <style>{`
        @keyframes floatBlob {
          0%   { transform: translate(-50%, -50%) scale(1); }
          33%  { transform: translate(calc(-50% + 40px), calc(-50% - 30px)) scale(1.1); }
          66%  { transform: translate(calc(-50% - 30px), calc(-50% + 20px)) scale(0.95); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes punchIn {
          0%   { opacity: 0; transform: scale(1.4); }
          60%  { opacity: 1; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .option-btn:hover {
          transform: scale(1.07) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.55) !important;
          border-color: rgba(255,255,255,0.35) !important;
        }
      `}</style>

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.roundInfo} className="mono">
          <span style={{ color: "var(--muted)" }}>ROUND</span>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>{round}/{rounds}</span>
        </div>
        {scores.length > 0 && (
          <div style={styles.avgBadge} className="mono">
            AVG&nbsp;<span style={{ color: "var(--accent)" }}>
              {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}
            </span>
          </div>
        )}
        <button style={styles.quitBtn} onClick={() => onFinish(null)} className="mono">QUIT</button>
      </div>

      <div style={styles.content}>

        {/* MEMORIZE */}
        {phase === "memorize" && (
          <div style={styles.memorizeWrap} className="scale-in">
            <p style={styles.phaseLabel} className="mono">MEMORIZE THIS COLOR</p>
            <div style={{ ...styles.colorSwatch, background: hslToString(target) }} />
            <div style={styles.timerTrack}>
              <div style={{
                ...styles.timerBar,
                width: `${memPct}%`,
                background: memPct > 60 ? "var(--accent)" : memPct > 30 ? "#ffb84d" : "var(--danger)",
              }} />
            </div>
            <p style={styles.timerLabel} className="mono">{(memorizeTimeLeft / 1000).toFixed(1)}s</p>
          </div>
        )}

        {/* PICK */}
        {phase === "pick" && (
          <div style={styles.pickWrap} className="fade-in">
            <div style={styles.pickHeader}>
              <p style={styles.phaseLabel} className="mono">WHICH ONE WAS IT?</p>
              {pickDuration && (
                <div style={styles.pickTimerWrap}>
                  <div style={styles.pickTimerTrack}>
                    <div style={{
                      ...styles.pickTimerBar,
                      width: `${pickPct}%`,
                      background: pickTimerColor,
                    }} />
                  </div>
                  <span style={{ ...styles.pickTimerNum, color: pickTimerColor }} className="mono">
                    {(pickTimeLeft / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
            <div style={styles.optionsGrid}>
              {options.map((color, i) => (
                <button
                  key={i}
                  className="option-btn"
                  style={{ ...styles.optionBtn, background: hslToString(color) }}
                  onClick={() => handlePick(color)}
                  aria-label={`Color option ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACK */}
        {phase === "feedback" && fb && (
          <div style={styles.feedbackWrap} className="fade-in">

            {/* Punch-in comment */}
            <div style={styles.punchWrap}>
              <div style={{ ...styles.punchLine, color: selected ? fb.color : "var(--danger)", animation: "punchIn 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
                {selected ? fb.lines[0] : TIMESUP_LINES[0]}
              </div>
              <div style={{ ...styles.punchSub, animation: "slideUp 0.4s 0.15s ease both" }}>
                {selected ? fb.lines[1] : TIMESUP_LINES[1]}
              </div>
            </div>

            {/* Color compare */}
            <div style={styles.compareRow}>
              <div style={styles.compareItem}>
                <div style={{ ...styles.compareSwatch, background: hslToString(target) }} />
                <span style={styles.compareLabel} className="mono">ORIGINAL</span>
              </div>
              <div style={styles.compareVs} className="mono">vs</div>
              <div style={styles.compareItem}>
                {selected ? (
                  <div style={{
                    ...styles.compareSwatch,
                    background: hslToString(selected),
                    outline: `3px solid ${roundScore.score >= 80 ? "var(--success)" : roundScore.score >= 50 ? "#ffb84d" : "var(--danger)"}`,
                    outlineOffset: "3px",
                  }} />
                ) : (
                  <div style={{ ...styles.compareSwatch, background: "var(--surface2)", border: "2px dashed var(--danger)" }} />
                )}
                <span style={styles.compareLabel} className="mono">{selected ? "YOUR PICK" : "TIME'S UP"}</span>
              </div>
            </div>

            {/* Score row */}
            <div style={styles.scoreCard}>
              <div style={styles.scoreMain}>
                <span style={{
                  ...styles.scoreNum,
                  color: selected ? fb.color : "var(--danger)",
                }}>{roundScore.score}</span>
                <span style={styles.scoreMax} className="mono">/100</span>
              </div>
              <div style={styles.deltaRow} className="mono">
                <span style={{ color: "var(--muted)" }}>Color difference (ΔE)</span>
                <span style={{ color: "var(--text)" }}>{roundScore.deltaE}</span>
              </div>
            </div>

            <button style={styles.nextBtn} onClick={handleNext}>
              {round >= rounds ? "See Final Score →" : `Round ${round + 1} →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    padding: "clamp(16px, 3vw, 40px)", maxWidth: "600px", margin: "0 auto",
    position: "relative", zIndex: 1,
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "clamp(24px, 4vw, 48px)", gap: "12px",
  },
  roundInfo: { display: "flex", gap: "8px", fontSize: "13px", letterSpacing: "0.08em" },
  avgBadge: {
    fontSize: "12px", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "99px", padding: "4px 12px", letterSpacing: "0.06em", color: "var(--muted)",
  },
  quitBtn: {
    background: "transparent", border: "1px solid var(--border)", borderRadius: "99px",
    padding: "4px 12px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--muted)", cursor: "pointer",
  },
  content: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  memorizeWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" },
  phaseLabel: { fontSize: "11px", letterSpacing: "0.12em", color: "var(--muted)" },
  colorSwatch: {
    width: "min(340px, 75vw)", height: "min(340px, 75vw)",
    borderRadius: "var(--radius-lg)", boxShadow: "0 0 80px rgba(0,0,0,0.6)",
  },
  timerTrack: { width: "min(340px, 75vw)", height: "4px", background: "var(--surface2)", borderRadius: "99px", overflow: "hidden" },
  timerBar: { height: "100%", borderRadius: "99px", transition: "width 0.05s linear, background 0.3s ease" },
  timerLabel: { fontSize: "13px", color: "var(--muted)", letterSpacing: "0.06em" },
  pickWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", width: "100%", position: "relative", zIndex: 2 },
  pickHeader: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" },
  pickTimerWrap: { display: "flex", alignItems: "center", gap: "12px", width: "min(400px, 90vw)" },
  pickTimerTrack: { flex: 1, height: "6px", background: "var(--surface2)", borderRadius: "99px", overflow: "hidden" },
  pickTimerBar: { height: "100%", borderRadius: "99px", transition: "width 0.05s linear, background 0.3s ease" },
  pickTimerNum: { fontSize: "14px", fontWeight: 600, minWidth: "36px", textAlign: "right" },
  optionsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "clamp(8px, 2vw, 16px)", width: "min(420px, 90vw)",
  },
  optionBtn: {
    aspectRatio: "1", borderRadius: "var(--radius-md)", border: "2px solid transparent",
    cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  feedbackWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%" },
  punchWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" },
  punchLine: {
    fontSize: "clamp(42px, 10vw, 64px)", fontWeight: 800,
    letterSpacing: "-0.03em", lineHeight: 1,
  },
  punchSub: { fontSize: "clamp(14px, 2.5vw, 17px)", color: "var(--muted)", fontWeight: 400 },
  compareRow: { display: "flex", gap: "clamp(12px, 3vw, 24px)", justifyContent: "center", alignItems: "center" },
  compareVs: { fontSize: "12px", color: "var(--muted)", letterSpacing: "0.1em" },
  compareItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  compareSwatch: {
    width: "clamp(90px, 18vw, 130px)", height: "clamp(90px, 18vw, 130px)",
    borderRadius: "var(--radius-md)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
  },
  compareLabel: { fontSize: "10px", letterSpacing: "0.1em", color: "var(--muted)" },
  scoreCard: {
    width: "100%", maxWidth: "420px", background: "var(--surface)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
    padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px",
  },
  scoreMain: { display: "flex", alignItems: "baseline", gap: "6px" },
  scoreNum: { fontSize: "clamp(44px, 9vw, 60px)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" },
  scoreMax: { fontSize: "18px", color: "var(--muted)" },
  deltaRow: {
    display: "flex", justifyContent: "space-between", fontSize: "13px",
    padding: "10px 0", borderTop: "1px solid var(--border)",
  },
  nextBtn: {
    width: "100%", maxWidth: "420px", padding: "16px", background: "var(--accent)",
    color: "#0a0a0f", borderRadius: "var(--radius-md)", fontSize: "16px",
    fontWeight: 700, border: "none", cursor: "pointer",
  },
};
