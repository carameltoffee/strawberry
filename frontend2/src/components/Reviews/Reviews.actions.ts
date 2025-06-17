export const REVIEWS_LOAD_REQUEST = "REVIEWS_LOAD_REQUEST";
export const REVIEWS_LOAD_SUCCESS = "REVIEWS_LOAD_SUCCESS";
export const REVIEWS_LOAD_FAILURE = "REVIEWS_LOAD_FAILURE";

export const REVIEW_ADD_SUCCESS = "REVIEW_ADD_SUCCESS";
export const REVIEW_UPDATE_SUCCESS = "REVIEW_UPDATE_SUCCESS";
export const REVIEW_DELETE_SUCCESS = "REVIEW_DELETE_SUCCESS";

export type ReviewsActionTypes =
     | ReviewsLoadRequest
     | ReviewsLoadSuccess
     | ReviewsLoadFailure
     | ReviewAddSuccess
     | ReviewUpdateSuccess
     | ReviewDeleteSuccess;

interface ReviewsLoadRequest {
     type: typeof REVIEWS_LOAD_REQUEST;
}

interface ReviewsLoadSuccess {
     type: typeof REVIEWS_LOAD_SUCCESS;
     payload: {
          masterId: string;
          reviews: IReview[];
     };
}

interface ReviewsLoadFailure {
     type: typeof REVIEWS_LOAD_FAILURE;
     payload: {
          error: string;
     };
}

interface ReviewAddSuccess {
     type: typeof REVIEW_ADD_SUCCESS;
     payload: {
          review: IReview;
     };
}

interface ReviewUpdateSuccess {
     type: typeof REVIEW_UPDATE_SUCCESS;
     payload: {
          review: IReview;
     };
}

interface ReviewDeleteSuccess {
     type: typeof REVIEW_DELETE_SUCCESS;
     payload: {
          id: number;
          master_id: number;
     };
}

export const sendReviewsLoadReq = (): ReviewsLoadRequest => ({
     type: REVIEWS_LOAD_REQUEST,
});

export const setReviewsLoadSuccess = (
     masterId: string,
     reviews: IReview[]
): ReviewsLoadSuccess => ({
     type: REVIEWS_LOAD_SUCCESS,
     payload: { masterId, reviews },
});

export const setReviewsLoadFailure = (error: string): ReviewsLoadFailure => ({
     type: REVIEWS_LOAD_FAILURE,
     payload: { error },
});

export const addReviewSuccess = (review: IReview): ReviewAddSuccess => ({
     type: REVIEW_ADD_SUCCESS,
     payload: { review },
});

export const updateReviewSuccess = (review: IReview): ReviewUpdateSuccess => ({
     type: REVIEW_UPDATE_SUCCESS,
     payload: { review },
});

export const deleteReviewSuccess = (
     id: number,
     master_id: number
): ReviewDeleteSuccess => ({
     type: REVIEW_DELETE_SUCCESS,
     payload: { id, master_id },
});
