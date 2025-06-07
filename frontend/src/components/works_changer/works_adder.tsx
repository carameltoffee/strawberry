import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api, API_BASE } from "../../api/api_client";
import { getIdFromToken } from "../../helper/helper";
import Notification from "../notification/notification";
import styles from "./works_changer.module.css";

export const WorksChanger: React.FC = () => {
     const [works, setWorks] = useState<string[]>([]);
     const [token, setToken] = useState<string | null>(null);
     const [file, setFile] = useState<File | null>(null);
     const [notification, setNotification] = useState<{
          message: string;
          type: "success" | "error";
     } | null>(null);

     const user_id = token ? getIdFromToken(token) : null;

     const showSuccess = (message: string) =>
          setNotification({ message, type: "success" });

     const showError = (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err) || "Неизвестная ошибка";
          setNotification({ message, type: "error" });
     };

     const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
          const files = event.target.files;
          setFile(files?.[0] || null);
     };

     const getWorks = async () => {
          if (!token || !user_id) return;
          try {
               const fetchedWorks = await api.getUserWorkIds(user_id);
               setWorks(Array.isArray(fetchedWorks) ? fetchedWorks : []);
          } catch (err) {
               showError(err);
          }
     };

     useEffect(() => {
          const localToken = localStorage.getItem("token");
          if (localToken) {
               setToken(localToken);
          }
     }, []);

     useEffect(() => {
          if (token && user_id) getWorks();
     }, [token]);

     const handleAddWork = async (event: FormEvent) => {
          event.preventDefault();
          if (!file) {
               showError("Нет файла!");
               return;
          }
          if (!token) {
               showError("Не авторизован!");
               return;
          }
          try {
               await api.uploadUserWork(token, file);
               showSuccess("Файл успешно загружен");
               setFile(null);
               await getWorks();
          } catch (err) {
               showError(err);
          }
     };

     const handleDeleteWork = async (workId: string) => {
          if (!token) return;
          try {
               await api.deleteUserWork(token, workId);
               setWorks((prev) => prev.filter((w) => w !== workId));
               showSuccess("Запись удалена!");
          } catch (err) {
               showError(err);
          }
     };

     return (
          <>
               <form onSubmit={handleAddWork} className={styles.uploadForm}>
                    <input type="file" onChange={handleFileChange} className={styles.uploadInput} />
                    <button type="submit" className={styles.uploadButton}>Загрузить</button>
               </form>
               <div className={styles.portfolioGrid}>
                    {works.map((workId) => (
                         <div key={workId} className={styles.workItem}>
                              <img
                                   src={`${API_BASE}/users/${user_id}/works/${workId}`}
                                   alt="Работа"
                                   className={styles.workImage}
                                   onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                              />
                              <button className={styles.deleteButton} onClick={() => handleDeleteWork(workId)}>Удалить</button>
                         </div>
                    ))}
               </div>
               {notification && (
                    <Notification
                         message={notification.message}
                         type={notification.type}
                         onClose={() => setNotification(null)}
                    />
               )}
          </>
     );
};
