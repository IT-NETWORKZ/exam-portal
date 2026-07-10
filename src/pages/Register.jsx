import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUser, HiOutlineLockClosed, HiOutlineEnvelope, HiOutlinePhone,
  HiOutlineBuildingOffice2, HiOutlineCheckCircle,
} from "react-icons/hi2";
import PageHero from "../components/PageHero";
import "./Register.css";

const CANDIDATE_FIELDS = [
  { key: "fullName", label: "Full Name", placeholder: "Enter Your Full Name", icon: HiOutlineUser },
  { key: "email", label: "Email Id", placeholder: "Enter Your Email Id", icon: HiOutlineEnvelope, type: "email" },
  { key: "phone", label: "Phone Number", placeholder: "Enter Your Phone Number", icon: HiOutlinePhone },
];

const ADMIN_FIELDS = [
  { key: "orgName", label: "Organisation Name", placeholder: "Enter Organisation / Institution Name", icon: HiOutlineBuildingOffice2 },
  { key: "fullName", label: "Admin Full Name", placeholder: "Enter Admin Full Name", icon: HiOutlineUser },
  { key: "email", label: "Email Id", placeholder: "Enter Your Email Id", icon: HiOutlineEnvelope, type: "email" },
  { key: "phone", label: "Contact Number", placeholder: "Enter Contact Number", icon: HiOutlinePhone },
];

export default function Register() {
  const [params] = useSearchParams();
  const initialTab = params.get("type") === "admin" ? "admin" : "candidate";
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({});
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const fields = tab === "candidate" ? CANDIDATE_FIELDS : ADMIN_FIELDS;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function switchTab(next) {
    setTab(next);
    setForm({});
    setAgree(false);
  }

  function submit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <PageHero title={tab === "candidate" ? "Candidate Registration" : "Admin Registration"} />

      <section className="register">
        <div className="container register__wrap">
          <motion.div
            className="registercard"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="registercard__tabs">
              <button
                className={"registercard__tab" + (tab === "candidate" ? " registercard__tab--active" : "")}
                onClick={() => switchTab("candidate")}
              >
                Candidate Registration
              </button>
              <button
                className={"registercard__tab" + (tab === "admin" ? " registercard__tab--active" : "")}
                onClick={() => switchTab("admin")}
              >
                Admin Registration
              </button>
            </div>

            <div className="registercard__body">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="registercard__success"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35 }}
                  >
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="registercard__success-icon"
                    >
                      <HiOutlineCheckCircle />
                    </motion.div>
                    <h3>{tab === "candidate" ? "Candidate account created" : "Admin account created"}</h3>
                    <p>
                      A verification link has been sent to <strong>{form.email || "your email"}</strong>.
                      Confirm it to activate your {tab === "candidate" ? "candidate" : "admin"} dashboard.
                    </p>
                    <div className="registercard__success-actions">
                      <button className="registercard__ghost" onClick={() => { setSubmitted(false); setForm({}); }}>
                        Register another
                      </button>
                      <button className="registercard__primary" onClick={() => navigate("/")}>
                        Go to Login
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key={tab}
                    onSubmit={submit}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="registercard__intro">
                      {tab === "candidate"
                        ? "Create a candidate account to take practice exams and track your results."
                        : "Register your organisation to schedule exams and manage candidates."}
                    </p>

                    <div className="registercard__grid">
                      {fields.map((f) => (
                        <div className="registercard__field" key={f.key}>
                          <label><f.icon /> {f.label}</label>
                          <input
                            required
                            type={f.type || "text"}
                            placeholder={f.placeholder}
                            value={form[f.key] || ""}
                            onChange={(e) => update(f.key, e.target.value)}
                          />
                        </div>
                      ))}

                      <div className="registercard__field">
                        <label><HiOutlineLockClosed /> Password</label>
                        <input
                          required
                          type="password"
                          placeholder="Create a password"
                          value={form.password || ""}
                          onChange={(e) => update("password", e.target.value)}
                        />
                      </div>
                      <div className="registercard__field">
                        <label><HiOutlineLockClosed /> Confirm Password</label>
                        <input
                          required
                          type="password"
                          placeholder="Re-enter your password"
                          value={form.confirm || ""}
                          onChange={(e) => update("confirm", e.target.value)}
                        />
                      </div>
                    </div>

                    <label className="registercard__agree">
                      <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                      I agree to the Terms & Conditions and Privacy Policy
                    </label>

                    <motion.button
                      type="submit"
                      className="registercard__submit"
                      whileHover={{ y: -2, boxShadow: "0 12px 26px rgba(245,166,35,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {tab === "candidate" ? "Create Candidate Account" : "Create Admin Account"}
                    </motion.button>

                    <p className="registercard__switch">
                      Already have an account? <Link to="/">Login instead</Link>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.aside
            className="register__aside"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3>{tab === "candidate" ? "Why register as a candidate?" : "Why register as an admin?"}</h3>
            <ul>
              {(tab === "candidate"
                ? [
                    "Practice exams across 2900+ subjects",
                    "Track your history and scores in one dashboard",
                    "Renew subscription anytime — Beginner, Master, or Expert",
                  ]
                : [
                    "Schedule exams for any number of participants",
                    "Upload your own question bank or use ready-made sets",
                    "Access participant history and certificates",
                  ]
              ).map((t) => (
                <li key={t}>
                  <HiOutlineCheckCircle /> {t}
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </section>
    </div>
  );
}
