import { useEffect, useState } from "react";
import {
     api,
     type SetDayOffInput,
     type SetWorkingSlotsInput,
     type Schedule,
     type User,
     type Appointment,
} from "../../api/api_client";
import Notification from "../../components/notification/notification";
import { getIdFromToken, getUsernameFromToken } from "../../helper/helper";
import "./profile_page.css";

export default function ProfilePage() {
     const [token, setToken] = useState<string | null>(null);
     const [username, setUsername] = useState<string | null>(null);
     const [id, setUserId] = useState<number | null>(null);
     const [user, setUser] = useState<User | null>(null);
     const [date, setDate] = useState<string>("");
     const [workingDate, setWorkingDate] = useState<string>("");
     const [schedule, setSchedule] = useState<Schedule | null>(null);
     const [slots, setSlots] = useState<string[]>([]);
     const [weekday, setWeekday] = useState<string>("monday");

     const [appointments, setAppointments] = useState<Appointment[]>([]);
     const [mastersById, setMastersById] = useState<Record<number, User>>({});

     const [notification, setNotification] = useState<{
          message: string;
          type: "success" | "error";
     } | null>(null);

     const showSuccess = (message: string) => setNotification({ message, type: "success" });
     const showError = (err: unknown) => {
          const message = err instanceof Error ? err.message : "Неизвестная ошибка";
          setNotification({ message, type: "error" });
     };

     useEffect(() => {
          const storedToken = localStorage.getItem("token");
          if (!storedToken) return;

          const id = getIdFromToken(storedToken);
          const username = getUsernameFromToken(storedToken);

          if (storedToken && username && id) {
               setToken(storedToken);
               setUsername(username);
               setUserId(id);

               api
                    .getMasterByUsername(username)
                    .then((user) => {
                         if (user) {
                              setUser(user);
                         }
                    })
                    .catch(showError);

               api
                    .getAppointments(storedToken)
                    .then((appointments) => {
                         const apps = Array.isArray(appointments) ? appointments : [];
                         setAppointments(apps);

                         const uniqueMasterIds = Array.from(new Set(apps.map((a) => a.master_id)));

                         Promise.all(
                              uniqueMasterIds.map((masterId) =>
                                   api.getMasterById(masterId).catch(() => null)
                              )
                         ).then((masters) => {
                              const mastersMap: Record<number, User> = {};
                              masters.forEach((master) => {
                                   if (master) {
                                        mastersMap[master.id] = master;
                                   }
                              });
                              setMastersById(mastersMap);
                         });
                    })
                    .catch(showError);
          }
     }, []);

     const loadSchedule = () => {
          if (token && id && date) {
               api
                    .getSchedule(token, id, date)
                    .then(setSchedule)
                    .catch(showError);
          }
     };

     const handleSetDayOff = () => {
          if (!token || !date) return;

          const input: SetDayOffInput = { date, is_day_off: true };
          api
               .setDayOff(token, input)
               .then(() => showSuccess("Выходной установлен"))
               .catch(showError);
     };

     const handleDeleteDayOff = () => {
          if (!token || !date) return;

          const input: SetDayOffInput = { date, is_day_off: false };
          api
               .setDayOff(token, input)
               .then(() => showSuccess("Выходной удалён"))
               .catch(showError);
     };

     const handleSetWorkingSlotsForDate = () => {
          if (!token || !workingDate || slots.length === 0) return;

          api
               .setDateWorkingSlots(token, { date: workingDate, slots })
               .then(() => showSuccess("Слоты для даты установлены"))
               .catch(showError);
     };

     const handleCancelAppointment = (appointmentId: number) => {
          if (!token) return;

          api
               .deleteAppointment(token, appointmentId)
               .then(() => {
                    showSuccess("Запись отменена");
                    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
               })
               .catch(showError);
     };


     const handleSetWorkingSlotsForWeekday = () => {
          if (!token || slots.length === 0) return;

          const input: SetWorkingSlotsInput = { day_of_week: weekday, slots };
          api
               .setWeeklyWorkingSlots(token, input)
               .then(() => showSuccess("Слоты для дня недели установлены"))
               .catch(showError);
     };

     const weekdayMap: Record<string, string> = {
          monday: "Понедельник",
          tuesday: "Вторник",
          wednesday: "Среда",
          thursday: "Четверг",
          friday: "Пятница",
          saturday: "Суббота",
          sunday: "Воскресенье",
     };

     return (
          <div className="profile-page">
               <div className="profile-columns">
                    <section className="profile-info section">
                         <h3>Профиль пользователя</h3>
                         {user && (
                              <>
                                   <p>
                                        <strong>Имя:</strong> {user.full_name}
                                   </p>
                                   <p>
                                        <strong>Логин:</strong> {user.username}
                                   </p>
                                   {user.specialization !== "user" && (
                                        <p>
                                             <strong>Специализация:</strong> {user.specialization || "N/A"}
                                        </p>
                                   )}
                                   <p>
                                        <strong>Рейтинг:</strong> {user.average_rating ?? "N/A"}
                                   </p>
                              </>
                         )}
                    </section>

                    {user?.specialization !=="user" && (
                         <section className="schedule-management section">
                              <div className="form-group">
                                   <label htmlFor="date">Дата:</label>
                                   <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                   />
                              </div>

                              {schedule && (
                                   <div className="form-group">
                                        <h4>Расписание на {date}</h4>
                                        <p>
                                             <strong>Выходные дни:</strong> {schedule.days_off.join(", ")}
                                        </p>
                                        <p>
                                             <strong>Доступные слоты:</strong> {schedule.slots.join(", ")}
                                        </p>
                                        <p>
                                             <strong>Записи:</strong> {schedule.appointments.join(", ")}
                                        </p>
                                   </div>
                              )}

                              <div className="form-actions">
                                   <button onClick={handleSetDayOff}>Установить выходной</button>
                                   <button onClick={handleDeleteDayOff}>Удалить выходной</button>
                              </div>

                              <div className="form-group">
                                   <h4>Установка рабочего времени</h4>

                                   <label htmlFor="slots">Время (через запятую):</label>
                                   <input
                                        id="slots"
                                        type="text"
                                        value={slots.join(",")}
                                        onChange={(e) =>
                                             setSlots(e.target.value.split(",").map((s) => s.trim()))
                                        }
                                   />

                                   <div className="form-subgroup">
                                        <div className="form-subgroup-item">
                                             <label htmlFor="weekday">День недели:</label>
                                             <select
                                                  id="weekday"
                                                  value={weekday}
                                                  onChange={(e) => setWeekday(e.target.value)}
                                             >
                                                  {Object.keys(weekdayMap).map((day) => (
                                                       <option key={day} value={day}>
                                                            {weekdayMap[day]}
                                                       </option>
                                                  ))}
                                             </select>

                                             <label htmlFor="workingDate">Дата:</label>
                                             <input
                                                  id="workingDate"
                                                  type="date"
                                                  value={workingDate}
                                                  onChange={(e) => setWorkingDate(e.target.value)}
                                             />
                                        </div>

                                        <div className="form-subgroup-item">
                                             <button onClick={handleSetWorkingSlotsForWeekday}>
                                                  Установить для дня недели
                                             </button>
                                             <button onClick={handleSetWorkingSlotsForDate}>
                                                  Установить для даты
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </section>
                    )}


                    <section className="appointments section">
                         <h3>Текущие записи</h3>
                         {appointments.length === 0 && <p>Нет записей</p>}
                         <div className="appointments-list">
                              {appointments.map((app) => {
                                   const master = mastersById[app.master_id];
                                   return (
                                        <div key={app.id} className="appointment-card">
                                             <p>
                                                  <strong>Номер записи:</strong> {app.id}
                                             </p>
                                             <p>
                                                  <strong>Мастер:</strong>{" "}
                                                  {master
                                                       ? `${master.full_name} (${master.specialization || "N/A"})`
                                                       : app.master_id}
                                             </p>
                                             <p>
                                                  <strong>Дата и время записи:</strong>{" "}
                                                  {new Date(app.scheduled_at).toLocaleString("ru-RU", {
                                                       day: "numeric",
                                                       month: "long",
                                                       year: "numeric",
                                                       hour: "2-digit",
                                                       minute: "2-digit",
                                                       timeZone: "UTC",
                                                  })}
                                             </p>
                                             <button onClick={() => handleCancelAppointment(app.id)}>Отменить</button>
                                        </div>

                                   );
                              })}
                         </div>
                    </section>
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
}
