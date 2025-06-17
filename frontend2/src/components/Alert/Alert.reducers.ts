import { AlertActionTypes, ERROR_ALERT, HIDE_ALERT, SUCCESS_ALERT } from "./Alert.actions";

export interface AlertState {
     message: string,
     isError: boolean,
}

const initialState: AlertState = {
     message: "",
     isError: false,
}

export function alertReducer(state = initialState, action: AlertActionTypes): AlertState {
     switch (action.type) {
          case SUCCESS_ALERT:
               return { 
                    message: action.payload,
                    isError: false,
               };
          case ERROR_ALERT:
               return {
                    message: action.payload,
                    isError: true,
               }
          case HIDE_ALERT:
               return {
                    message: "",
                    isError: false,
               }
          default:
               return state;
     }
}
