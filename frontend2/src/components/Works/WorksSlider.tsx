import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import styles from "./WorksSlider.module.css";
import { RootState } from "../../store/store";
import { getWorks } from "./Works.thunks";
import { useAppDispatch } from "../../hooks/hooks";

type WorksSliderProps = {
     userId: string;
     interval?: number;
};

const WorksSlider: React.FC<WorksSliderProps> = ({ userId, interval = 5000 }) => {
     const dispatch = useAppDispatch();

     const worksIds = useSelector((state: RootState) => state.works.worksIds);
     const loading = useSelector((state: RootState) => state.works.loading);
     const error = useSelector((state: RootState) => state.works.error);

     const [currentIndex, setCurrentIndex] = useState(0);
     const timeoutRef = useRef<NodeJS.Timeout | null>(null);

     useEffect(() => {
          dispatch(getWorks(userId));
     }, [dispatch, userId]);

     const resetTimeout = () => {
          if (timeoutRef.current) {
               clearTimeout(timeoutRef.current);
          }
     };

     useEffect(() => {
          if (!worksIds || worksIds.length === 0) return;

          resetTimeout();
          timeoutRef.current = setTimeout(() => {
               setCurrentIndex((prevIndex) => (prevIndex === worksIds.length - 1 ? 0 : prevIndex + 1));
          }, interval);

          return () => {
               resetTimeout();
          };
     }, [currentIndex, worksIds, interval]);

     const prevSlide = () => {
          resetTimeout();
          setCurrentIndex((prev) => (prev === 0 ? worksIds.length - 1 : prev - 1));
     };

     const nextSlide = () => {
          resetTimeout();
          setCurrentIndex((prev) => (prev === worksIds.length - 1 ? 0 : prev + 1));
     };

     if (loading) return <div>Загрузка...</div>;
     if (error) return <div>Ошибка: {error}</div>;
     if (!worksIds || worksIds.length === 0) return null;

     return (
          <div className={styles.worksSection}>
               <div className={styles.slider}>
                    <button onClick={prevSlide} className={styles.navButton} aria-label="Предыдущее">
                         ‹
                    </button>
                    <div className={styles.workItem}>
                         {worksIds.map((work: React.Key | null | undefined, index: number) => (
                              <img
                                   key={work}
                                   src={`${__BASE_API_URL__}/users/${userId}/works/${work}`}
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
