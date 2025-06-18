import React, { useRef } from "react";
import AvatarPlaceholder from "../../assets/avatar_placeholder.jpg";
import styles from "./Avatar.module.css";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hooks/hooks";
import { uploadAvatar } from "./Avatar.thunks";

type AvatarProps = {
     userId: string;
     size?: number;
     alt?: string;
     editable?: boolean;
};

const Avatar: React.FC<AvatarProps> = ({
     userId,
     size = 120,
     alt = "User avatar",
     editable = false,
}) => {
     const fileInputRef = useRef<HTMLInputElement>(null);
     const token = useSelector((state: RootState) => state.auth.token);
     const dispatch = useAppDispatch();
     const reloadKey = useSelector((state: RootState) => state.avatar.reloadKey);

     const handleClick = () => {
          if (editable) fileInputRef.current?.click();
     };

     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!token) {
               return;
          }
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          dispatch(uploadAvatar(file, token));
     };

     const imageSrc = `${__BASE_API_URL__}/users/${userId}/avatar?t=${reloadKey}`;

     return (
          <div
               className={`${styles.avatarWrapper} ${editable ? styles.editable : ""}`}
               style={{ width: size, height: size }}
               onClick={handleClick}
          >
               <img
                    src={imageSrc}
                    alt={alt}
                    width={size}
                    height={size}
                    onError={(e) => {
                         e.currentTarget.onerror = null;
                         e.currentTarget.src = AvatarPlaceholder;
                    }}
                    className={styles.avatarImage}
                    style={{
                         width: size,
                         height: size,
                    }}
               />
               {editable && <div className={styles.overlay}>
                    <p>Сменить аватар</p>
               </div>}
               {editable && (
                    <input
                         type="file"
                         accept="image/*"
                         ref={fileInputRef}
                         onChange={handleFileChange}
                         style={{ display: "none" }}
                    />
               )}
          </div>
     );
};

export default Avatar;
