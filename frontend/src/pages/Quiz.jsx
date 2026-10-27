import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { saveScore } from "../services/api";
import { fetchQuestion } from "../services/bananaApi";
import { logEvent } from "../utils/logger";

const TOTAL_QUESTIONS = 10;

function Quiz() {
  const { user } = useAuth();
  const [questionNumber, setQuestionNumber] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (finished) return undefined;

    const controller = new AbortController();
    fetchQuestion(controller.signal)
      .then((nextQuestion) => {
        setQuestion(nextQuestion);
        setLoading(false);
        setError("");
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        logEvent("QUESTION_LOAD_FAILED", { message: requestError.message });
        setLoading(false);
        setError(
          "Couldn't load a banana puzzle. Check your connection and try again.",
        );
      });

    return () => controller.abort();
  }, [questionNumber, retryCount, finished]);
  //Event-Driven Programming
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!question || submitted || answer === "") return;

    const correct = Number(answer) === question.solution;
    if (correct) setScore((currentScore) => currentScore + 1);
    setSubmitted(true);
    setFeedback(
      correct
        ? "Correct! Great job."
        : `Not quite. The answer was ${question.solution}.`,
    );
    logEvent("ANSWER_SUBMITTED", {
      question: questionNumber + 1,
      correct,
    });
  };

  const handleNext = async () => {
    if (questionNumber < TOTAL_QUESTIONS - 1) {
      setQuestion(null);
      setAnswer("");
      setFeedback("");
      setSubmitted(false);
      setLoading(true);
      setQuestionNumber((currentNumber) => currentNumber + 1);
      return;
    }

    setFinished(true);
    setSaving(true);
    logEvent("QUIZ_COMPLETED", { score });
    try {
      await saveScore(user.username, score);
    } catch (saveRequestError) {
      logEvent("SCORE_SAVE_FAILED", { message: saveRequestError.message });
      setSaveError("Your score couldn't be saved. You can still play again.");
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
    setFeedback("");
    setLoading(true);
    setError("");
    setSubmitted(false);
    setFinished(false);
    setSaveError("");
  };

  return (
    <section className="quiz-page">
      <h1> Banana Puzzle Quiz</h1>
      <p className="quiz-welcome">Welcome, {user?.username}!</p>

      {finished ? (
        <div className="quiz-results" aria-live="polite">
          <h2>Quiz complete!</h2>
          <p className="quiz-final-score">
            You solved {score} out of {TOTAL_QUESTIONS} puzzles.
          </p>
          {saving && <p>Saving your score...</p>}
          {saveError && <p className="error">{saveError}</p>}

          <button type="button" onClick={handleRestart}>
            Play again
          </button>
        </div>
      ) : (
        <>
          <div className="quiz-progress">
            <span>
              Puzzle {questionNumber + 1} of {TOTAL_QUESTIONS}
            </span>
            <span>Score: {score}</span>
          </div>
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

          {loading && <p role="status">Loading banana puzzle...</p>}

          {error && (
            <div className="quiz-load-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}

          {question && !loading && (
            <>
              <img
                className="quiz-puzzle"
                src={question.imageUrl}
                alt="Banana puzzle. Count the question marks to solve it."
              />
              <p className="quiz-instructions">
                Work out the missing number in the banana puzzle.
              </p>
              <form onSubmit={handleSubmit}>
                <label htmlFor="quiz-answer">Your answer (0–9)</label>
                <div className="quiz-answer-row">
                  <input
                    id="quiz-answer"
                    type="number"
                    min="0"
                    max="9"
                    step="1"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    disabled={submitted}
                    required
                  />
                  {!submitted ? (
                    <button type="submit" disabled={answer === ""}>
                      Check answer
                    </button>
                  ) : (
                    <button type="button" onClick={handleNext}>
                      {questionNumber === TOTAL_QUESTIONS - 1
                        ? "Finish quiz"
                        : "Next puzzle"}
                    </button>
                  )}
                </div>
              </form>

              {feedback && (
                <p
                  className={`quiz-feedback${Number(answer) === question.solution ? " correct" : ""}`}
                  aria-live="polite"
                >
                  {feedback}
                </p>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default Quiz;
