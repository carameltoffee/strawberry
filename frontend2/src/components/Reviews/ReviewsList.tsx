import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useAppDispatch } from "../../hooks/hooks";
import { GetReviews } from "./Reviews.thunks";
import Avatar from "../Avatar/Avatar";

type ReviewsListProps = {
     masterId: string;
};

const ReviewsList: React.FC<ReviewsListProps> = ({ masterId }) => {
     const dispatch = useAppDispatch();

     const { reviewsByMaster, loading, error } = useSelector((state: RootState) => state.reviews);

     useEffect(() => {
          dispatch(GetReviews(masterId));
     }, [dispatch, masterId]);

     if (loading) return <p>Загрузка отзывов...</p>;
     if (error) return;
     return (
          <div>
               <h2 className="text-xl font-semibold mb-2">Отзывы</h2>
               {!reviewsByMaster[masterId] ? (
                    <p>Отзывов пока нет.</p>
               ) : (
                    <ul className="space-y-3">
                         {reviewsByMaster[masterId].map((review) => (
                              <li key={review.id} className="p-3 border rounded shadow-sm">
                                   <Avatar userId={review.user_id.toString()} size={30}/>
                                   <div className="font-medium">Оценка: {review.rating}/5</div>
                                   <p className="text-gray-700">{review.comment}</p>
                              </li>
                         ))}
                    </ul>
               )}
          </div>
     );
};

export default ReviewsList;
