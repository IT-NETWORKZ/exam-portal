import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import Loader from "./components/Loader";
import ScrollProgress from "./components/ScrollProgress";
import Home from "./pages/Home";
import About from "./pages/About";
import TechSupport from "./pages/TechSupport";
import ExamPrice from "./pages/ExamPrice";
import SurveyPrice from "./pages/SurveyPrice";
import Register from "./pages/Register";
import DemoExam from "./pages/DemoExam";
import "./App.css";

export default function App() {
  const location = useLocation();
  const isExam = location.pathname === "/demo-exam";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 1900);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>

      <motion.div
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {!isExam && <ScrollProgress />}
        {!isExam && <TopBar />}
        {!isExam && <Navbar />}
        <main className="app__main">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/tech-support" element={<PageTransition><TechSupport /></PageTransition>} />
              <Route path="/exam-price" element={<PageTransition><ExamPrice /></PageTransition>} />
              <Route path="/survey-price" element={<PageTransition><SurveyPrice /></PageTransition>} />
              <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
              <Route path="/demo-exam" element={<PageTransition><DemoExam /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
        {!isExam && <Footer />}
      </motion.div>
    </>
  );
}
