import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './reservation.module.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Reservation: React.FC = () => {
     const [date, setDate] = useState<Date | null>(new Date());
     const [secretCode, setSecretCode] = useState<string>('');
     const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
     const [availableTimes, setAvailableTimes] = useState<string[]>([]);
     const [availableTimesData, setAvailableTimesData] = useState<{ [key: string]: string[] }>({});

     const handleDateChange = (newDate: Value) => {
          if (Array.isArray(newDate)) {
               setDate(newDate[0] || null);
          } else {
               setDate(newDate);
          }
     };

     const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          setSecretCode(event.target.value);
     };

     const handleSubmit = (event: React.FormEvent) => {
          event.preventDefault();
          const isValid = secretCode === '12345';
          setIsCodeValid(isValid);
     };

     useEffect(() => {
          const mockTimes: { [key: string]: string[] } = {
               '2025-05-11': ['10:00', '11:00', '14:00'],
               '2025-05-12': ['09:00', '13:00', '15:30'],
               '2025-05-13': ['12:00'],
               '2025-05-14': [],
               '2025-05-15': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
               '2025-05-16': ['10:00'],
               '2025-05-17': [],
               '2025-05-18': ['09:00', '10:00'],
          };
          setAvailableTimesData(mockTimes);
     }, []);

     useEffect(() => {
          if (!date) return;

          const dateStr = date.toISOString().split('T')[0];
          const times = availableTimesData[dateStr] || [];
          setAvailableTimes(times);
     }, [date, availableTimesData]);

     const getTileClass = ({ date, view }: { date: Date; view: string }) => {
          if (view !== 'month') return '';
          const dateStr = date.toISOString().split('T')[0];
          const times = availableTimesData[dateStr] || [];

          const freeSlots = times.length;

          if (freeSlots === 0) return styles.disabledDay;
          if (freeSlots <= 1) return styles.fullLoad;
          if (freeSlots <= 2) return styles.highLoad;
          if (freeSlots <= 4) return styles.mediumLoad;
          return styles.lowLoad;
     };

     return (
          <div className={styles.container}>
               <div className={styles.leftSide}>
                    <h2>Выберите дату</h2>
                    <Calendar
                         onChange={handleDateChange}
                         value={date}
                         tileClassName={getTileClass}
                         className={styles.reactCalendar}
                    />

                    {availableTimes.length > 0 ? (
                         <div className={styles.timeSlots}>
                              <h3>Доступное время:</h3>
                              <ul className={styles.timeList}>
                                   {availableTimes.map((time) => (
                                        <li key={time}>
                                             <button className={styles.timeButton}>{time}</button>
                                        </li>
                                   ))}
                              </ul>
                         </div>
                    ) : (
                         date && <p className={styles.noTimes}>Нет доступного времени на выбранную дату</p>
                    )}
               </div>

               <div className={styles.rightSide}>
                    <h2>Уже записаны? Введите номер записи для отмены</h2>
                    <form onSubmit={handleSubmit}>
                         <input
                              type="text"
                              placeholder="код записи"
                              value={secretCode}
                              onChange={handleCodeChange}
                              className="input"
                         />
                         <button type="submit" className={styles.button}>Отменить запись</button>
                    </form>
                    {isCodeValid === true && <p className="success">Запись отменена!</p>}
                    {isCodeValid === false && <p className="error">Неверный код!</p>}
               </div>
          </div>
     );
};

export default Reservation;
