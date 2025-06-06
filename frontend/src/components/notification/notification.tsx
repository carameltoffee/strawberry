import { useEffect, useState } from "react";
import styles from "./notification.module.css";

interface NotificationProps {
     message: string;
     type?: "error" | "success";
     onClose: () => void;
}

export default function Notification({ message, type = "success", onClose }: NotificationProps) {
     const [visible, setVisible] = useState(false);

     useEffect(() => {
          setVisible(true);
          const timeout = setTimeout(() => {
               setVisible(false);
               setTimeout(onClose, 300);
          }, 3000);

          return () => clearTimeout(timeout);
     }, [onClose]);

     return (
          <div
               className={`${styles.notification} ${type === "error" ? styles.error : styles.success} ${visible ? styles.visible : styles.hidden}`}
          >
               {message}
          </div>
     );
}
