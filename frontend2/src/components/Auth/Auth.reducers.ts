import { type AuthActionTypes, REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, REGISTER_SUCCESS, REGISTER_FAILURE, SEND_CODE_SUCCESS, SEND_CODE_FAILURE, USER_LOADED, LOGOUT } from './Auth.actions';

export interface AuthState {
     user: IUser | null;
     token: string | null;
     loading: boolean;
     error: string | null;
}

const initialState: AuthState = {
     loading: false,
     token: null,
     user: null,
     error: null,
}

export function authReducer(state = initialState, action: AuthActionTypes): AuthState {
     switch (action.type) {
          case REQUEST:
               return { ...state, loading: true, error: null };
          case LOGIN_SUCCESS:
               localStorage.setItem('token', JSON.stringify(action.payload.token))
               localStorage.setItem('user', JSON.stringify(action.payload.user))
               return {
                    user: action.payload.user,
                    token: action.payload.token,
                    loading: false,
                    error: null,
               }
          case LOGIN_FAILURE:
               return { ...state, user: null, loading: false, error: action.payload };
          case REGISTER_SUCCESS:
               return { ...state, loading: false, error: null };
          case REGISTER_FAILURE:
               return { ...state, loading: false, error: action.payload };
          case SEND_CODE_SUCCESS:
               return { ...state, loading: false, error: null };
          case SEND_CODE_FAILURE:
               return { ...state, loading: false, error: action.payload };
          case USER_LOADED:
               if(isEmptyObject(action.payload.user)){
                    return { loading: false, token: "", user: null, error: null };
               }
               return { loading: false, token: action.payload.token, user: action.payload.user, error: null };
          case LOGOUT:
               localStorage.removeItem('user');
               localStorage.removeItem('token');
               return { ...state, user: null, token: null, loading: false, error: null };
          default:
               return state;
     }
}

function isEmptyObject(obj: any): boolean {
     return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

export { AuthActionTypes };
