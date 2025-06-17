import { useState } from 'react';
import { registerUser, sendCode } from './Auth.thunks';
import styles from './Register.module.css';
import { Spinner } from '../Spinner/Spinner';
import { useAppDispatch } from '../../hooks/hooks';

export const Register: React.FC = () => {
     const dispatch = useAppDispatch();
     const [form, setForm] = useState<IRegisterReq>({
          full_name: '',
          email: '',
          specialization: '',
          code: '',
          username: '',
          password: '',
     });
     const [sending, setSending] = useState(false);
     const [isSpecialist, setIsSpecialist] = useState(false);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setForm(prev => ({ ...prev, [name]: value }));
     };

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          dispatch(registerUser(form));
     };

     const handleSendCode = async () => {
          if (!form.email) return;
          setSending(true);
          await dispatch(sendCode(form.email));
          setSending(false);
     };

     return (
          <div className={styles.container}>
               <h1 className={styles.title}>Регистрация</h1>
               <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                         name="full_name"
                         placeholder="Полное имя"
                         value={form.full_name}
                         onChange={handleChange}
                         className={styles.input}
                         required
                    />
                    <div className={styles.row}>
                         <input
                              name="email"
                              placeholder="Email"
                              type="email"
                              value={form.email}
                              onChange={handleChange}
                              className={styles.input}
                              required
                         />
                         <button
                              type="button"
                              className={styles.codeButton}
                              onClick={handleSendCode}
                              disabled={!form.email || sending}
                         >
                              {sending ? <Spinner/> : 'Отправить код'}
                         </button>
                    </div>
                    <input
                         name="code"
                         placeholder="Код подтверждения"
                         value={form.code}
                         onChange={handleChange}
                         className="w-full border p-2 rounded"
                         required
                    />
                    <div className={styles.checkboxRow}>
                         <input
                              id="isSpecialist"
                              type="checkbox"
                              checked={isSpecialist}
                              onChange={() => setIsSpecialist(prev => !prev)}
                              className={styles.checkbox}
                         />
                         <label htmlFor="isSpecialist" className={styles.checkboxLabel}>
                              Я специалист
                         </label>

                    {isSpecialist && (
                         <input
                         name="specialization"
                         placeholder="Специализация"
                         value={form.specialization}
                         onChange={handleChange}
                         className={styles.input}
                         />
                    )}
                    </div>
                    <input
                         name="username"
                         placeholder="Логин"
                         value={form.username}
                         onChange={handleChange}
                         className="w-full border p-2 rounded"
                         required
                    />
                    <input
                         name="password"
                         placeholder="Пароль"
                         type="password"
                         value={form.password}
                         onChange={handleChange}
                         className="w-full border p-2 rounded"
                         required
                    />
                    <button type="submit" className={styles.submit}>
                         Зарегистрироваться
                    </button>
               </form >
          </div >

     );
};
