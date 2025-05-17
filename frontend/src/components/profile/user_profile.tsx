import styles from '../schedule/schedule.module.css';
import avatar from '../../assets/placeholder.jpg'

const UserProfile = () => {
     return (
          <div className={styles.profile}>
               <img src={avatar} alt="Avatar" className={styles.avatar} />
               <h2>username</h2>
               <p>user@example.com</p>
          </div>
     );
};

export default UserProfile;
