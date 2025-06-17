import React from "react";
import Master from "../../components/Masters/Master";
import Schedule from "../../components/Schedule/Schedule";
import { useParams } from "react-router-dom";
import styles from "./Reservation.module.css";
import ReviewsList from "../../components/Reviews/ReviewsList";
import AddReviewForm from "../../components/Reviews/AddReviewForm";

const Reservation: React.FC = () => {
     const { id } = useParams<{ id: string }>();

     if (!id) return null;

     return (
          <div className={styles.container}>
               <div className={styles.content}>
                    <div className={styles.schedule}>
                         <Schedule userId={id} />
                    </div>
                    <div className={styles.master}>
                         <Master masterId={id} />
                    </div>
                    <div className={styles.master}>
                         <AddReviewForm masterId={Number(id)}/>
                         <ReviewsList masterId={id} />
                    </div>
               </div>
          </div>
     );
};

export default Reservation;
