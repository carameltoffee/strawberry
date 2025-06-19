import {
     USER_SEARCH_REQUEST,
     USER_SEARCH_SUCCESS,
     USER_SEARCH_FAILURE,
     UserSearchActionTypes,
} from "./Search.actions";

export interface UserSearchState {
     loading: boolean;
     error: string | null;
     users: IUser[];
}

const initialState: UserSearchState = {
     loading: false,
     error: null,
     users: [],
};

export function userSearchReducer(
     state = initialState,
     action: UserSearchActionTypes
): UserSearchState {
     switch (action.type) {
          case USER_SEARCH_REQUEST:
               return { ...state, loading: true, error: null };
          case USER_SEARCH_SUCCESS:
               return { ...state, loading: false, users: action.payload };
          case USER_SEARCH_FAILURE:
               return { ...state, loading: false, error: action.payload };
          default:
               return state;
     }
}
