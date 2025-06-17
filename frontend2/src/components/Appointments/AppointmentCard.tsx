import React from "react";

interface AppointmentCardProps {
     id: number;
     name: string;
     date: string;
     status?: string;
     onDelete: (id: number) => void;
     variant?: "user" | "master";
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
     id,
     name,
     date,
     status,
     onDelete,
     variant = "user",
}) => {
     const bgClass = variant === "user" ? "bg-white" : "bg-blue-50";

     return (
          <li className={`p-4 border rounded shadow-sm ${bgClass} relative group`}>
               <div><strong>{variant === "user" ? "Мастер" : "Клиент"}:</strong> {name}</div>
               <div><strong>Дата:</strong> {new Date(date).toLocaleString()}</div>
               {status && <div><strong>Статус:</strong> {status}</div>}
               <button
                    onClick={() => onDelete(id)}
                    className="absolute top-2 right-2 text-sm text-red-600 hover:underline"
               >
                    Удалить
               </button>
          </li>
     );
};

export default AppointmentCard;
