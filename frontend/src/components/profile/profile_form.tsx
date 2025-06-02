import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../schedule/schedule.module.css';
import { api } from '../../api/api_client';

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const ProfileForm = () => {
     const [workingTimes, setWorkingTimes] = useState<string[]>([]);
     const [newTime, setNewTime] = useState('');
     const [selectedWeekday, setSelectedWeekday] = useState('monday');
     const [daysOff, setDaysOff] = useState<Date[]>([]);
     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

     const addTime = () => {
          if (newTime && !workingTimes.includes(newTime)) {
               setWorkingTimes([...workingTimes, newTime]);
               setNewTime('');
          }
     };

     const removeTime = (time: string) => {
          setWorkingTimes(workingTimes.filter(t => t !== time));
     };

     const saveWorkingHours = async () => {
          if (!token) return alert('Not authenticated');

          if (workingTimes.length < 2) return alert('Need at least two times to define a range');

          const sorted = [...workingTimes].sort();

          try {
               await api.setWorkingHours(token, {
                    day_of_week: selectedWeekday,
                    slots: sorted,
               });
               alert('Working hours saved');
          } catch (err: any) {
               alert('Failed: ' + err.message);
          }
     };

     const handleDateClick = async (date: Date) => {
          const exists = daysOff.find(d => d.toDateString() === date.toDateString());

          const formatted = date.toISOString().slice(0, 10);
          if (!token) return alert('Not authenticated');

          try {
               await api.setDayOff(token, {
                    date: formatted,
                    is_day_off: !exists,
               });

               if (!exists) {
                    setDaysOff([...daysOff, date]);
               } else {
                    setDaysOff(daysOff.filter(d => d.toDateString() !== date.toDateString()));
               }
          } catch (err: any) {
               alert('Failed: ' + err.message);
          }
     };

     return (
          <div className={styles.form}>
               <h2>Настройки приёма</h2>

               <div className={styles.row}>
                    <div className={styles.sectionsWrapper}>
                         <div className={styles.section}>
                              <h3>Время приёма</h3>
                              <label>
                                   День недели:
                                   <select
                                        value={selectedWeekday}
                                        onChange={(e) => setSelectedWeekday(e.target.value)}
                                   >
                                        {weekdays.map((day) => (
                                             <option key={day} value={day}>
                                                  {day}
                                             </option>
                                        ))}
                                   </select>
                              </label>

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

                              <button onClick={saveWorkingHours}>Сохранить время</button>
                         </div>

                         <div className={styles.section}>
                              <h3>Выходные дни</h3>
                              <Calendar onClickDay={handleDateClick} />
                              <div className={styles.daysList}>
                                   {daysOff.map((day, index) => (
                                        <div key={index}>
                                             {day.toLocaleDateString()}
                                             <button onClick={() => handleDateClick(day)}>✕</button>
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
