import { ConfirmActionTypes, CONFIRM_SHOW, CONFIRM_HIDE, CONFIRM_SET_CALLBACK } from "./Confirm.actions";

interface ConfirmState {
     visible: boolean;
     message: string | null;
     onConfirm: (() => void) | null;
     onCancel: (() => void) | null;
}

const initialState: ConfirmState = {
     visible: false,
     message: null,
     onConfirm: null,
     onCancel: null,
};

export function confirmReducer(
     state = initialState,
     action: ConfirmActionTypes
): ConfirmState {
     switch (action.type) {
          case CONFIRM_SHOW:
               return {
                    ...state,
                    visible: true,
                    message: action.payload.message,
               };
          case CONFIRM_HIDE:
               return {
                    ...state,
                    visible: false,
                    message: null,
                    onConfirm: null,
                    onCancel: null,
               };
          case CONFIRM_SET_CALLBACK:
               return {
                    ...state,
                    onConfirm: action.payload.onConfirm,
                    onCancel: action.payload.onCancel || null,
               };
          default:
               return state;
     }
}
