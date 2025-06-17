import {
     sendReviewsLoadReq,
     setReviewsLoadFailure,
     setReviewsLoadSuccess,
     addReviewSuccess,
     updateReviewSuccess,
     deleteReviewSuccess,
} from "./Reviews.actions";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store/store";
import { ReviewsActionTypes } from "./Reviews.actions";
import { setErrorAlert } from "../Alert/Alert.thunks";

type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     ReviewsActionTypes
>;

export const GetReviews = (masterId: string): AppThunk => async (dispatch) => {
     dispatch(sendReviewsLoadReq());
     try {
          const res = await fetch(`${__BASE_API_URL__}/reviews/master/${masterId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Ошибка при загрузке отзывов");
          dispatch(setReviewsLoadSuccess(masterId, data));
     } catch (error) {
          const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
          dispatch(setReviewsLoadFailure(msg));
     }
};

export const AddReview = (userId: string, token: string, review: IReviewInput): AppThunk => async (dispatch) => {
     try {
          const res = await fetch(`${__BASE_API_URL__}/reviews/`, {
               method: "POST",
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
               },
               body: JSON.stringify(review),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Ошибка при добавлении отзыва");

          if (!data.user_id) {
               data.user_id = userId;
          }

          dispatch(addReviewSuccess(data));
     } catch (error) {
          const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
     }
};


export const UpdateReview = (review: IReview): AppThunk => async (dispatch) => {
     try {
          const res = await fetch(`${__BASE_API_URL__}/reviews/${review.id}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(review),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Ошибка при обновлении отзыва");
          dispatch(updateReviewSuccess(data));
     } catch (error) {
          const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
     }
};

export const DeleteReview = (id: number, master_id: number): AppThunk => async (dispatch) => {
     try {
          const res = await fetch(`${__BASE_API_URL__}/reviews/${id}`, {
               method: "DELETE",
          });
          if (!res.ok) throw new Error("Ошибка при удалении отзыва");
          dispatch(deleteReviewSuccess(id, master_id));
     } catch (error) {
          const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
     }
};
