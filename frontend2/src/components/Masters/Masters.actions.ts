export const MASTERS_LOAD_SUCCESS = 'MASTERS_LOAD_SUCCESS';
export const MASTERS_LOAD_FAILURE = 'MASTERS_LOAD_FAILURE';
export const MASTERS_LOAD_REQUEST = 'MASTERS_LOAD_REQUEST';

export const MASTER_LOAD_REQUEST = "MASTER_LOAD_REQUEST";
export const MASTER_LOAD_SUCCESS = "MASTER_LOAD_SUCCESS";
export const MASTER_LOAD_FAILURE = "MASTER_LOAD_FAILURE";

export type MastersActionTypes = MastersLoadSuccess | MastersLoadFailure | MastersLoadRequest
     | MasterLoadFailureAction | MasterLoadRequestAction | MasterLoadSuccessAction;


export interface MasterLoadRequestAction {
     type: typeof MASTER_LOAD_REQUEST;
}

export interface MasterLoadSuccessAction {
     type: typeof MASTER_LOAD_SUCCESS;
     payload: { master: IUser };
}

export interface MasterLoadFailureAction {
     type: typeof MASTER_LOAD_FAILURE;
     payload: { error: string };
}


interface MastersLoadSuccess {
     type: typeof MASTERS_LOAD_SUCCESS,
     payload: {
          masters: IUser[],
     },
}

interface MastersLoadFailure {
     type: typeof MASTERS_LOAD_FAILURE,
     payload: {
          error: string,
     }
}

interface MastersLoadRequest {
     type: typeof MASTERS_LOAD_REQUEST,
}

export const setMastersLoadSuccess = (masters: IUser[]): MastersLoadSuccess => ({
     type: MASTERS_LOAD_SUCCESS,
     payload: {
          masters,
     }
});

export const setMastersLoadFailure = (err: string): MastersLoadFailure => ({
     type: MASTERS_LOAD_FAILURE,
     payload: {
          error: err,
     }
});

export const sendMastersLoadReq = (): MastersLoadRequest => ({
     type: MASTERS_LOAD_REQUEST,
});

export const sendMasterLoadReq = (): MasterLoadRequestAction => ({
     type: MASTER_LOAD_REQUEST,
});

export const setMasterLoadSuccess = (master: IUser): MasterLoadSuccessAction => ({
     type: MASTER_LOAD_SUCCESS,
     payload: { master },
});

export const setMasterLoadFailure = (error: string): MasterLoadFailureAction => ({
     type: MASTER_LOAD_FAILURE,
     payload: { error },
});