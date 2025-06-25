import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GetSchedule } from "./Schedule.thunks";
import { useAppDispatch } from "../../hooks/hooks";
import { Spinner } from "../Spinner/Spinner";
import styles from "./TodaySchedule.module.css"; // импорт модуля
import { pluralize } from "../../utils/pluralize";

interface TodayScheduleProps {
     userId: string;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ userId }) => {
     const dispatch = useAppDispatch();
     const { loading, error, schedule } = useSelector((state: RootState) => state.schedule);
     const today = new Date().toISOString().split("T")[0];

     useEffect(() => {
          dispatch(GetSchedule(today, userId));
     }, [dispatch, today, userId]);

     if (loading) return <Spinner />;
     if (error) return <div>Ошибка: {error}</div>;
     if (!schedule) return;
     if (schedule.days_off.includes(today)) return <div className={styles.container}>
               <h2 className={styles.header}>Сегодня выходной!</h2> 
          </div>;

     const appointments = schedule.appointments;

     if (!appointments || appointments.length === 0) {
          return <div className={styles.container}>
               <h2 className={styles.header}>На сегодня нет записей</h2> 
          </div>;
     }

     return (
          <div className={styles.container}>
               <h2 className={styles.header}>{`Сегодня ${appointments.length} ${pluralize(appointments.length, ["запись", "записи", "записей"])}`}</h2>
               <div className={styles.cards}>
                    {appointments.map((time, i) => (
                         <div key={i} className={styles.card}>
                              <div className={styles.time}>{time}</div>
                         </div>
                    ))}
               </div>
          </div>
     );
};

export default TodaySchedule;
