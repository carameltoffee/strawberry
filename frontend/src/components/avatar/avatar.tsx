import styles from "./avatar.module.css";

interface AvatarProps {
     src?: string | null;
     name: string;
     size?: number;
     className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
     src,
     name,
     size = 64,
     className = "",
}) => {
     const getInitials = (fullName: string) => {
          const names = fullName.trim().split(/\s+/);
          if (names.length === 0) return "";
          if (names.length === 1) return names[0].charAt(0).toUpperCase();
          return (
               names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
          );
     };

     const initials = getInitials(name);

     const style: React.CSSProperties = {
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          backgroundColor: "#eee",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: size * 0.4,
          color: "#555",
     };

     const combinedClassName = [styles.avatar, className].filter(Boolean).join(" ");

     if (src) {
          return <img src={src} alt={`${name} avatar`} style={style} className={combinedClassName} />;
     }

     return (
          <div
               aria-label={`Avatar placeholder for ${name}`}
               role="img"
               style={style}
               className={combinedClassName}
          >
               {initials}
          </div>
     );
};
