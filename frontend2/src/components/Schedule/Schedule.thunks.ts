import { ThunkAction } from "redux-thunk";
import { deleteWorkingHoursDateSuccess, ScheduleActionTypes, sendScheduleLoadReq, setDayOffSuccess, setScheduleLoadFailure, setScheduleLoadSuccess, setWorkingHoursDateSuccess, setWorkingHoursWeekdaySuccess } from "./Schedule.actions";
import { RootState } from "../../store/store";
import { setErrorAlert, setSuccessAlert } from "../Alert/Alert.thunks";


export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     ScheduleActionTypes
>;


export const GetSchedule = (date: string, user_id: string): AppThunk => async (dispatch) => {
     dispatch(sendScheduleLoadReq());

     try {
          const params = new URLSearchParams({ date }).toString();
          const response = await fetch(`${__BASE_API_URL__}/schedule/${user_id}?${params}`, {
               method: 'GET',
          });

          if (!response.ok) {
               throw new Error(response.statusText);
          }

          const data = await response.json();

          if (!data.slots) {
               data.slots = [];
          }
          if (!data.appointments) {
               data.appointments = [];
          }
          if (!data.days_off) {
               data.days_off = [];
          }

          if (data.days_off?.includes(date)) {
               data.slots = [];
          }
          dispatch(setScheduleLoadSuccess(data));

     } catch (error) {
          if (error instanceof Error) {
               dispatch(setErrorAlert(error.message));
               dispatch(setScheduleLoadFailure(error.message));
          } else {
               dispatch(setScheduleLoadFailure("Неизвестная ошибка"));
          }
     }
};

export const setDayOff = (token: string, date: string): AppThunk => async (dispatch) => {
     try {
          const response = await fetch(`${__BASE_API_URL__}/schedule/dayoff`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
               },
               body: JSON.stringify({ date, is_day_off: true }),
          });

          if (!response.ok) throw new Error(await response.text());

          dispatch(setDayOffSuccess());
          dispatch(setSuccessAlert("Выходной успешно установлен"));
     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : "Неизвестная ошибка"));
     }
};

export const deleteDayOff = (token: string, date: string): AppThunk => async (dispatch) => {
     try {
          const response = await fetch(`${__BASE_API_URL__}/schedule/dayoff`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
               },
               body: JSON.stringify({ date, is_day_off: false }),
          });

          if (!response.ok) throw new Error(await response.text());

          dispatch(setDayOffSuccess());
          dispatch(setSuccessAlert("Выходной успешно снят"));
     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : "Неизвестная ошибка"));
     }
};

export const setWorkingHoursByDate = (
     token: string,
     date: string,
     slots: string[]
): AppThunk => async (dispatch) => {
     try {
          const response = await fetch(`${__BASE_API_URL__}/schedule/hours/date`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
               },
               body: JSON.stringify({ date, slots }),
          });

          if (!response.ok) throw new Error(await response.text());

          dispatch(setWorkingHoursDateSuccess());
          dispatch(setSuccessAlert("Рабочие часы по дате успешно установлены"));
     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : "Неизвестная ошибка"));
     }
};

export const deleteWorkingHoursByDate = (token: string, date: string): AppThunk => async (dispatch) => {
     try {
          const params = new URLSearchParams({ date });
          const response = await fetch(`${__BASE_API_URL__}/schedule/hours/date?${params}`, {
               method: 'DELETE',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
               },
          });

          if (!response.ok) throw new Error(await response.text());

          dispatch(deleteWorkingHoursDateSuccess());
          dispatch(setSuccessAlert("Рабочие часы по дате успешно удалены"));
     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : "Неизвестная ошибка"));
     }
};

export const setWorkingHoursByWeekday = (
     token: string,
     day_of_week: string,
     slots: string[]
): AppThunk => async (dispatch) => {
     try {
          const response = await fetch(`${__BASE_API_URL__}/schedule/hours/weekday`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
               },
               body: JSON.stringify({ day_of_week, slots }),
          });

          if (!response.ok) throw new Error(await response.text());

          dispatch(setWorkingHoursWeekdaySuccess());
          dispatch(setSuccessAlert("Рабочие часы по дню недели успешно установлены"));

     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : "Неизвестная ошибка"));
     }
};
