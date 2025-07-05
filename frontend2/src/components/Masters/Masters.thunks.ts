import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store/store";
import { MastersActionTypes, sendMasterLoadReq, sendMastersLoadReq, setMasterLoadFailure, setMasterLoadSuccess, setMastersLoadFailure, setMastersLoadSuccess } from "./Masters.actions";
import { setErrorAlert, setSuccessAlert } from "../Alert/Alert.thunks";

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

export const UpdateMaster = (data: {
     id?: number;
     full_name?: string;
     username?: string;
     email?: string;
     bio?: string;
     specialization?: string;
     registered_at?: string;
}, token: string): AppThunk => async (dispatch) => {
     try {
          const response = await fetch(`${__BASE_API_URL__}/users`, {
               method: "PUT",
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
               },
               body: JSON.stringify(data),
          });

          if (response.ok) {
               dispatch(setSuccessAlert("Успешно сохранено"));
               dispatch(setMasterLoadSuccess(data as IUser)); 
               return;
          } 

          const resData = await response.json();

          if (!response.ok) throw new Error(resData?.error || "Ошибка при обновлении");

     } catch (error) {
          const message = error instanceof Error ? error.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(message));
     }
};
