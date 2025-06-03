import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./reservation.module.css";
import { api } from "../../api/api_client";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface TodaySchedule {
     days_off: string[];
     slots: string[];
     appointments: string[];
}

const getLocalDateString = (date: Date) => {
     const year = date.getFullYear();
     const month = (date.getMonth() + 1).toString().padStart(2, "0");
     const day = date.getDate().toString().padStart(2, "0");
     return `${year}-${month}-${day}`;
};

const Reservation: React.FC = () => {
     const { id } = useParams<{ id: string }>();
     const masterId = id ? Number(id) : NaN;

     const [date, setDate] = useState<Date | null>(new Date());
     const [secretCode, setSecretCode] = useState<string>("");
     const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
     const [loadingSchedule, setLoadingSchedule] = useState(false);

     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

     if (!id || isNaN(masterId)) {
          return <div>Ошибка: неверный или отсутствующий мастер ID в URL</div>;
     }

     const handleDateChange = (newDate: Value) => {
          if (Array.isArray(newDate)) {
               setDate(newDate[0] || null);
          } else {
               setDate(newDate);
          }
          setSchedule(null);
     };

     const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          setSecretCode(event.target.value);
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          if (!token) return alert("Please log in first");

          try {
               await api.deleteAppointment(token, Number(secretCode));
          } catch (err) {
               console.log(err);
          }
     };

     const handleBookTime = async (time: string) => {
          if (!token) return alert("Please log in first");
          if (!date) return;

          const dateStr = getLocalDateString(date);
          const datetime = `${dateStr} ${time}`;

          try {
               const res = await api.createAppointment(token, {
                    master_id: masterId,
                    time: datetime,
               });
               alert("Appointment created. ID: " + res.id);
               fetchSchedule(date);
          } catch (err: any) {
               alert("Failed to book: " + err.message);
          }
     };

     const fetchSchedule = async (date: Date) => {
          if (!token) return;
          setLoadingSchedule(true);
          const dateStr = getLocalDateString(date);
          try {
               const sched = await api.getSchedule(token, masterId, dateStr);
               setSchedule(sched);
          } catch {
               setSchedule(null);
          } finally {
               setLoadingSchedule(false);
          }
     };

     useEffect(() => {
          if (date) {
               fetchSchedule(date);
          }
     }, [date, masterId]);

     const dateStr = date ? getLocalDateString(date) : "";

     const isDayOff =
          schedule && Array.isArray(schedule.days_off)
               ? schedule.days_off.includes(dateStr)
               : false;

     return (
          <div className={styles.container}>
               <div className={styles.leftSide}>
                    <h2>Выберите дату</h2>
                    <Calendar
                         onChange={handleDateChange}
                         value={date}
                         className={styles.reactCalendar}
                    />

                    {loadingSchedule ? (
                         <p>Загрузка времени...</p>
                    ) : isDayOff ? (
                         <p className={styles.noTimes}>Выбранный день — выходной</p>
                    ) : schedule && Array.isArray(schedule.slots) && schedule.slots.length > 0 ? (
                         <div className={styles.timeSlots}>
                              <h3>Доступное время:</h3>
                              <ul className={styles.timeList}>
                                   {schedule.slots.map((time) => {
                                        const isBooked =
                                             schedule.appointments &&
                                             Array.isArray(schedule.appointments) &&
                                             schedule.appointments.includes(time);

                                        return (
                                             <li key={time}>
                                                  <button
                                                       className={styles.timeButton}
                                                       onClick={() => handleBookTime(time)}
                                                       disabled={!!isBooked}
                                                       title={isBooked ? "Время занято" : undefined}
                                                  >
                                                       {time} {isBooked ? "(занято)" : ""}
                                                  </button>
                                             </li>
                                        );
                                   })}
                              </ul>
                         </div>
                    ) : (
                         <p className={styles.noTimes}>Нет доступного времени на выбранную дату</p>
                    )}
               </div>

               <div className={styles.rightSide}>
                    <h2>Уже записаны? Введите номер записи для отмены</h2>
                    <form onSubmit={handleSubmit}>
                         <input
                              type="text"
                              placeholder="код записи"
                              value={secretCode}
                              onChange={handleCodeChange}
                              className="input"
                         />
                         <button type="submit" className={styles.button}>
                              Отменить запись
                         </button>
                    </form>
                    {/* <p className="success">Запись отменена!</p> */}
               </div>
          </div>
     );
};

export default Reservation;
