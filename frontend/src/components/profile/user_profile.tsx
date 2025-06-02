import styles from '../schedule/schedule.module.css';
import avatar from '../../assets/placeholder.jpg'

const UserProfile = () => {
      function getUsernameFromToken(token: string | null): string | null {
          if (!token) return null;

          try {
               const payloadBase64Url = token.split('.')[1];
               if (!payloadBase64Url) return null;

               const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');

               const jsonPayload = decodeURIComponent(
                    atob(payloadBase64)
                         .split('')
                         .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                         .join('')
               );

               const payload = JSON.parse(jsonPayload);
               return payload.username || null;
          } catch {
               return null;
          }
     }
     return (
          <div className={styles.profile}>
               <img src={avatar} alt="Avatar" className={styles.avatar} />
               <h2>{getUsernameFromToken(localStorage.getItem('token'))}</h2>
          </div>
     );
};

export default UserProfile;
