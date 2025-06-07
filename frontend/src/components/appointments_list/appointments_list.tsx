import { useEffect, useState } from "react";
import { api, API_BASE, type Appointment, type User } from "../../api/api_client";
import { getIdFromToken, getUsernameFromToken } from "../../helper/helper";
import { Avatar } from "../avatar/avatar";
import Notification from "../notification/notification";

export const AppointmentsList: React.FC = () => {
     const [token, setToken] = useState<string | null>(null);
     const [appointments, setAppointments] = useState<Appointment[]>([]);
     const [mastersById, setMastersById] = useState<Record<number, User>>({});
     const [username, setUsername] = useState<string | null>(null);
     const [id, setUserId] = useState<number | null>(null);
     const [user, setUser] = useState<User | null>(null);

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


     return (
          <section className="section">
               <h3>Текущие записи</h3>
               {appointments.length === 0 ? (
                    <p>Нет записей</p>
               ) : (
                    <div className="appointments-list">
                         {appointments.map((app) => {
                              const master = mastersById[app.master_id];
                              return (
                                   <div key={app.id} className="appointment-card">
                                        {master && (
                                             <Avatar
                                                  name={master.full_name}
                                                  src={`${API_BASE}/users/${master.id}/avatar`}
                                                  className="avatar"
                                             />
                                        )}
                                        <p><strong>Номер записи:</strong> {app.id}</p>
                                        <p>
                                             <strong>Мастер:</strong>{" "}
                                             {master
                                                  ? `${master.full_name} (${master.specialization || "N/A"})`
                                                  : app.master_id}
                                        </p>
                                        <p>
                                             <strong>Дата и время:</strong>{" "}
                                             {new Date(app.scheduled_at).toLocaleString("ru-RU", {
                                                  day: "numeric",
                                                  month: "long",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  timeZone: "UTC",
                                             })}
                                        </p>
                                        <button onClick={() => handleCancelAppointment(app.id)}>
                                             Отменить
                                        </button>
                                   </div>
                              );
                         })}
                    </div>
               )}
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
