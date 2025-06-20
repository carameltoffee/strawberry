import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setWorkingHoursByWeekday } from './Schedule.thunks';
import styles from './ScheduleEditor.module.css';

const weekdayMap = [
     { ru: 'Понедельник', en: 'monday' },
     { ru: 'Вторник', en: 'tuesday' },
     { ru: 'Среда', en: 'wednesday' },
     { ru: 'Четверг', en: 'thursday' },
     { ru: 'Пятница', en: 'friday' },
     { ru: 'Суббота', en: 'saturday' },
     { ru: 'Воскресенье', en: 'sunday' },
];

const ScheduleByWeekday: React.FC = () => {
     const dispatch = useAppDispatch();
     const token = useSelector((state: RootState) => state.auth.token);
     if (!token) return null;

     const [weekday, setWeekday] = useState(0);
     const [weekdaySlots, setWeekdaySlots] = useState<string[]>([]);
     const [weekdaySlotInput, setWeekdaySlotInput] = useState('');

     const addSlot = (input: string, setSlots: React.Dispatch<React.SetStateAction<string[]>>, slots: string[], setInput: React.Dispatch<React.SetStateAction<string>>) => {
          if (input && !slots.includes(input)) {
               setSlots([...slots, input].sort());
               setInput('');
          }
     };

     const removeSlot = (slot: string, slots: string[], setSlots: React.Dispatch<React.SetStateAction<string[]>>) => {
          setSlots(slots.filter(s => s !== slot));
     };

     const handleSaveWeekday = () => {
          const dayEn = weekdayMap[weekday].en;
          if (weekdaySlots.length > 0) {
               dispatch(setWorkingHoursByWeekday(token, dayEn, weekdaySlots));
          }
     };

     return (
          <div className={styles.tabContent}>
               <label className={styles.label}>Выберите день недели</label>
               <select
                    className={styles.input}
                    value={weekday}
                    onChange={(e) => setWeekday(Number(e.target.value))}
               >
                    {weekdayMap.map((day, idx) => (
                         <option key={idx} value={idx}>
                              {day.ru}
                         </option>
                    ))}
               </select>

               <div className={styles.slotRow}>
                    <input
                         type="time"
                         value={weekdaySlotInput}
                         onChange={(e) => setWeekdaySlotInput(e.target.value)}
                         className={styles.input}
                    />
                    <button
                         className={styles.buttonPrimary}
                         onClick={() => addSlot(weekdaySlotInput, setWeekdaySlots, weekdaySlots, setWeekdaySlotInput)}
                    >
                         Добавить слот
                    </button>
               </div>

               <div className={styles.slots}>
                    {weekdaySlots.map(slot => (
                         <span
                              key={slot}
                              className={styles.slot}
                              onClick={() => removeSlot(slot, weekdaySlots, setWeekdaySlots)}
                         >
                              {slot} ×
                         </span>
                    ))}
               </div>

               <div className={styles.section}>
                    <button className={styles.buttonSuccess} onClick={handleSaveWeekday}>
                         Сохранить для {weekdayMap[weekday].ru}
                    </button>
               </div>
          </div>
     );
};

export default ScheduleByWeekday;
