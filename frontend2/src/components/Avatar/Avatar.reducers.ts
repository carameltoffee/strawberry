import {
     AvatarActionTypes,
     UPLOAD_AVATAR_REQUEST,
     UPLOAD_AVATAR_SUCCESS,
     UPLOAD_AVATAR_FAILURE,
} from "./Avatar.actions";

export interface AvatarState {
     loading: boolean;
     error: string | null;
     reloadKey: number;
}

const initialState: AvatarState = {
     loading: false,
     error: null,
     reloadKey: Date.now(),
};

export function avatarReducer(
     state = initialState,
     action: AvatarActionTypes
): AvatarState {
     switch (action.type) {
          case UPLOAD_AVATAR_REQUEST:
               return { ...state, loading: true, error: null };
          case UPLOAD_AVATAR_SUCCESS:
               return { ...state, loading: false, error: null, reloadKey: Date.now() };
          case UPLOAD_AVATAR_FAILURE:
               return { ...state, loading: false, error: action.payload };
          default:
               return state;
     }
}
