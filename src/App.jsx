import { useState } from "react";
import Home from "./components/Home";
import Game from "./components/Game";
import Results from "./components/Results";
import { saveResult } from "./utils/storage";

const SCREEN = { HOME: "home", GAME: "game", RESULTS: "results" };

export default function App() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [gameConfig, setGameConfig] = useState({ difficulty: 3, rounds: 5 });
  const [gameResult, setGameResult] = useState(null);

  function handleStart(config) {
    setGameConfig(config);
    setScreen(SCREEN.GAME);
  }

  function handleFinish(result) {
    if (result) {
      saveResult(result);
      setGameResult(result);
      setScreen(SCREEN.RESULTS);
    } else {
      setScreen(SCREEN.HOME);
    }
  }

  function handleReplay() {
    setGameResult(null);
    setScreen(SCREEN.GAME);
  }

  function handleHome() {
    setGameResult(null);
    setScreen(SCREEN.HOME);
  }

  return (
    <>
      {screen === SCREEN.HOME && <Home onStart={handleStart} />}

      {screen === SCREEN.GAME && (
        <Game
          key={Date.now()}
          difficulty={gameConfig.difficulty}
          rounds={gameConfig.rounds}
          onFinish={handleFinish}
        />
      )}

      {screen === SCREEN.RESULTS && gameResult && (
        <Results
          score={gameResult.score}
          rounds={gameResult.rounds}
          difficulty={gameResult.difficulty}
          roundScores={gameResult.roundScores}
          roundHistory={gameResult.roundHistory}
          onReplay={handleReplay}
          onHome={handleHome}
        />
      )}
    </>
  );
}
