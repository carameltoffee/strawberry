import React from 'react';
import styles from './Stars.module.css';

interface StarsProps {
     rating: number; 
}

const Stars: React.FC<StarsProps> = ({ rating }) => {
     const clampedRating = Math.max(0, Math.min(5, rating));
     const roundedRating = Math.round(clampedRating);

     return (
          <div className={styles.wrapper}>
               <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                         <span
                              key={i}
                              className={i < roundedRating ? styles.filled : styles.empty}
                         >
                              ★
                         </span>
                    ))}
               </div>
               <span className={styles.number}>{clampedRating.toFixed(1)}</span>
          </div>
     );
};

export default Stars;
