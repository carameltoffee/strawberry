export const UPLOAD_AVATAR_REQUEST = "UPLOAD_AVATAR_REQUEST";
export const UPLOAD_AVATAR_SUCCESS = "UPLOAD_AVATAR_SUCCESS";
export const UPLOAD_AVATAR_FAILURE = "UPLOAD_AVATAR_FAILURE";

interface UploadAvatarRequestAction {
     type: typeof UPLOAD_AVATAR_REQUEST;
}

interface UploadAvatarSuccessAction {
     type: typeof UPLOAD_AVATAR_SUCCESS;
}

interface UploadAvatarFailureAction {
     type: typeof UPLOAD_AVATAR_FAILURE;
     payload: string; 
}

export type AvatarActionTypes =
     | UploadAvatarRequestAction
     | UploadAvatarSuccessAction
     | UploadAvatarFailureAction;

export const uploadAvatarRequest = (): UploadAvatarRequestAction => ({
     type: UPLOAD_AVATAR_REQUEST,
});

export const uploadAvatarSuccess = (): UploadAvatarSuccessAction => ({
     type: UPLOAD_AVATAR_SUCCESS,
});

export const uploadAvatarFailure = (error: string): UploadAvatarFailureAction => ({
     type: UPLOAD_AVATAR_FAILURE,
     payload: error,
});
