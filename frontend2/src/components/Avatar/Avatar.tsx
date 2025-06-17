import React from "react";
import AvatarPlaceholder from '../../assets/avatar_placeholder.jpg';

type AvatarProps = {
     userId: string;
     size?: number;
     alt?: string;
};

const Avatar: React.FC<AvatarProps> = ({ userId, size = 120, alt = "User avatar" }) => {
     return (
          <img
               src={`${__BASE_API_URL__}/users/${userId}/avatar`}
               alt={alt}
               width={size}
               height={size}
               onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = AvatarPlaceholder;
               }}
               style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ccc",
               }}
          />
     );
};

export default Avatar;
