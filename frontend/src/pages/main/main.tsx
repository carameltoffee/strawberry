import React, { useEffect, useState, useMemo } from "react";
import { api, type User } from "../../api/api_client";
import styles from "./main.module.css";
import { Link } from "react-router-dom";
import { getIdFromToken } from "../../helper/helper";
import { StarRating } from "../../components/stars/stars";
import Notification from "../../components/notification/notification";
import { Avatar } from "../../components/avatar/avatar";

export const Main: React.FC = () => {
     const [masters, setMasters] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [searchQuery, setSearchQuery] = useState("");
     const [avatars, setAvatars] = useState<Record<number, string>>({}); 
     const token = localStorage.getItem("token");
     const userId = token ? getIdFromToken(token) : null;

     useEffect(() => {
          async function fetchMasters() {
               try {
                    setLoading(true);
                    const data = await api.getMasters();
                    setMasters(data);

                    const avatarPromises = data.map(async (master) => {
                         try {
                              const blob = await api.getUserAvatar(master.id);
                              return { id: master.id, url: URL.createObjectURL(blob) };
                         } catch {
                              return { id: master.id, url: "" }; 
                         }
                    });

                    const avatarsData = await Promise.all(avatarPromises);

                    const avatarsMap: Record<number, string> = {};
                    avatarsData.forEach(({ id, url }) => {
                         if (url) avatarsMap[id] = url;
                    });

                    setAvatars(avatarsMap);
               } catch (err: any) {
                    console.error("Failed to fetch masters:", err);
                    setError(err.message || "Unknown error");
               } finally {
                    setLoading(false);
               }
          }

          fetchMasters();

          return () => {
               Object.values(avatars).forEach(URL.revokeObjectURL);
          };
     }, []);

     const filteredMasters = useMemo(() => {
          const q = searchQuery.trim().toLowerCase();
          return masters.filter((master) => {
               const matchesQuery =
                    master.full_name.toLowerCase().includes(q) ||
                    master.specialization?.toLowerCase().includes(q);
               const notSelf = userId === null || master.id !== userId;
               return matchesQuery && notSelf;
          });
     }, [masters, searchQuery, userId]);

     if (loading) return <div className={styles.page}>Загрузка мастеров...</div>;

     return (
          <div className={styles.page}>
               <h1 className={styles.title}>Мастера</h1>

               {error && (
                    <Notification
                         message={`Ошибка загрузки мастеров: ${error}`}
                         type="error"
                         onClose={() => setError(null)}
                    />
               )}

               <div className={styles.filters}>
                    <input
                         type="text"
                         placeholder="Поиск по имени или специальности"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className={styles.input}
                    />
               </div>

               <div className={styles.grid}>
                    {filteredMasters.map((master) => (
                         <Link key={master.id} to={`/reservation/${master.id}`} className={styles.card}>
                              {avatars[master.id] ? (
                                   <Avatar 
                                        name={master.full_name} 
                                        src={avatars[master.id]}                                        
                                   />
                              ) : (
                                   <div className={styles.avatarPlaceholder}>
                                   </div>
                              )}

                              <div className={styles.name}>{master.full_name}</div>
                              {master.specialization && <div className={styles.specialization}>{master.specialization}</div>}
                              {typeof master.average_rating === "number" && (
                                   <div className={styles.rating}>
                                        <StarRating rating={master.average_rating} />
                                        {master.average_rating.toFixed(1)}
                                   </div>
                              )}
                         </Link>
                    ))}
               </div>
          </div>
     );
};
