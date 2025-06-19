import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GetSchedule } from "./Schedule.thunks";
import { useAppDispatch } from "../../hooks/hooks";
import { setConfirmCallbacks, showConfirm } from "../Confirm/Confirm.actions";
import { setErrorAlert, setSuccessAlert } from "../Alert/Alert.thunks";
import { CreateAppointment } from "../Appointments/Appointments.thunks";
import { combineDateTime, getLocalDateString } from "../../utils/dates";

export type ScheduleProps = {
     userId: string;
};

const Schedule = ({ userId }: ScheduleProps) => {
     const dispatch = useAppDispatch();
     const [selectedDate, setSelectedDate] = useState<Date>(new Date());
     const schedule = useSelector((state: RootState) => state.schedule.schedule);
     const loading = useSelector((state: RootState) => state.schedule.loading);
     const error = useSelector((state: RootState) => state.schedule.error);
     const token = useSelector((state: RootState) => state.auth.token);

     useEffect(() => {
          if (selectedDate) {
               const date = getLocalDateString(selectedDate);
               dispatch(GetSchedule(date, userId));
          }
     }, [selectedDate, dispatch, userId]);

     const handleSlotClick = (slot: string) => {
          dispatch(showConfirm(`Вы хотите записаться ${getLocalDateString(selectedDate)} на ${slot}?`));
          dispatch(setConfirmCallbacks(
               () => {
                    if (!token) {
                         dispatch(setErrorAlert("Нужно быть авторизованным для записи"));
                         return;
                    }

                    const scheduled_at = combineDateTime(selectedDate, slot);
                    dispatch(CreateAppointment(token, {
                         master_id: parseInt(userId),
                         time: scheduled_at,
                    }));

                    dispatch(setSuccessAlert("Успешно записались!"));
               },
               () => { }
          ));
     };

     return (
          <div className="p-6 max-w-2xl mx-auto">
               <h1 className="text-2xl font-bold mb-6 text-center">Выберите дату для записи</h1>

               <div className="flex justify-center">
                    <Calendar
                         onChange={(date) => setSelectedDate(date as Date)}
                         value={selectedDate}
                         calendarType="iso8601"
                         className="rounded-lg shadow-lg calendar-container"
                    />
               </div>

               {loading && <p className="mt-4 text-center">Загрузка слотов...</p>}
               {error && <p className="mt-4 text-center text-red-500">{error}</p>}

               {!loading && schedule && schedule?.slots?.length > 0 && (
                    <div className="mt-6">
                         <h2 className="text-xl font-semibold mb-2">Доступное время:</h2>
                         <div className="slots">
                              {schedule.slots
                                   .filter(slot => !schedule.appointments ? true : !schedule.appointments.includes(slot))
                                   .map(slot => (
                                        <button
                                             key={slot}
                                             onClick={() => handleSlotClick(slot)}
                                             style={{ marginRight: 8, marginBottom: 8 }}
                                        >
                                             {slot}
                                        </button>
                                   ))}
                         </div>
                    </div>
               )}

               {!loading && selectedDate && (!schedule?.slots || schedule?.slots.length === 0)  && (
                    <p className="mt-4 text-gray-500 text-center">Нет доступных слотов на выбранную дату.</p>
               )}
          </div>
     );
};

export default Schedule;
