import { useEffect, useState } from "react";
import { api, type SetDayOffInput, type SetWorkingSlotsInput } from "../../api/api_client";
import Notification from "../notification/notification";

export const ScheduleChanger: React.FC = () => {
     const [token, setToken] = useState<string | null>(null);
     const [dateDayOff, setDateDayOff] = useState<string>("");
     const [workingDate, setWorkingDate] = useState<string>("");
     const [slots, setSlots] = useState<string[]>([]);
     const [weekday, setWeekday] = useState<string>("monday");

     useEffect(() => {
          const localToken = localStorage.getItem("token");
          if (localToken) {
               setToken(localToken);
          }
     }, []);

     const [notification, setNotification] = useState<{
          message: string;
          type: "success" | "error";
     } | null>(null);

     const showSuccess = (message: string) => setNotification({ message, type: "success" });
     const showError = (err: unknown) => {
          const message = err instanceof Error ? err.message : "Неизвестная ошибка";
          setNotification({ message, type: "error" });
     };

     const handleSetDayOff = () => {
          if (!token || !dateDayOff) return;

          const input: SetDayOffInput = { date: dateDayOff, is_day_off: true };
          api
               .setDayOff(token, input)
               .then(() => showSuccess("Выходной установлен"))
               .catch(showError);
     };

     const handleDeleteDayOff = () => {
          if (!token || !dateDayOff) return;

          const input: SetDayOffInput = { date: dateDayOff, is_day_off: false };
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
          <section className="section">
               {/* <h3>Управление расписанием</h3> */}
               <div className="form-actions">
                    <label htmlFor="dayOffDate">Дата:</label>
                    <input
                         id="dayOffDate"
                         type="date"
                         value={dateDayOff}
                         onChange={(e) => setDateDayOff(e.target.value)}
                    />
                    <button onClick={handleSetDayOff}>Установить выходной</button>
                    <button onClick={handleDeleteDayOff}>Удалить выходной</button>
               </div>

               <div className="form-group">
                    <h4>Установка рабочего времени</h4>

                    <label>Время:</label>
                    <div>
                         {slots.map((slot, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                   <input
                                        type="time"
                                        value={slot}
                                        onChange={(e) => {
                                             const newSlots = [...slots];
                                             newSlots[idx] = e.target.value;
                                             setSlots(newSlots);
                                        }}
                                        style={{ marginRight: 8 }}
                                   />
                                   <button
                                        type="button"
                                        onClick={() => {
                                             const newSlots = slots.filter((_, i) => i !== idx);
                                             setSlots(newSlots);
                                        }}
                                        aria-label="Удалить время"
                                   >
                                        ×
                                   </button>
                              </div>
                         ))}
                         <button
                              type="button"
                              onClick={() => setSlots([...slots, "09:00"])}
                              style={{ marginTop: 8 }}
                         >
                              Добавить время
                         </button>
                    </div>

                    <div className="form-subgroup" style={{ marginTop: 16 }}>
                         <div className="form-subgroup-item" style={{ marginBottom: 12 }}>
                              <label htmlFor="weekday">День недели:</label>
                              <select
                                   id="weekday"
                                   value={weekday}
                                   onChange={(e) => setWeekday(e.target.value)}
                                   style={{ marginLeft: 8 }}
                              >
                                   {Object.keys(weekdayMap).map((day) => (
                                        <option key={day} value={day}>
                                             {weekdayMap[day]}
                                        </option>
                                   ))}
                              </select>

                              <label htmlFor="workingDate" style={{ marginLeft: 24 }}>
                                   Дата:
                              </label>
                              <input
                                   id="workingDate"
                                   type="date"
                                   value={workingDate}
                                   onChange={(e) => setWorkingDate(e.target.value)}
                                   style={{ marginLeft: 8 }}
                              />
                         </div>

                         <div className="form-subgroup-item">
                              <button onClick={handleSetWorkingSlotsForWeekday}>Установить для дня недели</button>
                              <button onClick={handleSetWorkingSlotsForDate} style={{ marginLeft: 12 }}>
                                   Установить для даты
                              </button>
                         </div>
                    </div>
               </div>
               {notification && (
                    <Notification
                         message={notification.message}
                         type={notification.type}
                         onClose={() => setNotification(null)}
                    />
               )}
          </section>
     );
}