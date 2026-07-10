import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineClock, HiOutlineArrowLeft, HiOutlineArrowRight,
  HiOutlineCheckCircle, HiOutlineFlag, HiOutlineXMark,
  HiOutlineExclamationTriangle, HiOutlineClipboardDocumentList,
  HiOutlineEye,
} from "react-icons/hi2";
import { SUBJECTS, QUESTION_BANK } from "../data/questions";
import { loadHistory, saveAttempt, formatDuration, formatDate } from "../data/examHistory";
import "./DemoExam.css";

const DURATION = 10 * 60; // 10 minutes, matches "10 min." on the source site

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function computeScore(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct += 1;
  });
  return { correct, total: questions.length };
}

export default function DemoExam() {
  // select | instructions | exam | result | history | review
  const [stage, setStage] = useState("select");
  const [subjectId, setSubjectId] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [history, setHistory] = useState([]);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const questions = useMemo(() => (subjectId ? QUESTION_BANK[subjectId] : []), [subjectId]);
  const subjectName = SUBJECTS.find((s) => s.id === subjectId)?.name;

  useEffect(() => {
    if (stage !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setShowTimeUp(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  useEffect(() => {
    if (stage === "exam") setVisited((v) => ({ ...v, [current]: true }));
  }, [current, stage]);

  function startExam() {
    setAnswers({});
    setMarked({});
    setVisited({ 0: true });
    setCurrent(0);
    setTimeLeft(DURATION);
    setStage("exam");
  }

  function selectOption(qIndex, optIndex) {
    setAnswers((a) => ({ ...a, [qIndex]: optIndex }));
  }

  function toggleMark() {
    setMarked((m) => ({ ...m, [current]: !m[current] }));
  }

  function goTo(i) {
    setCurrent(i);
  }

  function finalizeAndSave(finalTimeLeft) {
    const sc = computeScore(questions, answers);
    const attempt = {
      id: Date.now(),
      subjectId,
      subjectName,
      date: new Date().toISOString(),
      durationTakenSeconds: DURATION - finalTimeLeft,
      correct: sc.correct,
      total: sc.total,
      answers: { ...answers },
      questions,
    };
    saveAttempt(attempt);
    setLastAttempt(attempt);
    return attempt;
  }

  function submit() {
    clearInterval(timerRef.current);
    finalizeAndSave(timeLeft);
    setStage("result");
  }

  function confirmTimeUp() {
    finalizeAndSave(0);
    setShowTimeUp(false);
    setStage("result");
  }

  function requestExit() {
    if (stage === "exam" || stage === "instructions") {
      setShowExitConfirm(true);
    } else {
      navigate("/");
    }
  }

  function openHistory() {
    setHistory(loadHistory());
    setStage("history");
  }

  function openReview(attempt) {
    setReviewAttempt(attempt);
    setStage("review");
  }

  return (
    <div className="demoexam">
      <div className="demoexam__topbar">
        <Link to="/" className="demoexam__brand">
          <span className="demoexam__brand-e">e</span>XAM <span className="demoexam__brand-sep">/</span> Demo Assessment
        </Link>
        {stage === "exam" && (
          <motion.div
            className={"demoexam__timer" + (timeLeft <= 30 ? " demoexam__timer--danger" : "")}
            animate={timeLeft <= 30 ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.8, repeat: timeLeft <= 30 ? Infinity : 0 }}
          >
            <HiOutlineClock />
            {formatTime(timeLeft)}
          </motion.div>
        )}
        <button className="demoexam__exit" onClick={requestExit}><HiOutlineXMark /></button>
      </div>

      <AnimatePresence mode="wait">
        {stage === "select" && (
          <motion.div key="select" className="demoexam__stage" {...fade}>
            <SelectSubject
              subjectId={subjectId}
              onChange={setSubjectId}
              onNext={() => setStage("instructions")}
              onHistory={openHistory}
            />
          </motion.div>
        )}

        {stage === "instructions" && (
          <motion.div key="instructions" className="demoexam__stage" {...fade}>
            <Instructions
              subjectName={subjectName}
              onBack={() => setStage("select")}
              onStart={startExam}
            />
          </motion.div>
        )}

        {stage === "exam" && (
          <motion.div key="exam" className="demoexam__stage demoexam__stage--exam" {...fade}>
            <ExamRunner
              questions={questions}
              current={current}
              answers={answers}
              marked={marked}
              visited={visited}
              onSelect={selectOption}
              onToggleMark={toggleMark}
              onGoTo={goTo}
              onNext={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
              onPrev={() => setCurrent((c) => Math.max(c - 1, 0))}
              onSubmit={submit}
            />
          </motion.div>
        )}

        {stage === "result" && (
          <motion.div key="result" className="demoexam__stage" {...fade}>
            <Result
              attempt={lastAttempt}
              onRetake={() => setStage("select")}
              onHistory={openHistory}
            />
          </motion.div>
        )}

        {stage === "history" && (
          <motion.div key="history" className="demoexam__stage" {...fade}>
            <History
              history={history}
              onBack={() => setStage("select")}
              onReview={openReview}
            />
          </motion.div>
        )}

        {stage === "review" && (
          <motion.div key="review" className="demoexam__stage" {...fade}>
            <Review attempt={reviewAttempt} onBack={() => setStage("history")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Exit confirmation ---- */}
      <AnimatePresence>
        {showExitConfirm && (
          <Modal onClose={() => setShowExitConfirm(false)}>
            <div className="exammodal__icon exammodal__icon--warn"><HiOutlineExclamationTriangle /></div>
            <h3>Exit this assessment?</h3>
            <p>Your progress on this attempt will be lost and this session will not be saved to your exam history.</p>
            <div className="exammodal__actions">
              <button className="exammodal__ghost" onClick={() => setShowExitConfirm(false)}>Stay on assessment</button>
              <button className="exammodal__danger" onClick={() => navigate("/")}>Exit anyway</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ---- Time up notice ---- */}
      <AnimatePresence>
        {showTimeUp && (
          <Modal>
            <div className="exammodal__icon exammodal__icon--time"><HiOutlineClock /></div>
            <h3>Time's up</h3>
            <p>
              Your 10 minutes are over, so the assessment has been submitted automatically with
              your current answers. If something went wrong or you couldn't complete it in time,
              please contact admin at <strong>support@ex-am.com</strong>.
            </p>
            <div className="exammodal__actions">
              <button className="exammodal__primary" onClick={confirmTimeUp}>View Result</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.3 },
};

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="exammodal__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="exammodal"
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function SelectSubject({ subjectId, onChange, onNext, onHistory }) {
  return (
    <div className="container examselect">
      <div className="examselect__topline">
        <motion.div
          className="examselect__field"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <label>Subject Name</label>
          <div className="examselect__row">
            <select value={subjectId} onChange={(e) => onChange(e.target.value)}>
              <option value="">Select Subject Name</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <motion.button
              className="examselect__add"
              disabled={!subjectId}
              whileHover={subjectId ? { y: -2 } : {}}
              whileTap={subjectId ? { scale: 0.96 } : {}}
              onClick={onNext}
            >
              Add Subject
            </motion.button>
          </div>
        </motion.div>

        <motion.button
          className="examselect__history-btn"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onHistory}
        >
          <HiOutlineClipboardDocumentList /> Exam History
        </motion.button>
      </div>

      <div className="examselect__grid">
        <motion.div
          className="examselect__panel"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <h3>Demo Exam</h3>
          <table className="examselect__table">
            <tbody>
              <tr><td>1</td><td>Exam</td><td>Demo Exam</td></tr>
              <tr><td>2</td><td>Subject</td><td>{subjectId ? SUBJECTS.find((s) => s.id === subjectId).name : "—"}</td></tr>
              <tr><td>3</td><td>Duration</td><td><strong>10 min.</strong></td></tr>
              <tr><td>4</td><td>Next Re-take</td><td className="examselect__available">Available</td></tr>
              <tr><td>5</td><td>Passing Score</td><td>50.00 %</td></tr>
              <tr><td>6</td><td>No. of Questions</td><td>10</td></tr>
            </tbody>
          </table>
        </motion.div>

        <motion.div
          className="examselect__panel"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3>Terms and Conditions</h3>
          <ul className="examselect__terms">
            <li>To kindly do not refresh the exam page.</li>
            <li>Each question carries equal marks; there is no negative marking.</li>
            <li>Once submitted, the assessment cannot be reattempted until the retake window opens.</li>
          </ul>

          <h3 style={{ marginTop: 22 }}>Take Assessment</h3>
          {!subjectId ? (
            <div className="examselect__warning">First select subject to begin assessment.</div>
          ) : (
            <div className="examselect__ready">Ready — subject selected. Click below to review instructions.</div>
          )}
          <motion.button
            className="examselect__instructions"
            disabled={!subjectId}
            whileHover={subjectId ? { y: -2 } : {}}
            whileTap={subjectId ? { scale: 0.96 } : {}}
            onClick={onNext}
          >
            Read Instructions
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function Instructions({ subjectName, onBack, onStart }) {
  return (
    <div className="container instructions">
      <motion.div
        className="instructions__card"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <h2>Instructions — {subjectName}</h2>
        <ul>
          <li>This assessment contains <strong>10 questions</strong> and must be completed in <strong>10 minutes</strong>.</li>
          <li>Each question has exactly one correct answer.</li>
          <li>Use the question palette to jump between questions at any time.</li>
          <li>You can mark a question for review and return to it later.</li>
          <li>The assessment auto-submits when the timer reaches zero.</li>
          <li>Passing score is 50%.</li>
        </ul>
        <div className="instructions__actions">
          <button className="instructions__back" onClick={onBack}>
            <HiOutlineArrowLeft /> Back
          </button>
          <motion.button
            className="instructions__start"
            whileHover={{ y: -2, boxShadow: "0 12px 26px rgba(63,145,66,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
          >
            Start Assessment
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function ExamRunner({ questions, current, answers, marked, visited, onSelect, onToggleMark, onGoTo, onNext, onPrev, onSubmit }) {
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container examrunner">
      <div className="examrunner__main">
        <motion.div
          key={current}
          className="examcard"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="examcard__head">
            <span>Question {current + 1} of {questions.length}</span>
            <button className={"examcard__mark" + (marked[current] ? " examcard__mark--active" : "")} onClick={onToggleMark}>
              <HiOutlineFlag /> {marked[current] ? "Marked" : "Mark for review"}
            </button>
          </div>
          <h3 className="examcard__question">{q.q}</h3>
          <div className="examcard__options">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                className={"examcard__option" + (answers[current] === i ? " examcard__option--active" : "")}
                onClick={() => onSelect(current, i)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="examcard__option-letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </motion.button>
            ))}
          </div>

          <div className="examcard__nav">
            <button className="examcard__navbtn" disabled={current === 0} onClick={onPrev}>
              <HiOutlineArrowLeft /> Previous
            </button>
            {current === questions.length - 1 ? (
              <motion.button
                className="examcard__submit"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSubmit}
              >
                <HiOutlineCheckCircle /> Submit Assessment
              </motion.button>
            ) : (
              <button className="examcard__navbtn examcard__navbtn--primary" onClick={onNext}>
                Next <HiOutlineArrowRight />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <aside className="palette">
        <div className="palette__summary">
          <div><span className="palette__dot palette__dot--answered" /> Answered ({answeredCount})</div>
          <div><span className="palette__dot palette__dot--marked" /> Marked ({Object.values(marked).filter(Boolean).length})</div>
          <div><span className="palette__dot palette__dot--notvisited" /> Not visited</div>
        </div>
        <div className="palette__grid">
          {questions.map((_, i) => {
            let state = "notvisited";
            if (marked[i]) state = "marked";
            else if (answers[i] !== undefined) state = "answered";
            else if (visited[i]) state = "visited";
            return (
              <motion.button
                key={i}
                className={`palette__cell palette__cell--${state}` + (i === current ? " palette__cell--current" : "")}
                onClick={() => onGoTo(i)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                {i + 1}
              </motion.button>
            );
          })}
        </div>
        <motion.button
          className="palette__submit"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
        >
          Submit Assessment
        </motion.button>
      </aside>
    </div>
  );
}

function ScoreBreakdown({ questions, answers }) {
  return (
    <div className="result__breakdown">
      {questions.map((q, i) => {
        const isCorrect = answers[i] === q.answer;
        const attempted = answers[i] !== undefined;
        return (
          <div className={"result__row" + (isCorrect ? " result__row--correct" : attempted ? " result__row--wrong" : " result__row--skip")} key={i}>
            <span className="result__row-index">{i + 1}</span>
            <span className="result__row-q">{q.q}</span>
            <span className="result__row-status">
              {isCorrect ? "Correct" : attempted ? "Incorrect" : "Not attempted"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Result({ attempt, onRetake, onHistory }) {
  if (!attempt) return null;
  const percent = Math.round((attempt.correct / attempt.total) * 100);
  const passed = percent >= 50;

  return (
    <div className="container result">
      <motion.div
        className="result__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className={"result__ring" + (passed ? " result__ring--pass" : " result__ring--fail")}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <span>{percent}%</span>
        </motion.div>
        <h2>{passed ? "Assessment Passed" : "Assessment Not Passed"}</h2>
        <p className="result__meta">
          {attempt.subjectName} · {attempt.correct} / {attempt.total} correct · {formatDuration(attempt.durationTakenSeconds)} taken · Passing score 50%
        </p>

        <ScoreBreakdown questions={attempt.questions} answers={attempt.answers} />

        <div className="result__actions">
          <motion.button className="result__retake" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onRetake}>
            Retake Demo Exam
          </motion.button>
          <button className="result__history" onClick={onHistory}>
            <HiOutlineClipboardDocumentList /> Exam History
          </button>
          <Link to="/" className="result__home">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}

function History({ history, onBack, onReview }) {
  return (
    <div className="container examhistory">
      <motion.div
        className="examhistory__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="examhistory__head">
          <h2>Exam History</h2>
          <button className="examhistory__back" onClick={onBack}><HiOutlineArrowLeft /> Back</button>
        </div>

        {history.length === 0 ? (
          <div className="examhistory__empty">
            No attempts yet — finish a demo exam and it will show up here.
          </div>
        ) : (
          <div className="examhistory__tablewrap">
            <table className="examhistory__table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Date &amp; Time</th>
                  <th>Duration</th>
                  <th>Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((a, i) => {
                  const percent = Math.round((a.correct / a.total) * 100);
                  const passed = percent >= 50;
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <td className="examhistory__subject">{a.subjectName}</td>
                      <td>{formatDate(a.date)}</td>
                      <td>{formatDuration(a.durationTakenSeconds)}</td>
                      <td>
                        <span className={"examhistory__badge" + (passed ? " examhistory__badge--pass" : " examhistory__badge--fail")}>
                          {a.correct}/{a.total} · {percent}%
                        </span>
                      </td>
                      <td>
                        <button className="examhistory__review" onClick={() => onReview(a)}>
                          <HiOutlineEye /> Check Answers
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Review({ attempt, onBack }) {
  if (!attempt) return null;
  const percent = Math.round((attempt.correct / attempt.total) * 100);
  const passed = percent >= 50;

  return (
    <div className="container result">
      <motion.div
        className="result__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button className="examhistory__back" style={{ marginBottom: 18 }} onClick={onBack}>
          <HiOutlineArrowLeft /> Back to history
        </button>
        <motion.div
          className={"result__ring" + (passed ? " result__ring--pass" : " result__ring--fail")}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <span>{percent}%</span>
        </motion.div>
        <h2>{attempt.subjectName}</h2>
        <p className="result__meta">
          {formatDate(attempt.date)} · {attempt.correct} / {attempt.total} correct · {formatDuration(attempt.durationTakenSeconds)} taken
        </p>
        <ScoreBreakdown questions={attempt.questions} answers={attempt.answers} />
      </motion.div>
    </div>
  );
}
