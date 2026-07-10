import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineUser, HiOutlineLockClosed } from "react-icons/hi2";
import { useNavigate, Link } from "react-router-dom";
import StatsBar from "../components/StatsBar";
import HighlightBand from "../components/HighlightBand";
import "./Home.css";

const CLIENTS = ["IT-NetworkZ", "Kavin SA", "Nagpur Institute", "Prime Coaching", "Skillup Labs", "Bright Scholars"];

export default function Home() {
  const [authTab, setAuthTab] = useState("candidate");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__hero">
        <div className="home__hero-blob home__hero-blob--1" />
        <div className="home__hero-blob home__hero-blob--2" />
        <div className="container home__hero-inner">
          <motion.div
            className="home__pitch"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="home__eyebrow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Online Assessment Platform
            </motion.span>
            <h1 className="home__headline">
              <motion.span
                className="home__headline-line"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
              >
                Test knowledge.
              </motion.span>
              <br />
              <motion.span
                className="home__headline-accent"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.32 }}
              >
                Prove it, instantly.
              </motion.span>
            </h1>
            <motion.p
              className="home__sub"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              Practice exams, live assessments, and question banks for institutions,
              organisations, and job seekers — with results the moment you finish.
            </motion.p>

            <div className="home__clients-panel">
              <div className="home__clients-tab">Our Clients</div>
              <div className="home__clients-track">
                <motion.div
                  className="home__clients-scroll"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                >
                  {[...CLIENTS, ...CLIENTS].map((c, i) => (
                    <span className="home__client-chip" key={i}>{c}</span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="authcard"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="authcard__tabs">
              <button
                className={"authcard__tab" + (authTab === "candidate" ? " authcard__tab--active" : "")}
                onClick={() => setAuthTab("candidate")}
              >
                Candidate Login
              </button>
              <button
                className={"authcard__tab" + (authTab === "admin" ? " authcard__tab--active" : "")}
                onClick={() => setAuthTab("admin")}
              >
                Admin Login
              </button>
            </div>

            <div className="authcard__body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={authTab}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <a className="authcard__linknote" href="#login">
                    Login Now ({authTab === "candidate" ? "Candidate Login" : "Admin Login"})
                  </a>

                  <label className="authcard__label">
                    <HiOutlineUser /> Email Id
                  </label>
                  <input className="authcard__input" placeholder="Enter Your Email Id" />

                  <label className="authcard__label">
                    <HiOutlineLockClosed /> Password
                  </label>
                  <input className="authcard__input" type="password" placeholder="Enter Your Password" />

                  <div className="authcard__row">
                    <label className="authcard__remember">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                      Remember Me
                    </label>
                    <a href="#forgot" className="authcard__forgot">Forgot Password?</a>
                  </div>

                  <motion.button
                    className="authcard__submit"
                    whileHover={{ y: -2, boxShadow: "0 12px 26px rgba(245,166,35,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/demo-exam")}
                  >
                    Login
                  </motion.button>

                  {authTab === "candidate" ? (
                    <p className="authcard__register">
                      Don't have an account? <Link to="/register">Register Now (Candidate Access)</Link>
                    </p>
                  ) : (
                    <p className="authcard__register">
                      New organisation? <Link to="/register?type=admin">Register Now (Admin Access)</Link>
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <StatsBar />
      <HighlightBand />
    </div>
  );
}
