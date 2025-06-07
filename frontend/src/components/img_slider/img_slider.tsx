import React, { useState, useEffect, useRef } from "react";
import styles from "./img_slider.module.css";

const WorksSlider = ({ works, master, API_BASE, interval = 5000 }) => {
     const [currentIndex, setCurrentIndex] = useState(0);
     const timeoutRef = useRef(null);

     if (!works || works.length === 0) return null;

     const resetTimeout = () => {
          if (timeoutRef.current) {
               clearTimeout(timeoutRef.current);
          }
     };

     useEffect(() => {
          resetTimeout();
          timeoutRef.current = setTimeout(() => {
               setCurrentIndex((prevIndex) => (prevIndex === works.length - 1 ? 0 : prevIndex + 1));
          }, interval);

          return () => {
               resetTimeout();
          };
     }, [currentIndex, works.length, interval]);

     const prevSlide = () => {
          resetTimeout();
          setCurrentIndex((prev) => (prev === 0 ? works.length - 1 : prev - 1));
     };

     const nextSlide = () => {
          resetTimeout();
          setCurrentIndex((prev) => (prev === works.length - 1 ? 0 : prev + 1));
     };

     return (
          <div className={styles.worksSection}>
               <h3>Примеры работ</h3>
               <div className={styles.slider}>
                    <button onClick={prevSlide} className={styles.navButton} aria-label="Предыдущее">
                         ‹
                    </button>
                    <div className={styles.workItem}>
                         {works.map((work, index) => (
                              <img
                                   key={work}
                                   src={`${API_BASE}/users/${master.id}/works/${work}`}
                                   alt={`Пример работы ${index + 1}`}
                                   className={`${styles.workImage} ${index === currentIndex ? styles.active : styles.inactive}`}
                                   loading="lazy"
                              />
                         ))}
                    </div>
                    <button onClick={nextSlide} className={styles.navButton} aria-label="Следующее">
                         ›
                    </button>
               </div>
          </div>
     );
};

export default WorksSlider;
