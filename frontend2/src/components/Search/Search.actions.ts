export const USER_SEARCH_REQUEST = "USER_SEARCH_REQUEST";
export const USER_SEARCH_SUCCESS = "USER_SEARCH_SUCCESS";
export const USER_SEARCH_FAILURE = "USER_SEARCH_FAILURE";

interface UserSearchRequestAction {
     type: typeof USER_SEARCH_REQUEST;
}

interface UserSearchSuccessAction {
     type: typeof USER_SEARCH_SUCCESS;
     payload: IUser[];
}

interface UserSearchFailureAction {
     type: typeof USER_SEARCH_FAILURE;
     payload: string;
}

export type UserSearchActionTypes =
     | UserSearchRequestAction
     | UserSearchSuccessAction
     | UserSearchFailureAction;

export const userSearchRequest = (): UserSearchRequestAction => ({
     type: USER_SEARCH_REQUEST,
});

export const userSearchSuccess = (users: IUser[]): UserSearchSuccessAction => ({
     type: USER_SEARCH_SUCCESS,
     payload: users,
});

export const userSearchFailure = (error: string): UserSearchFailureAction => ({
     type: USER_SEARCH_FAILURE,
     payload: error,
});
