import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store/store";
import {
     appointmentsLoadRequest,
     appointmentsLoadSuccess,
     appointmentsLoadFailure,
     appointmentCreateSuccess,
     appointmentDeleteSuccess,
     AppointmentsActionTypes,
} from "./Appointments.actions";
import { setErrorAlert, setSuccessAlert } from "../Alert/Alert.thunks";

export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     AppointmentsActionTypes
>;

export const GetAppointments = (token: string): AppThunk => async (dispatch) => {
     dispatch(appointmentsLoadRequest());
     try {
          const res = await fetch(`${__BASE_API_URL__}/appointments`, {
               headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Ошибка загрузки записей");

          dispatch(appointmentsLoadSuccess(data));
     } catch (err) {
          const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
          dispatch(appointmentsLoadFailure(msg));
     }
};

export const CreateAppointment = (
     token: string,
     appointment: IAppointmentInput
): AppThunk => async (dispatch) => {
     try {
          const res = await fetch(`${__BASE_API_URL__}/appointments`, {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(appointment),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Ошибка при записи");

          dispatch(appointmentCreateSuccess(data));
     } catch (err) {
          const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
     }
};

export const DeleteAppointment = (
     token: string,
     id: number
): AppThunk => async (dispatch) => {
     try {
          const res = await fetch(`${__BASE_API_URL__}/appointments/${id}`, {
               method: "DELETE",
               headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
               const data = await res.json();
               throw new Error(data?.error || "Ошибка при удалении записи");
          }

          dispatch(appointmentDeleteSuccess(id));
          dispatch(setSuccessAlert("Запись успешно удалена!"));
     } catch (err) {
          const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
          dispatch(setErrorAlert(msg));
     }
};
