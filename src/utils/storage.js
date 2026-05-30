const KEYS = {
  BEST_SCORE: "colordrift_best_score",
  HISTORY: "colordrift_history",
  STREAK: "colordrift_streak",
};

// Save a completed game result
export function saveResult({ score, rounds, difficulty }) {
  const entry = {
    score,
    rounds,
    difficulty,
    date: new Date().toISOString(),
  };

  // Update best score
  const prev = getBestScore();
  if (score > prev) {
    localStorage.setItem(KEYS.BEST_SCORE, score);
  }

  // Append to history (keep last 20)
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 20)));

  return entry;
}

export function getBestScore() {
  return parseInt(localStorage.getItem(KEYS.BEST_SCORE) || "0", 10);
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.HISTORY) || "[]");
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(KEYS.BEST_SCORE);
  localStorage.removeItem(KEYS.HISTORY);
  localStorage.removeItem(KEYS.STREAK);
}
