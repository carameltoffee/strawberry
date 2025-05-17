import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../schedule/schedule.module.css';

const ProfileForm = () => {
     const [workingTimes, setWorkingTimes] = useState<string[]>([]);
     const [newTime, setNewTime] = useState('');
     const [daysOff, setDaysOff] = useState<Date[]>([]);

     const addTime = () => {
          if (newTime && !workingTimes.includes(newTime)) {
               setWorkingTimes([...workingTimes, newTime]);
               setNewTime('');
          }
     };

     const removeTime = (time: string) => {
          setWorkingTimes(workingTimes.filter(t => t !== time));
     };

     const handleDateClick = (date: Date) => {
          const exists = daysOff.find(d => d.toDateString() === date.toDateString());
          if (!exists) {
               setDaysOff([...daysOff, date]);
          }
     };

     return (
          <div className={styles.form}>
               <h2>Настройки приёма</h2>

               <div className={styles.row}>
                    <div className={styles.sectionsWrapper}>
                    <div className={styles.section}>
                         <h3>Время приёма</h3>
                         <div className={styles.timeInput}>
                              <input
                                   type="time"
                                   value={newTime}
                                   onChange={(e) => setNewTime(e.target.value)}
                              />
                              <button onClick={addTime}>Добавить</button>
                         </div>
                         <ul>
                              {workingTimes.map((time) => (
                                   <li key={time}>
                                        {time}
                                        <button onClick={() => removeTime(time)}>✕</button>
                                   </li>
                              ))}
                         </ul>
                    </div>

                    <div className={styles.section}>
                         <h3>Выходные дни</h3>
                         <Calendar onClickDay={handleDateClick} />
                         <div className={styles.daysList}>
                              {daysOff.map((day, index) => (
                                   <div key={index}>
                                        {day.toLocaleDateString()}
                                        <button onClick={() => {
                                             setDaysOff(daysOff.filter((_, i) => i !== index));
                                        }}>✕</button>
                                   </div>
                              ))}
                         </div>
                    </div>
                    </div>
               </div>
          </div>

     );
};

export default ProfileForm;
