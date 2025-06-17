export const REQUEST = 'REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';
export const SEND_CODE_SUCCESS = 'SEND_CODE_SUCCESS';
export const SEND_CODE_FAILURE = 'SEND_CODE_FAILURE';
export const USER_LOADED = 'USER_LOADED';
export const LOGOUT = 'LOGOUT';

interface LogoutAction {
     type: typeof LOGOUT;
}

interface RequestAction {
     type: typeof REQUEST;
}

interface LoginSuccessAction {
     type: typeof LOGIN_SUCCESS;
     payload: {
          user: IUser;
          token: string;
     };
}

interface LoginFailureAction {
     type: typeof LOGIN_FAILURE;
     payload: string;
}

interface RegisterSuccessAction {
     type: typeof REGISTER_SUCCESS;
}

interface RegisterFailureAction {
     type: typeof REGISTER_FAILURE;
     payload: string;
}

interface SendCodeSuccessAction {
     type: typeof SEND_CODE_SUCCESS;
}

interface SendCodeFailureAction {
     type: typeof SEND_CODE_FAILURE;
     payload: string;
}

interface UserLoadedAction {
     type: typeof USER_LOADED;
     payload: {
          user: IUser,
          token: string,
     }
}

export type AuthActionTypes = RequestAction | LoginSuccessAction | LoginFailureAction | 
                              RegisterSuccessAction | RegisterFailureAction | SendCodeSuccessAction |
                              SendCodeFailureAction | UserLoadedAction | LogoutAction;

export const request = (): RequestAction => ({
     type: REQUEST
});

export const loginSuccess = (user: IUser, token: string): LoginSuccessAction => ({
     type: LOGIN_SUCCESS,
     payload: { user, token }
});

export const loginFailure = (error: string): LoginFailureAction => ({
     type: LOGIN_FAILURE,
     payload: error
});

export const registerSuccess = (): RegisterSuccessAction => ({
     type: REGISTER_SUCCESS,
});

export const registerFailure = (error: string): RegisterFailureAction => ({
     type: REGISTER_FAILURE,
     payload: error,
});

export const sendCodeSuccess = (): SendCodeSuccessAction => ({
     type: SEND_CODE_SUCCESS,
});

export const sendCodeFailure = (error: string): SendCodeFailureAction => ({
     type: SEND_CODE_FAILURE,
     payload: error,
});

export const userLoaded = (token: string, user: IUser): UserLoadedAction => ({
     type: USER_LOADED,
     payload: {
          token,
          user
     },
})

export const logoutAction = (): LogoutAction => ({
     type: LOGOUT,
})

