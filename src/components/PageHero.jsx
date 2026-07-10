import { motion } from "framer-motion";
import "./PageHero.css";

export default function PageHero({ title }) {
  return (
    <div className="pagehero">
      <div className="pagehero__blob pagehero__blob--1" />
      <div className="pagehero__blob pagehero__blob--2" />
      <div className="container">
        <motion.h1
          className="pagehero__title"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h1>
      </div>
    </div>
  );
}
