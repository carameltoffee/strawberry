import React from "react";
import styles from "./stars.module.css";

type StarRatingProps = {
     rating: number;
     maxStars?: number;
};

export const StarRating: React.FC<StarRatingProps> = ({ rating, maxStars = 5 }) => {
     const stars = [];

     for (let i = 1; i <= maxStars; i++) {
          if (rating >= i) {
               stars.push(<span key={i} className={styles.starFilled}>★</span>);
          } else if (rating + 0.5 >= i) {
               stars.push(
                    <span key={i} className={styles.starHalfContainer}>★</span>,
                    <span key={i + "empty"} className={styles.starHalfOverlay}>★</span>
               );
          } else {
               stars.push(<span key={i} className={styles.star}>★</span>);
          }
     }

     return <div>{stars}</div>;
};
