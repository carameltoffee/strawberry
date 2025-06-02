import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./reservation.module.css";
import { api } from "../../api/api_client";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Reservation: React.FC = () => {
     const { id } = useParams<{ id: string }>();
     const masterId = id ? Number(id) : NaN;

     const [date, setDate] = useState<Date | null>(new Date());
     const [secretCode, setSecretCode] = useState<string>("");
     const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
     const [availableTimes, setAvailableTimes] = useState<string[]>([]);
     const [loadingTimes, setLoadingTimes] = useState(false);
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
     };

     const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          setSecretCode(event.target.value);
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          if (!token) return alert("Please log in first");

          try {
               await api.deleteAppointment(token, Number(secretCode));
               setIsCodeValid(true);
          } catch (err) {
               setIsCodeValid(false);
          }
     };

     const handleBookTime = async (time: string) => {
          if (!token) return alert("Please log in first");
          if (!date) return;

          const dateStr = date.toISOString().split("T")[0];
          const datetime = `${dateStr}T${time}`;

          try {
               const res = await api.createAppointment(token, {
                    master_id: masterId,
                    time: datetime,
               });
               alert("Appointment created. ID: " + res.id);
          } catch (err: any) {
               alert("Failed to book: " + err.message);
          }
     };

     // Uncomment and update useEffect if needed
     /*
     useEffect(() => {
       const fetchTimes = async () => {
         if (!date) return;
         setLoadingTimes(true);
         const dateStr = date.toISOString().split("T")[0];
   
         try {
           const times = await api.getAvailableTimes(masterId, dateStr);
           setAvailableTimes(times);
         } catch (err) {
           setAvailableTimes([]);
         } finally {
           setLoadingTimes(false);
         }
       };
   
       fetchTimes();
     }, [date, masterId]);
     */

     return (
          <div className={styles.container}>
               <div className={styles.leftSide}>
                    <h2>Выберите дату</h2>
                    <Calendar onChange={handleDateChange} value={date} className={styles.reactCalendar} />

                    {loadingTimes ? (
                         <p>Загрузка времени...</p>
                    ) : availableTimes.length > 0 ? (
                         <div className={styles.timeSlots}>
                              <h3>Доступное время:</h3>
                              <ul className={styles.timeList}>
                                   {availableTimes.map((time) => (
                                        <li key={time}>
                                             <button className={styles.timeButton} onClick={() => handleBookTime(time)}>
                                                  {time}
                                             </button>
                                        </li>
                                   ))}
                              </ul>
                         </div>
                    ) : (
                         date && <p className={styles.noTimes}>Нет доступного времени на выбранную дату</p>
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
                    {isCodeValid === true && <p className="success">Запись отменена!</p>}
                    {isCodeValid === false && <p className="error">Неверный номер!</p>}
               </div>
          </div>
     );
};

export default Reservation;
