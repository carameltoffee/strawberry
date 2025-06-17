import React, { useState } from 'react';
import { setDayOff, setWorkingHoursByDate, deleteWorkingHoursByDate, setWorkingHoursByWeekday, deleteDayOff } from './Schedule.thunks';
import { useAppDispatch } from '../../hooks/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const weekdayMap = [
     { ru: 'Понедельник', en: 'monday' },
     { ru: 'Вторник', en: 'tuesday' },
     { ru: 'Среда', en: 'wednesday' },
     { ru: 'Четверг', en: 'thursday' },
     { ru: 'Пятница', en: 'friday' },
     { ru: 'Суббота', en: 'saturday' },
     { ru: 'Воскресенье', en: 'sunday' },
];


const ScheduleEditor: React.FC = () => {
     const dispatch = useAppDispatch();

     const [date, setDate] = useState('');
     const [weekday, setWeekday] = useState<number>(0);
     const [slots, setSlots] = useState<string[]>([]);
     const [slotInput, setSlotInput] = useState('');
     const token = useSelector((state: RootState) => state.auth.token)

     if (!token) {
          return (<></>);
     }


     const handleAddSlot = () => {
          if (slotInput && !slots.includes(slotInput)) {
               setSlots([...slots, slotInput]);
               setSlotInput('');
          }
     };

     const handleRemoveSlot = (slot: string) => {
          setSlots(slots.filter(s => s !== slot));
     };

     return (
          <div className="p-4 rounded-2xl shadow-lg bg-white max-w-xl mx-auto space-y-6">
               <h2 className="text-xl font-bold">Редактирование расписания</h2>

               <div className="space-y-4">
                    <div>
                         <label className="block text-sm font-medium mb-1">Дата</label>
                         <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="border p-2 rounded w-full"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1">Слоты (HH:MM)</label>
                         <div className="flex gap-2">
                              <input
                                   type="time"
                                   value={slotInput}
                                   onChange={(e) => setSlotInput(e.target.value)}
                                   className="border p-2 rounded flex-grow"
                              />
                              <button
                                   onClick={handleAddSlot}
                                   className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                              >
                                   Добавить
                              </button>
                         </div>
                         <div className="mt-2 flex flex-wrap gap-2">
                              {slots.map((slot) => (
                                   <span
                                        key={slot}
                                        className="px-2 py-1 bg-gray-200 rounded text-sm cursor-pointer hover:bg-red-200"
                                        onClick={() => handleRemoveSlot(slot)}
                                   >
                                        {slot} x
                                   </span>
                              ))}
                         </div>
                    </div>

                    <div className="flex flex-col gap-2">
                         <button
                              onClick={() => dispatch(setDayOff(token, date))}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                         >
                              Установить выходной
                         </button>
                         <button
                              onClick={() => dispatch(deleteDayOff(token, date))}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                         >
                              Удалить выходной
                         </button>

                         <button
                              onClick={() => dispatch(setWorkingHoursByDate(token, date, slots))}
                              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                         >
                              Установить рабочие часы (по дате)
                         </button>

                         <button
                              onClick={() => dispatch(deleteWorkingHoursByDate(token, date))}
                              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                         >
                              Удалить рабочие часы (по дате)
                         </button>
                    </div>

                    <div className="pt-4 border-t mt-4">
                         <label className="block text-sm font-medium mb-1">День недели</label>
                         <select
                              value={weekday}
                              onChange={(e) => setWeekday(Number(e.target.value))}
                              className="border p-2 rounded w-full mb-2"
                         >
                              {weekdayMap.map((day, idx) => (
                                   <option key={idx} value={idx}>
                                        {day.ru}
                                   </option>
                              ))}
                         </select>

                         <button
                              onClick={() => dispatch(setWorkingHoursByWeekday(token, weekdayMap[weekday].en, slots))}
                              className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 w-full"
                         >
                              Установить рабочие часы (по дню недели)
                         </button>

                    </div>
               </div>
          </div>
     );
};

export default ScheduleEditor;
