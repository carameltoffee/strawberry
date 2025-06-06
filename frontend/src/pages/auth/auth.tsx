import React, { useState, useEffect } from "react";
import { api, type LoginReq, type RegisterReq } from "../../api/api_client";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./auth.module.css"

type AuthPageProps = {
     onLogin?: (token: string) => void;
};

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
     const [isSpecialist, setIsSpecialist] = useState(false);
     const navigate = useNavigate();
     const { pathname } = useLocation();
     const mode: "login" | "register" = pathname.includes("register") ? "register" : "login";

     const createInitialForm = (): LoginReq | RegisterReq => {
          return mode === "login"
               ? { username: "", password: "" }
               : { username: "", password: "", full_name: "", specialization: "" };
     };

     const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setIsSpecialist(e.target.checked);
          if (!e.target.checked) {
               setForm(prev => ({ ...prev, specialization: "" }));
          }
     };

     const toggleMode = () => {
          navigate(mode === "login" ? "/auth/register" : "/auth/login");
     };

     const [form, setForm] = useState<LoginReq | RegisterReq>(createInitialForm);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          setForm(createInitialForm());
          setError(null);
          setIsSpecialist(false);
     }, [mode]);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setForm(prev => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async () => {
          setLoading(true);
          setError(null);
          try {
               if (mode === "login") {
                    const response = await api.login(form as LoginReq) as { token: string };
                    if (onLogin) onLogin(response.token);
                    navigate("/");
               } else {
                    await api.register(form as RegisterReq);
                    navigate("/auth/login");
               }
          } catch (err: any) {
               setError(err?.message ?? "Неизвестная ошибка");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className={styles["auth-page"]}>
               <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>

               {mode === "register" && (
                    <>
                         <input
                              type="text"
                              name="full_name"
                              placeholder="Полное имя"
                              value={(form as RegisterReq).full_name}
                              onChange={handleChange}
                         />

                         <div className={styles.specialistRow}>
                              <label className={styles.checkbox}>
                                   <input
                                        type="checkbox"
                                        checked={isSpecialist}
                                        onChange={handleCheckboxChange}
                                   />
                                   Я специалист
                              </label>

                              {isSpecialist && (
                                   <input
                                        type="text"
                                        name="specialization"
                                        placeholder="Специализация"
                                        value={(form as RegisterReq).specialization || ""}
                                        onChange={handleChange}
                                        className={styles.specializationInput}
                                   />
                              )}
                         </div>
                    </>
               )}

               <input
                    type="text"
                    name="username"
                    placeholder="Имя пользователя"
                    value={form.username}
                    onChange={handleChange}
               />

               <input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={form.password}
                    onChange={handleChange}
               />

               {error && <p className={styles.error}>{error}</p>}

               <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Обработка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
               </button>

               <button type="button" className={styles.toggle} onClick={toggleMode}>
                    {mode === "login"
                         ? "Нет аккаунта? Зарегистрируйтесь"
                         : "Уже есть аккаунт? Войдите"}
               </button>
          </div>
     );
};

export default AuthPage;
