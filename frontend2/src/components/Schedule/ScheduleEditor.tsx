import React, { useState } from 'react';
import styles from './ScheduleEditor.module.css';
import ScheduleByDate from './ScheduleByDate';
import ScheduleByWeekday from './ScheduleByWeekday';

const ScheduleEditor: React.FC = () => {
     const [tab, setTab] = useState<'date' | 'weekday'>('date');

     return (
          <div className={styles.wrapper}>
               <h2 className={styles.heading}>Редактирование расписания</h2>

               <div className={styles.tabs}>
                    <button
                         className={`${styles.tab} ${tab === 'date' ? styles.activeTab : ''}`}
                         onClick={() => setTab('date')}
                    >
                         По дате
                    </button>
                    <button
                         className={`${styles.tab} ${tab === 'weekday' ? styles.activeTab : ''}`}
                         onClick={() => setTab('weekday')}
                    >
                         По дню недели
                    </button>
               </div>

               {tab === 'date' && <ScheduleByDate />}
               {tab === 'weekday' && <ScheduleByWeekday />}
          </div>
     );
};

export default ScheduleEditor;
