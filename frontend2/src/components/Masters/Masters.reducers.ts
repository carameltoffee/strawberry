import { MASTER_LOAD_FAILURE, MASTER_LOAD_REQUEST, MASTER_LOAD_SUCCESS, MASTER_UPDATE_FAILURE, MASTER_UPDATE_SUCCESS, MASTERS_LOAD_FAILURE, MASTERS_LOAD_REQUEST, MASTERS_LOAD_SUCCESS, MastersActionTypes } from "./Masters.actions";

export interface MastersState {
     loading: boolean;
     error: string | null;
     mastersById: Record<string, IUser>;
}

const initialState: MastersState = {
     loading: false,
     error: null,
     mastersById: {},
};

export function mastersReducer(state = initialState, action: MastersActionTypes): MastersState {
     switch (action.type) {
          case MASTERS_LOAD_REQUEST:
          case MASTER_LOAD_REQUEST:
               return {
                    ...state,
                    loading: true,
                    error: null,
               };
          case MASTERS_LOAD_SUCCESS:
               const mastersArray = action.payload.masters;
               const mastersById = mastersArray.reduce((acc, master) => {
                    acc[master.id.toString()] = master;
                    return acc;
               }, {} as Record<string, IUser>);

               return {
                    ...state,
                    loading: false,
                    error: null,
                    mastersById: {
                         ...state.mastersById,
                         ...mastersById,
                    },
               };
          case MASTER_UPDATE_SUCCESS:
                return {
                    ...state,
                    loading: false,
                    error: null,
               };
          case MASTER_LOAD_SUCCESS:
               const master = action.payload.master;
               return {
                    ...state,
                    loading: false,
                    error: null,
                    mastersById: {
                         ...state.mastersById,
                         [master.id.toString()]: master,
                    }
               };
          case MASTERS_LOAD_FAILURE:
          case MASTER_LOAD_FAILURE:
          case MASTER_UPDATE_FAILURE:
               return {
                    ...state,
                    loading: false,
                    error: action.payload.error,
               };
          default:
               return state;
     }
}