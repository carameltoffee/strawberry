import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./reservation.module.css";
import { api, API_BASE, type User } from "../../api/api_client";
import Notification from "../../components/notification/notification";
import WorksSlider from "../../components/img_slider/img_slider";

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
     const [works, setWorks] = useState<string[]>([]);
     const { id } = useParams<{ id: string }>();
     const masterId = id ? Number(id) : NaN;
     const [master, setMaster] = useState<User | null>(null);
     const [loadingMaster, setLoadingMaster] = useState(true);
     const [date, setDate] = useState<Date | null>(new Date());
     const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
     const [loadingSchedule, setLoadingSchedule] = useState(false);
     const [notification, setNotification] = useState<{
          message: string;
          type: "success" | "error";
     } | null>(null);

     const showSuccess = (message: string) => setNotification({ message, type: "success" });
     const showError = (err: unknown) => {
          const message = err instanceof Error ? err.message : "Неизвестная ошибка";
          setNotification({ message, type: "error" });
     };

     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

     if (!id || isNaN(masterId)) {
          return <div>Ошибка: неверный или отсутствующий мастер ID в URL</div>;
     }

     useEffect(() => {
          async function fetchWorks() {
               try {
                    const w = await api.getUserWorkIds(masterId);
                    setWorks(w);
               } catch (err) {
                    showError(err);
                    setWorks([]);
               }
          }

          if (!isNaN(masterId)) {
               fetchWorks();
          }
     }, [masterId]);


     useEffect(() => {
          async function fetchMaster() {
               if (!token || isNaN(masterId)) return;
               try {
                    setLoadingMaster(true);
                    const m = await api.getMasterById(masterId);
                    setMaster(m);
               } catch (err) {
                    showError(err);
                    setMaster(null);
               } finally {
                    setLoadingMaster(false);
               }
          }

          fetchMaster();
     }, [masterId, token]);


     const handleDateChange = (newDate: Value) => {
          if (Array.isArray(newDate)) {
               setDate(newDate[0] || null);
          } else {
               setDate(newDate);
          }
          setSchedule(null);
     };


     const handleBookTime = async (time: string) => {
          if (!token) return showError("Зарегестрируйтесь, чтобы записаться");
          if (!date) return;

          const dateStr = getLocalDateString(date);
          const datetime = `${dateStr} ${time}`;

          try {
               const res = await api.createAppointment(token, {
                    master_id: masterId,
                    time: datetime,
               });
               showSuccess(`Создана запись с кодом: ${res.id}`)
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
                    {loadingMaster ? (
                         <p>Загрузка информации о мастере...</p>
                    ) : master ? (
                         <div>
                              <h2>{master.full_name}</h2>
                              {master.specialization && <p>Специализация: {master.specialization}</p>}
                              {typeof master.average_rating === "number" && (
                                   <p>Рейтинг: {master.average_rating.toFixed(1)}</p>
                              )}
                              {Array.isArray(works) && works.length > 0 && (
                                   <div className={styles.worksSection}>
                                        <WorksSlider works={works} master={master} API_BASE={API_BASE} />
                                   </div>
                              )}
                         </div>
                    ) : (
                         <p>Не удалось загрузить информацию о мастере.</p>
                    )}
               </div>

               {notification && (
                    <Notification
                         message={notification.message}
                         type={notification.type}
                         onClose={() => setNotification(null)}
                    />
               )}

          </div>
     );
};

export default Reservation;