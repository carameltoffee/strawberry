export const WORKS_LOAD_REQUEST = 'WORKS_LOAD_REQUEST';
export const WORKS_LOAD_SUCCESS = 'WORKS_LOAD_SUCCESS';
export const WORKS_LOAD_FAILURE = 'WORKS_LOAD_FAILURE';
export const WORK_ADD_SUCCESS = 'WORK_ADD_SUCCESS';
export const WORK_DELETE_SUCCESS = 'WORK_DELETE_SUCCESS';

interface WorksLoadRequestAction {
     type: typeof WORKS_LOAD_REQUEST;
}

interface WorksLoadSuccessAction {
     type: typeof WORKS_LOAD_SUCCESS;
     payload: number[];
}

interface WorksLoadFailureAction {
     type: typeof WORKS_LOAD_FAILURE;
     payload: {
          error: string;
     };
}

interface WorkAddSuccessAction {
     type: typeof WORK_ADD_SUCCESS;
     payload: number;
}

interface WorkDeleteSuccessAction {
     type: typeof WORK_DELETE_SUCCESS;
     payload: number;
}

export const sendWorksLoadReq = (): WorksLoadRequestAction => ({
     type: WORKS_LOAD_REQUEST,
});

export const setWorksLoadSuccess = (worksIds: number[]): WorksLoadSuccessAction => ({
     type: WORKS_LOAD_SUCCESS,
     payload: worksIds,
});

export const setWorksLoadFailure = (error: string): WorksLoadFailureAction => ({
     type: WORKS_LOAD_FAILURE,
     payload: { error },
});

export const workAddSuccess = (id: number): WorkAddSuccessAction => ({
     type: WORK_ADD_SUCCESS,
     payload: id,
});

export const workDeleteSuccess = (id: number): WorkDeleteSuccessAction => ({
     type: WORK_DELETE_SUCCESS,
     payload: id,
});

export type WorksActionTypes =
     | WorksLoadRequestAction
     | WorksLoadSuccessAction
     | WorksLoadFailureAction
     | WorkAddSuccessAction
     | WorkDeleteSuccessAction;