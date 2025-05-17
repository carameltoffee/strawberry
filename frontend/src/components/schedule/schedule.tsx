import styles from './schedule.module.css';
import UserProfile from '../profile/user_profile'
import ProfileForm from '../profile/profile_form';

const SchedulePage = () => {
     return (
          <div className={styles.container}>
               <div className={styles.left}>
                    <UserProfile />
               </div>
               <div className={styles.right}>
                    <ProfileForm />
               </div>
          </div>
     );
};

export default SchedulePage;
