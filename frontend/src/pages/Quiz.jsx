import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { saveScore } from "../services/api";
import { fetchQuestion } from "../services/bananaApi";
import { logEvent } from "../utils/logger";
import { playClick, playCorrect, playIncorrect, playFanfare } from "../utils/sound";
import Confetti from "../components/Confetti.jsx";
import {
  TrophyIcon,
  TimerIcon,
  FlameIcon,
  RotateCcwIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  TargetIcon,
} from "../components/Icons.jsx";

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
        setError("Unable to load puzzle. Please check your connection and retry.");
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
      setFeedback(`Time expired. The correct solution was ${question.solution}.`);
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
        const streakBonus = next >= 3 ? ` (${next} in a row)` : "";
        setFeedback(`Correct solution verified${streakBonus}.`);
        return next;
      });
      playCorrect();
    } else {
      setStreak(0);
      setFeedback(`Incorrect. The expected solution was ${question.solution}.`);
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
      setSaveError("Score saved locally, but database synchronization was delayed.");
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
    if (score === 10) {
      return {
        tier: "Master Tier",
        title: "Perfect Evaluation (10/10)",
        subtitle: "Flawless score across all visual equations. Exceptional mathematical accuracy.",
      };
    }
    if (score >= 8) {
      return {
        tier: "Advanced Tier",
        title: "High Proficiency",
        subtitle: "Strong analytical capability with top-decile puzzle performance.",
      };
    }
    if (score >= 5) {
      return {
        tier: "Intermediate Tier",
        title: "Competent Performance",
        subtitle: "Solid problem-solving foundation. Continue practice to advance to the Master tier.",
      };
    }
    return {
      tier: "Foundational Tier",
      title: "Assessment Complete",
      subtitle: "Foundational performance. Review equations and complete another session to improve.",
    };
  };

  return (
    <section className="quiz-container">
      {finished && score >= 7 && <Confetti />}

      {finished ? (
        <div className="quiz-card quiz-results-card" aria-live="polite">
          <div className="results-trophy-badge">
            <TrophyIcon size={28} className="trophy-icon-svg" />
          </div>
          <span className="results-tier-pill">{getRating().tier}</span>
          <h2>{getRating().title}</h2>
          <p className="results-subtitle">{getRating().subtitle}</p>

          <div className="results-stats-grid stats-grid-four">
            <div className="stat-box">
              <span className="stat-label">Score</span>
              <span className="stat-value text-accent">{score} / {TOTAL_QUESTIONS}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Evaluated</span>
              <span className="stat-value">{TOTAL_QUESTIONS}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Accuracy Rate</span>
              <span className="stat-value text-success">
                {Math.round((score / TOTAL_QUESTIONS) * 100)}%
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Max Streak</span>
              <span className="stat-value text-accent">{maxStreak}</span>
            </div>
          </div>

          <div className="save-status-banner">
            {saving && (
              <p className="saving-text">
                <span className="spinner-inline"></span> Synchronizing record with leaderboard...
              </p>
            )}
            {saveSuccess && (
              <p className="save-success-text">
                <CheckCircleIcon size={16} /> Record successfully synchronized to leaderboard.
              </p>
            )}
            {saveError && (
              <div className="alert-box alert-error">
                <AlertCircleIcon size={16} />
                <span>{saveError}</span>
              </div>
            )}
          </div>

          <div className="results-actions">
            <button type="button" className="btn-primary" onClick={handleRestart}>
              <RotateCcwIcon size={16} />
              <span>Start New Session</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/scoreboard")}
            >
              <TrophyIcon size={16} />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-card">
          {/* Header & Status */}
          <div className="quiz-header">
            <div className="quiz-header-left">
              <div className="quiz-badge puzzle-step-badge">
                <span>Problem {questionNumber + 1} of {TOTAL_QUESTIONS}</span>
              </div>
              <button
                type="button"
                className={`btn-timer-toggle ${timerEnabled ? "active" : ""}`}
                onClick={() => setTimerEnabled(!timerEnabled)}
                title={timerEnabled ? "Switch to standard mode" : "Enable 20-second speed run mode"}
              >
                <TimerIcon size={14} />
                <span>Speed Run: {timerEnabled ? "Active" : "Off"}</span>
              </button>
            </div>

            <div className="quiz-header-right">
              {streak >= 2 && (
                <div className="quiz-streak-pill" title={`${streak} consecutive correct answers`}>
                  <FlameIcon size={14} />
                  <span>{streak}x Streak</span>
                </div>
              )}
              {timerEnabled && !submitted && !loading && (
                <div className={`quiz-timer-pill ${timeLeft <= 5 ? "timer-urgent" : ""}`}>
                  <TimerIcon size={14} />
                  <span>{timeLeft}s</span>
                </div>
              )}
              <div className="quiz-badge quiz-score-badge">
                <TargetIcon size={14} />
                <span>Score: <strong>{score}</strong></span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="quiz-progress-track"
            role="progressbar"
            aria-label="Session progress"
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
              <p>Loading puzzle payload from API...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="quiz-error-state" role="alert">
              <AlertCircleIcon size={32} className="error-icon" />
              <p>{error}</p>
              <button type="button" className="btn-primary" onClick={handleRetry}>
                <RotateCcwIcon size={16} />
                <span>Retry Connection</span>
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
                    <span>Rendering visual equation...</span>
                  </div>
                )}
                <img
                  className={`quiz-puzzle-img ${imageLoaded ? "loaded" : "hidden"}`}
                  src={question.imageUrl}
                  alt="Mathematical puzzle equation. Calculate the symbols to find the unknown digit."
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              <div className="puzzle-instruction-bar">
                <p className="puzzle-instruction">
                  Calculate the visual equation and enter the missing integer solution <strong>(0–9)</strong>.
                </p>
              </div>

              {/* Input Form & Interactive Keypad */}
              <form onSubmit={handleSubmit} className="quiz-answer-form">
                <div className="answer-input-row">
                  <label htmlFor="quiz-answer" className="visually-hidden">
                    Your Solution
                  </label>
                  <input
                    id="quiz-answer"
                    type="number"
                    min="0"
                    max="9"
                    step="1"
                    placeholder="—"
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
                      <span>Submit Solution</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-next-question"
                      onClick={handleNext}
                      autoFocus
                    >
                      <span>
                        {questionNumber === TOTAL_QUESTIONS - 1 ? "View Results" : "Next Problem"}
                      </span>
                      <ArrowRightIcon size={16} />
                    </button>
                  )}
                </div>

                {/* Mobile-Friendly Digit Keypad (0-9) */}
                <div className="keypad-container" aria-label="Digit Input Keypad">
                  <div className="keypad-header">
                    <span className="keypad-title">Numeric Input</span>
                    <span className="keypad-shortcut-hint">Keys 0–9 active</span>
                  </div>
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
                  {isCorrect ? (
                    <CheckCircleIcon size={18} className="feedback-icon" />
                  ) : (
                    <AlertCircleIcon size={18} className="feedback-icon" />
                  )}
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
