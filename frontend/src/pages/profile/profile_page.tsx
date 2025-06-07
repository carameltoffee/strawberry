import { useEffect, useRef, useState } from "react";
import {
     api,
     type SetDayOffInput,
     type SetWorkingSlotsInput,
     type Schedule,
     type User,
     type Appointment,
     API_BASE,
} from "../../api/api_client";
import Notification from "../../components/notification/notification";
import { getIdFromToken, getUsernameFromToken } from "../../helper/helper";
import "./profile_page.css";
import { Avatar } from "../../components/avatar/avatar";
import { StarRating } from "../../components/stars/stars";
import { WorksChanger } from "../../components/works_changer/works_adder";
import { ScheduleChanger } from "../../components/schedule_changer/schedule_changer";
import { AppointmentsList } from "../../components/appointments_list/appointments_list";

type TabKey = "profile" | "schedule" | "appointments" | "portfolio";

export default function ProfilePage() {
     const [activeTab, setActiveTab] = useState<TabKey>("profile");
     const [token, setToken] = useState<string | null>(null);
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
               api
                    .getMasterByUsername(username)
                    .then((user) => {
                         if (user) {
                              setUser(user);
                         }
                    })
                    .catch(showError);
          }
     }, []);

     const inputRef = useRef<HTMLInputElement>(null);

     const renderPortfolioTab = () => {
          return (
               <section className="section">
                    <WorksChanger />
               </section>
          );
     };

     const renderTabContent = () => {
          switch (activeTab) {
               case "schedule":
                    if (user?.specialization === "user") return <p>Расписание доступно только для специалистов.</p>;
                    return <ScheduleChanger />
               case "appointments":
                    return <AppointmentsList/>
               case "portfolio":
                    return renderPortfolioTab();
               default:
                    return null;
          }
     };

     return (
          <div className="profile-page">
               <div className="profile-layout">
                    <section className="profile-sidebar">
                         {user && (
                              <>
                                   <div className="avatar-upload-wrapper">
                                        <Avatar
                                             name={user.full_name}
                                             src={`${API_BASE}/users/${user.id}/avatar?${Date.now()}`}
                                             className="avatar"
                                        />
                                        <div
                                             className="avatar-upload-overlay"
                                             onClick={() => inputRef.current?.click()}
                                        >
                                             <span>Изменить аватар</span>
                                        </div>
                                        <input
                                             ref={inputRef}
                                             type="file"
                                             accept="image/*"
                                             className="avatar-upload-input"
                                             onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file || !token) return;

                                                  api.uploadUserAvatar(token, file)
                                                       .then(() => {
                                                            showSuccess("Аватар обновлён");
                                                            setUser((prev) => (prev ? { ...prev } : prev));
                                                       })
                                                       .catch(showError);
                                             }}
                                        />
                                   </div>

                                   <p><strong>Имя:</strong> {user.full_name}</p>
                                   <p><strong>Логин:</strong> {user.username}</p>
                                   {user.specialization !== "user" && (
                                        <p><strong>Специализация:</strong> {user.specialization || "N/A"}</p>
                                   )}
                                   {user.average_rating && (
                                        <div className="rating">
                                             <StarRating rating={user.average_rating || 0} />
                                             {user.average_rating.toFixed(1)}
                                        </div>
                                   )}
                              </>
                         )}
                    </section>

                    <div className="profile-main">
                         <div className="tabs">
                              {user?.specialization !== "user" && (
                                   <>
                                        <button
                                             onClick={() => setActiveTab("portfolio")}
                                             className={activeTab === "portfolio" ? "active" : ""}
                                        >
                                             Портфолио
                                        </button>
                                        <button
                                             onClick={() => setActiveTab("schedule")}
                                             className={activeTab === "schedule" ? "active" : ""}
                                        >
                                             Расписание
                                        </button>
                                   </>
                              )}

                              <button
                                   onClick={() => setActiveTab("appointments")}
                                   className={activeTab === "appointments" ? "active" : ""}
                              >
                                   Записи
                              </button>
                         </div>

                         <div className="profile-content">
                              {renderTabContent()}
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
          </div>
     );

}
