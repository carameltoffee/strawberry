export const API_BASE = "http://localhost:8080/api";

export interface ErrorResponse {
     error: string;
}

export interface LoginReq {
     username: string;
     password: string;
}

export interface LoginRes {
     token: string;
}

export interface RegisterReq {
     full_name: string;
     username: string;
     email: string;
     password: string;
     specialization?: string;
}

export interface SetWorkingSlotsForDateInput {
     date: string;
     slots: string[];
}

export interface RegisterRes {
     id: number;
}

export interface AppointmentReq {
     master_id: number;
     time: string;
}

export interface AppointmentRes {
     id: number;
}

export interface User {
     id: number;
     full_name: string;
     username: string;
     specialization?: string;
     average_rating?: number;
     registered_at: string;
}

export interface Schedule {
     days_off: string[];
     slots: string[];
     appointments: string[];
}


export interface SetDayOffInput {
     date: string;
     is_day_off?: boolean;
}

export interface SetWorkingSlotsInput {
     day_of_week: string;
     slots: string[];
}

export interface Appointment {
     id: number;
     user_id: number;
     master_id: number;
     scheduled_at: string;
     created_at: string;
     status: string;
}

async function request<T>(
     method: string,
     path: string,
     token?: string,
     body?: any
): Promise<T> {
     const res = await fetch(`${API_BASE}${path}`, {
          method,
          headers: {
               "Content-Type": "application/json",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
     });

     if (!res.ok) {
          let errText = res.statusText;
          try {
               const errData = await res.json();
               if (errData?.error) errText = errData.error;
          } catch {
          }
          throw new Error(errText);
     }

     const contentLength = res.headers.get("Content-Length");

     if (res.status === 204 || !contentLength || contentLength === "0") {
          return undefined as unknown as T;
     }

     try {
          return await res.json();
     } catch {
          return undefined as unknown as T;
     }
}

async function requestFormData<T>(
     method: string,
     path: string,
     token: string,
     formData: FormData
): Promise<T> {
     const res = await fetch(`${API_BASE}${path}`, {
          method,
          headers: {
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
               // Content-Type не ставим, браузер сам выставит для multipart/form-data
          },
          body: formData,
     });

     if (!res.ok) {
          let errText = res.statusText;
          try {
               const errData = await res.json();
               if (errData?.error) errText = errData.error;
          } catch { }
          throw new Error(errText);
     }

     const contentLength = res.headers.get("Content-Length");

     if (res.status === 204 || !contentLength || contentLength === "0") {
          return undefined as unknown as T;
     }

     try {
          return await res.json();
     } catch {
          return undefined as unknown as T;
     }
}

export const api = {
     login(input: LoginReq): Promise<LoginRes> {
          return request("POST", "/login", undefined, input);
     },

     register(input: RegisterReq): Promise<RegisterRes> {
          return request("POST", "/register", undefined, input);
     },

     createAppointment(token: string, input: AppointmentReq): Promise<AppointmentRes> {
          return request("POST", "/appointments", token, input);
     },

     deleteAppointment(token: string, id: number): Promise<void> {
          return request("DELETE", `/appointments/${id}`, token);
     },

     getAppointments(token: string): Promise<Appointment> {
          return request("GET", `/appointments`, token);
     },

     getMasterById(id: number): Promise<User> {
          return request("GET", `/users/${id}`)
     },

     getMasters(specialization?: string, min_rating?: number): Promise<User[]> {
          const params = new URLSearchParams();
          if (specialization) params.append("specialization", specialization);
          if (min_rating != null) params.append("min_rating", min_rating.toString());
          return request("GET", `/masters?${params.toString()}`);
     },

     getMasterByUsername(username: string): Promise<User> {
          return request("GET", `/masters/${encodeURIComponent(username)}`);
     },

     setDayOff(token: string, input: SetDayOffInput): Promise<void> {
          return request("PUT", "/schedule/dayoff", token, input);
     },

     setWeeklyWorkingSlots(token: string, input: SetWorkingSlotsInput): Promise<void> {
          return request("PUT", "/schedule/hours/weekday", token, input);
     },

     setDateWorkingSlots(token: string, input: SetWorkingSlotsForDateInput): Promise<void> {
          return request("PUT", "/schedule/hours/date", token, input);
     },

     deleteDateWorkingSlots(token: string, date: string): Promise<void> {
          return request("DELETE", `/schedule/hours/date?date=${encodeURIComponent(date)}`, token);
     },

     getSchedule(token: string, id: number, date: string): Promise<Schedule> {
          const params = new URLSearchParams({ date });
          return request("GET", `/schedule/${id}?${params.toString()}`, token);
     },
     async getUserAvatar(id: number): Promise<Blob> {
          const res = await fetch(`${API_BASE}/users/${id}/avatar`, {
               method: "GET",
          });
          if (!res.ok) {
               let errText = res.statusText;
               try {
                    const errData = await res.json();
                    if (errData?.error) errText = errData.error;
               } catch { }
               throw new Error(errText);
          }
          return await res.blob();
     },

     async uploadUserAvatar(token: string, file: File): Promise<void> {
          const formData = new FormData();
          formData.append("avatar", file);
          return requestFormData<void>("POST", "/users/avatar", token, formData);
     },

     async uploadUserWork(token: string, file: File): Promise<string> {
          const formData = new FormData();
          formData.append("work", file);
          return requestFormData<string>("POST", "/users/works", token, formData);
     },

     async deleteUserWork(token: string, workId: string): Promise<void> {
          return request<void>("DELETE", `/masters/works/${workId}`, token);
     },

     async getUserWorkIds(id: number): Promise<string[]> {
          return request("GET", `/users/${id}/works`);
     },

     async getUserWorkFile(id: number, workId: string): Promise<Blob> {
          const res = await fetch(`${API_BASE}/users/${id}/works/${encodeURIComponent(workId)}`, {
               method: "GET",
          });
          if (!res.ok) {
               let errText = res.statusText;
               try {
                    const errData = await res.json();
                    if (errData?.error) errText = errData.error;
               } catch { }
               throw new Error(errText);
          }
          return await res.blob();
     },
};
