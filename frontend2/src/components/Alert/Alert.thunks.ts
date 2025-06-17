import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store/store";
import { AlertActionTypes, hideAlert, setAlertError, setAlertSuccess } from "./Alert.actions";

export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     AlertActionTypes
>;


export const setErrorAlert = (msg: string): AppThunk => (dispatch) => {
     dispatch(setAlertError(msg))
}

export const setSuccessAlert = (msg: string): AppThunk => (dispatch) => {
     dispatch(setAlertSuccess(msg))
}

export const HideAlert = (): AppThunk => (dispatch) => {
     dispatch(hideAlert())
}