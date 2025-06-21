import {
     REVIEWS_LOAD_REQUEST,
     REVIEWS_LOAD_SUCCESS,
     REVIEWS_LOAD_FAILURE,
     REVIEW_ADD_SUCCESS,
     REVIEW_UPDATE_SUCCESS,
     REVIEW_DELETE_SUCCESS,
     ReviewsActionTypes,
} from "./Reviews.actions";

export interface ReviewsState {
     loading: boolean;
     error: string | null;
     reviewsByMaster: Record<string, IReview[]>;
}

const initialState: ReviewsState = {
     loading: false,
     error: null,
     reviewsByMaster: {},
};

export const reviewsReducer = (
     state = initialState,
     action: ReviewsActionTypes
): ReviewsState => {
     switch (action.type) {
          case REVIEWS_LOAD_REQUEST:
               
               return { ...state, loading: true, error: null, };

          case REVIEWS_LOAD_SUCCESS:
               return {
                    ...state,
                    loading: false,
                    reviewsByMaster: {
                         ...state.reviewsByMaster,
                         [action.payload.masterId]: action.payload.reviews,
                    },
               };

          case REVIEWS_LOAD_FAILURE:
               return { ...state, loading: false, error: action.payload.error };

          case REVIEW_ADD_SUCCESS:
               const added = action.payload.review;
               return {
                    ...state,
                    reviewsByMaster: {
                         ...state.reviewsByMaster,
                         [added.master_id]: [added, ...(state.reviewsByMaster[added.master_id] || [])],
                    },
               };

          case REVIEW_UPDATE_SUCCESS:
               const updated = action.payload.review;
               return {
                    ...state,
                    reviewsByMaster: {
                         ...state.reviewsByMaster,
                         [updated.master_id]: (state.reviewsByMaster[updated.master_id] || []).map((r) =>
                              r.id === updated.id ? updated : r
                         ),
                    },
               };

          case REVIEW_DELETE_SUCCESS:
               const { id, master_id } = action.payload;
               return {
                    ...state,
                    reviewsByMaster: {
                         ...state.reviewsByMaster,
                         [master_id]: (state.reviewsByMaster[master_id] || []).filter((r) => r.id !== id),
                    },
               };

          default:
               return state;
     }
};
