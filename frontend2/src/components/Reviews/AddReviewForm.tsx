import React, { useState } from "react";
import { useAppDispatch } from "../../hooks/hooks";
import { AddReview } from "./Reviews.thunks";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setErrorAlert } from "../Alert/Alert.thunks";
import styles from "./AddReviewForm.module.css";

type AddReviewFormProps = {
     masterId: number;
};

const AddReviewForm: React.FC<AddReviewFormProps> = ({ masterId }) => {
     const dispatch = useAppDispatch();

     const [comment, setComment] = useState("");
     const [rating, setRating] = useState(5);
     const token = useSelector((state: RootState) => state.auth.token);
     const user = useSelector((state: RootState) => state.auth.user);

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!token || !user) {
               dispatch(setErrorAlert("Писать отзывы могут только авторизованные пользователи!"));
               return;
          }

          dispatch(
               AddReview(user.id.toString(), token, {
                    master_id: masterId,
                    rating,
                    comment,
               })
          );
          setComment("");
          setRating(5);
     };

     return (
          <form onSubmit={handleSubmit} className={styles.form}>
               <div className={styles.rateGroup}>
                    <label htmlFor="rating" className={styles.label}>Оценка</label>
                    <select
                         id="rating"
                         value={rating}
                         onChange={(e) => setRating(Number(e.target.value))}
                         className={styles.select}
                    >
                         {[5, 4, 3, 2, 1].map((r) => (
                              <option key={r} value={r}>
                                   {r}
                              </option>
                         ))}
                    </select>
               </div>

               <div className={styles.labelGroup} style={{ flex: "2 1 300px" }}>
                    <label htmlFor="comment" className={styles.label}>Комментарий</label>
                    <textarea
                         id="comment"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         rows={2}
                         className={styles.textarea}
                         placeholder="Ваш отзыв..."
                    />
               </div>

               <button type="submit" className={styles.button}>Отправить</button>
          </form>
     );
};

export default AddReviewForm;
