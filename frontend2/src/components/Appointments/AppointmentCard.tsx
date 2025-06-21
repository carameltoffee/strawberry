import React from "react";
import { formatTimestampUTC } from "../../utils/dates";
import styles from "./AppointmentCard.module.css";

interface AppointmentCardProps {
     id: number;
     name: string;
     date: string;
     status?: string;
     spec?: string;
     onDelete: (id: number) => void;
     variant?: "user" | "master";
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
     id,
     name,
     spec,
     date,
     status,
     onDelete,
     variant = "user",
}) => {
     const bgClass = variant === "user" ? styles.bgUser : styles.bgMaster;

     return (
          <li className={`${styles.card} ${bgClass}`}>
               <div>
                    <strong>{variant === "user" ? "Мастер" : "Клиент"}:</strong> {name}
                    {spec && ` (${spec})`}
               </div>
               <div>
                    <strong>Дата:</strong> {formatTimestampUTC(date)}
               </div>
               {status && (
                    <div>
                         <strong>Статус:</strong> {status}
                    </div>
               )}
               <button className={styles.deleteBtn} onClick={() => onDelete(id)}>
                    Отменить
               </button>
          </li>
     );
};

export default AppointmentCard;
