import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { saveScore } from "../services/api";
import { fetchQuestion } from "../services/bananaApi";
import { logEvent } from "../utils/logger";
import { playClick, playCorrect, playIncorrect, playFanfare } from "../utils/sound";
import Confetti from "../components/Confetti.jsx";

const TOTAL_QUESTIONS = 10;
const DIGIT_KEYS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SPEED_RUN_SECONDS = 20;

function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questionNumber, setQuestionNumber] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Speed run mode
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SPEED_RUN_SECONDS);

  useEffect(() => {
    if (finished) return undefined;

    const controller = new AbortController();
    fetchQuestion(controller.signal)
      .then((nextQuestion) => {
        setQuestion(nextQuestion);
        setLoading(false);
        setError("");
        setTimeLeft(SPEED_RUN_SECONDS);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        logEvent("QUESTION_LOAD_FAILED", { message: requestError.message });
        setLoading(false);
        setError("Couldn't load banana puzzle. Please check your internet connection and try again.");
      });

    return () => controller.abort();
  }, [questionNumber, retryCount, finished]);

  // Speed run countdown timer
  useEffect(() => {
    if (!timerEnabled || loading || submitted || finished || !question) return;

    if (timeLeft <= 0) {
      setSubmitted(true);
      setIsCorrect(false);
      setStreak(0);
      setFeedback(`⏰ Time ran out! The correct solution was ${question.solution}.`);
      playIncorrect();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timerEnabled, timeLeft, loading, submitted, finished, question]);

  // Event-Driven Programming: Answer verification with audio feedback & streaks
  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    if (!question || submitted || answer === "") return;

    const correct = Number(answer) === question.solution;
    setIsCorrect(correct);
    if (correct) {
      setScore((currentScore) => currentScore + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setMaxStreak((max) => Math.max(max, next));
        const streakBonus = next >= 3 ? ` 🔥 ${next}x Combo Streak!` : "";
        setFeedback(`🎉 Brilliant! That is the correct answer!${streakBonus}`);
        return next;
      });
      playCorrect();
    } else {
      setStreak(0);
      setFeedback(`🍌 Not quite! The correct solution was ${question.solution}.`);
      playIncorrect();
    }

    setSubmitted(true);
    logEvent("ANSWER_SUBMITTED", {
      question: questionNumber + 1,
      userAnswer: Number(answer),
      solution: question.solution,
      correct,
      speedRun: timerEnabled,
      secondsLeft: timeLeft,
      streak: correct ? streak + 1 : 0,
    });
  };

  const handleNext = async () => {
    if (questionNumber < TOTAL_QUESTIONS - 1) {
      setQuestion(null);
      setAnswer("");
      setFeedback("");
      setSubmitted(false);
      setIsCorrect(false);
      setLoading(true);
      setImageLoaded(false);
      setTimeLeft(SPEED_RUN_SECONDS);
      setQuestionNumber((currentNumber) => currentNumber + 1);
      return;
    }

    // Quiz completed
    setFinished(true);
    setSaving(true);
    setSaveError("");
    if (score >= 7) {
      playFanfare();
    }
    logEvent("QUIZ_COMPLETED", { finalScore: score, total: TOTAL_QUESTIONS, maxStreak });

    try {
      await saveScore(user?.username, score);
      setSaveSuccess(true);
    } catch (saveRequestError) {
      logEvent("SCORE_SAVE_FAILED", { message: saveRequestError.message });
      setSaveError("Couldn't sync your high score right now. Don't worry, your play count is preserved!");
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRetryCount((currentCount) => currentCount + 1);
  };

  const handleRestart = () => {
    setQuestionNumber(0);
    setQuestion(null);
    setAnswer("");
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback("");
    setLoading(true);
    setImageLoaded(false);
    setError("");
    setSubmitted(false);
    setIsCorrect(false);
    setFinished(false);
    setSaveSuccess(false);
    setSaveError("");
    setTimeLeft(SPEED_RUN_SECONDS);
  };

  const handleDigitSelect = (digit) => {
    if (submitted) return;
    playClick();
    setAnswer(String(digit));
  };

  // Keyboard shortcut listener for digits 0-9
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (finished || loading || submitted) return;
      if (e.key >= "0" && e.key <= "9") {
        playClick();
        setAnswer(e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finished, loading, submitted]);

  // Results rating helper
  const getRating = () => {
    if (score === 10) return { title: "🍌 Grand Banana Master!", subtitle: "Flawless victory! You are an absolute math genius!" };
    if (score >= 8) return { title: "🐒 Clever Monkey!", subtitle: "Incredible puzzle solving! Top-tier score!" };
    if (score >= 5) return { title: "🌴 Jungle Adventurer!", subtitle: "Good effort! A little more practice and you'll ace it!" };
    return { title: "🌱 Banana Sprout!", subtitle: "Every master started somewhere. Try again and level up!" };
  };

  return (
    <section className="quiz-container">
      {finished && score >= 7 && <Confetti />}

      {finished ? (
        <div className="quiz-card quiz-results-card" aria-live="polite">
          <div className="results-trophy-badge">
            <span className="trophy-emoji">🏆</span>
          </div>
          <h2>{getRating().title}</h2>
          <p className="results-subtitle">{getRating().subtitle}</p>

          <div className="results-stats-grid stats-grid-four">
            <div className="stat-box">
              <span className="stat-label">Correct</span>
              <span className="stat-value text-accent">{score}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Puzzles</span>
              <span className="stat-value">{TOTAL_QUESTIONS}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value text-success">
                {Math.round((score / TOTAL_QUESTIONS) * 100)}%
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Max Streak</span>
              <span className="stat-value text-accent">🔥 {maxStreak}</span>
            </div>
          </div>

          <div className="save-status-banner">
            {saving && (
              <p className="saving-text">
                <span className="spinner-inline"></span> Saving your score to leaderboard...
              </p>
            )}
            {saveSuccess && (
              <p className="save-success-text">
                ✅ Score saved to MongoDB leaderboard!
              </p>
            )}
            {saveError && <p className="alert-box alert-error">{saveError}</p>}
          </div>

          <div className="results-actions">
            <button type="button" className="btn-primary" onClick={handleRestart}>
              🔄 Play Again
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/scoreboard")}
            >
              🏆 View Leaderboard
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-card">
          {/* Header & Status */}
          <div className="quiz-header">
            <div className="quiz-header-left">
              <div className="quiz-badge puzzle-step-badge">
                <span>Puzzle {questionNumber + 1} of {TOTAL_QUESTIONS}</span>
              </div>
              <button
                type="button"
                className={`btn-timer-toggle ${timerEnabled ? "active" : ""}`}
                onClick={() => setTimerEnabled(!timerEnabled)}
                title={timerEnabled ? "Disable Speed Run" : "Enable 20s Speed Run"}
              >
                ⏱️ Speed Run: {timerEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div className="quiz-header-right">
              {streak >= 2 && (
                <div className="quiz-streak-pill" title={`${streak} in a row!`}>
                  <span>🔥 {streak}x Streak</span>
                </div>
              )}
              {timerEnabled && !submitted && !loading && (
                <div className={`quiz-timer-pill ${timeLeft <= 5 ? "timer-urgent" : ""}`}>
                  <span>⏱️ {timeLeft}s</span>
                </div>
              )}
              <div className="quiz-badge quiz-score-badge">
                <span className="badge-icon">⭐</span>
                <span>Score: <strong>{score}</strong></span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="quiz-progress-track"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={TOTAL_QUESTIONS}
            aria-valuenow={questionNumber + 1}
          >
            <div
              className="quiz-progress-fill"
              style={{
                width: `${((questionNumber + 1) / TOTAL_QUESTIONS) * 100}%`,
              }}
            />
          </div>

          {/* Loading Puzzle */}
          {loading && (
            <div className="puzzle-loading-state" role="status">
              <div className="spinner"></div>
              <p>Fetching puzzle from Banana API...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="quiz-error-state" role="alert">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button type="button" className="btn-primary" onClick={handleRetry}>
                Try Again 🔄
              </button>
            </div>
          )}

          {/* Main Puzzle Card */}
          {question && !loading && (
            <div className="puzzle-content">
              <div className="puzzle-image-wrapper">
                {!imageLoaded && (
                  <div className="image-skeleton">
                    <div className="spinner"></div>
                    <span>Rendering puzzle...</span>
                  </div>
                )}
                <img
                  className={`quiz-puzzle-img ${imageLoaded ? "loaded" : "hidden"}`}
                  src={question.imageUrl}
                  alt="Banana puzzle image. Count bananas and find the missing value."
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              <p className="puzzle-instruction">
                Count the bananas, calculate the equation, and find the missing digit <strong>(0–9)</strong>.
              </p>

              {/* Input Form & Interactive Keypad */}
              <form onSubmit={handleSubmit} className="quiz-answer-form">
                <div className="answer-input-row">
                  <label htmlFor="quiz-answer" className="visually-hidden">
                    Your Answer
                  </label>
                  <input
                    id="quiz-answer"
                    type="number"
                    min="0"
                    max="9"
                    step="1"
                    placeholder="?"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={submitted}
                    className="answer-input"
                    required
                  />
                  {!submitted ? (
                    <button
                      type="submit"
                      className="btn-submit-answer"
                      disabled={answer === ""}
                    >
                      Check Answer ✨
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-next-question"
                      onClick={handleNext}
                      autoFocus
                    >
                      {questionNumber === TOTAL_QUESTIONS - 1 ? "Finish Quiz 🏁" : "Next Puzzle ➡️"}
                    </button>
                  )}
                </div>

                {/* Mobile-Friendly Digit Keypad (0-9) */}
                <div className="keypad-container" aria-label="Digit Selection Keypad">
                  <span className="keypad-title">Tap or click a number:</span>
                  <div className="keypad-grid">
                    {DIGIT_KEYS.map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        className={`keypad-btn ${Number(answer) === digit && answer !== "" ? "selected" : ""}`}
                        onClick={() => handleDigitSelect(digit)}
                        disabled={submitted}
                        aria-label={`Select digit ${digit}`}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`feedback-banner ${isCorrect ? "feedback-correct" : "feedback-incorrect"}`}
                  role="status"
                  aria-live="polite"
                >
                  <span className="feedback-icon">{isCorrect ? "🎉" : "💡"}</span>
                  <span className="feedback-text">{feedback}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Quiz;
