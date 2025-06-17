import {
     WORKS_LOAD_REQUEST,
     WORKS_LOAD_SUCCESS,
     WORKS_LOAD_FAILURE,
     WorksActionTypes,
     WORK_ADD_SUCCESS,
     WORK_DELETE_SUCCESS,
} from './Works.actions';

export interface WorksState {
     loading: boolean;
     error: string | null;
     worksIds: number[];
}

const initialState: WorksState = {
     loading: false,
     error: null,
     worksIds: [],
};

export function worksReducer(
     state = initialState,
     action: WorksActionTypes
): WorksState {
     switch (action.type) {
          case WORKS_LOAD_REQUEST:
               return {
                    ...state,
                    loading: true,
                    error: null,
                    worksIds: [],
               };
          case WORKS_LOAD_SUCCESS:
               return {
                    ...state,
                    loading: false,
                    error: null,
                    worksIds: (action.payload || []) ,
               };
          case WORKS_LOAD_FAILURE:
               return {
                    ...state,
                    loading: false,
                    error: action.payload.error,
                    worksIds: [],
               };
          case WORK_ADD_SUCCESS:
               return {
                    ...state,
                    worksIds: [...(state.worksIds || []), action.payload],
               };
          case WORK_DELETE_SUCCESS:
               return {
                    ...state,
                    worksIds: state.worksIds.filter(id => id !== action.payload),
               };
          default:
               return state;
     }
}
