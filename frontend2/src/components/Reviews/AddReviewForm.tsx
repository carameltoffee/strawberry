import React, { useState } from "react";
import { useAppDispatch } from "../../hooks/hooks";
import { AddReview } from "./Reviews.thunks";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setErrorAlert } from "../Alert/Alert.thunks";

type AddReviewFormProps = {
     masterId: number;
};

const AddReviewForm: React.FC<AddReviewFormProps> = ({ masterId }) => {
     const dispatch = useAppDispatch();

     const [comment, setComment] = useState("");
     const [rating, setRating] = useState(5);
     const token = useSelector((state: RootState) => state.auth.token)
     const user = useSelector((state: RootState) => state.auth.user)

     const handleSubmit = (e: React.FormEvent) => {
          if (!token || !user) {
               dispatch(setErrorAlert("Писать отзывы могут только авторизованные пользователи!"));
               return;
          }
          e.preventDefault();
          dispatch(AddReview(user.id.toString(), token, { master_id: masterId, rating, comment }));
          setComment("");
          setRating(5);
     };

     return (
          <form onSubmit={handleSubmit} className="space-y-4">
               <h3 className="text-lg font-semibold">Оставить отзыв</h3>
               <div>
                    <label className="block mb-1">Оценка</label>
                    <select
                         value={rating}
                         onChange={(e) => setRating(Number(e.target.value))}
                         className="border rounded px-2 py-1"
                    >
                         {[5, 4, 3, 2, 1].map((r) => (
                              <option key={r} value={r}>
                                   {r}
                              </option>
                         ))}
                    </select>
               </div>
               <div>
                    <label className="block mb-1">Комментарий</label>
                    <textarea
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         rows={3}
                         className="w-full border rounded px-2 py-1"
                         placeholder="Ваш отзыв..."
                    />
               </div>
               <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
               >
                    Отправить
               </button>
          </form>
     );
};

export default AddReviewForm;
