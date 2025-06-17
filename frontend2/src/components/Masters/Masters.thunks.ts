import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store/store";
import { MastersActionTypes, sendMasterLoadReq, sendMastersLoadReq, setMasterLoadFailure, setMasterLoadSuccess, setMastersLoadFailure, setMastersLoadSuccess } from "./Masters.actions";
import { setErrorAlert } from "../Alert/Alert.thunks";

export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     MastersActionTypes
>;

export const GetMasters = (): AppThunk => async (dispatch) => {
     dispatch(sendMastersLoadReq());
     try {
          const response = await fetch(`${__BASE_API_URL__}/masters`, {
               method: 'GET',
          })
          const data = await response.json();
          if (!response.ok) throw new Error(data?.error || 'Неизвестная ошибка');

          dispatch(setMastersLoadSuccess(data))
     } catch (error) {
          if (error instanceof Error) {
               dispatch(setErrorAlert(error.message));
               dispatch(setMastersLoadFailure(error.message));
          } else {
               dispatch(setMastersLoadFailure("Неизвестная ошибка"));
          }
     }
}

export const GetMasterById = (id: string): AppThunk => async (dispatch, getState) => {
     const state = getState();

     if (state.masters.mastersById[id]) {
          return;
     }

     dispatch(sendMasterLoadReq());

     try {
          const response = await fetch(`${__BASE_API_URL__}/users/${id}`, {
               method: 'GET',
          });
          const data = await response.json();

          if (!response.ok) throw new Error(data?.error || "Неизвестная ошибка");

          dispatch(setMasterLoadSuccess(data));
     } catch (error) {
          if (error instanceof Error) {
               dispatch(setErrorAlert(error.message));
               dispatch(setMasterLoadFailure(error.message));
          } else {
               dispatch(setMasterLoadFailure("Неизвестная ошибка"));
          }
     }
};