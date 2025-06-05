import { useEffect } from "react";

interface NotificationProps {
     message: string;
     type?: "error" | "success";
     onClose: () => void;
}

export default function Notification({ message, type = "success", onClose }: NotificationProps) {
     useEffect(() => {
          const timeout = setTimeout(onClose, 3000);
          return () => clearTimeout(timeout);
     }, [onClose]);

     return (
          <div>
               {message}
          </div>
     );
}
