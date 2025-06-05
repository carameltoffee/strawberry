import { useEffect, useState } from "react";
import { api, type SetDayOffInput, type SetWorkingSlotsInput, type Schedule, type User } from "../api/api_client";
import Notification from "../components/notification/notification";
import {getIdFromToken, getUsernameFromToken} from "../helper/helper"

export default function ProfilePage() {
     const [token, setToken] = useState<string | null>(null);
     const [username, setUsername] = useState<string | null>(null);
     const [id, setUserId] = useState<number | null>(null);
     const [user, setUser] = useState<User | null>(null);
     const [date, setDate] = useState<string>("");
     const [schedule, setSchedule] = useState<Schedule | null>(null);
     const [slots, setSlots] = useState<string[]>([]);
     const [weekday, setWeekday] = useState<string>("monday");

     const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

     const showSuccess = (message: string) => setNotification({ message, type: "success" });
     const showError = (err: unknown) => {
          const message = err instanceof Error ? err.message : "Unknown error";
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

               api.getMasterByUsername(username).then((user) => {
                    if (user) {
                         setUser(user);
                    }
               }).catch(showError);
          }
     }, []);

     const loadSchedule = () => {
          if (token && id && date) {
               api.getSchedule(token, id, date)
                    .then(setSchedule)
                    .catch(showError);
          }
     };

     const handleSetDayOff = () => {
          if (!token || !date) return;

          const input: SetDayOffInput = { date, is_day_off: true };
          api.setDayOff(token, input)
               .then(() => showSuccess("Day off set"))
               .catch(showError);
     };

     const handleDeleteDayOff = () => {
          if (!token || !date) return;

          const input: SetDayOffInput = { date, is_day_off: false };
          api.setDayOff(token, input)
               .then(() => showSuccess("Day off removed"))
               .catch(showError);
     };

     const handleSetWorkingSlotsForDate = () => {
          if (!token || !date || slots.length === 0) return;

          api.setDateWorkingSlots(token, { date, slots })
               .then(() => showSuccess("Working slots set for date"))
               .catch(showError);
     };

     const handleSetWorkingSlotsForWeekday = () => {
          if (!token || slots.length === 0) return;

          const input: SetWorkingSlotsInput = { day_of_week: weekday, slots };
          api.setWeeklyWorkingSlots(token, input)
               .then(() => showSuccess("Working slots set for weekday"))
               .catch(showError);
     };

     return (
          <div>
               <h2>Profile Page</h2>

               {user && (
                    <div>
                         <p><strong>Full Name:</strong> {user.full_name}</p>
                         <p><strong>Username:</strong> {user.username}</p>
                         <p><strong>Specialization:</strong> {user.specialization || "N/A"}</p>
                         <p><strong>Rating:</strong> {user.average_rating ?? "N/A"}</p>
                    </div>
               )}

               <div>
                    <label>
                         Date (YYYY-MM-DD):{" "}
                         <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                         />
                    </label>
                    <button onClick={loadSchedule}>Load Schedule</button>
               </div>

               {schedule && (
                    <div>
                         <h4>Schedule for {date}</h4>
                         <p><strong>Days off:</strong> {schedule.days_off.join(", ")}</p>
                         <p><strong>Available slots:</strong> {schedule.slots.join(", ")}</p>
                         <p><strong>Appointments:</strong> {schedule.appointments.join(", ")}</p>
                    </div>
               )}

               <div>
                    <button onClick={handleSetDayOff}>Set Day Off</button>
                    <button onClick={handleDeleteDayOff}>Remove Day Off</button>
               </div>

               <div>
                    <h4>Set Working Slots</h4>
                    <label>
                         Slots (comma-separated):{" "}
                         <input
                              type="text"
                              value={slots.join(",")}
                              onChange={(e) => setSlots(e.target.value.split(",").map(s => s.trim()))}
                         />
                    </label>
                    <div>
                         <button onClick={handleSetWorkingSlotsForDate}>Set for Date</button>
                    </div>
                    <div>
                         <label>
                              Weekday:{" "}
                              <select value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                                   {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                                        <option key={day} value={day}>{day}</option>
                                   ))}
                              </select>
                         </label>
                         <button onClick={handleSetWorkingSlotsForWeekday}>Set for Weekday</button>
                    </div>
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
