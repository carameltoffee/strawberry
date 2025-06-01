const API_BASE = "/api";

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
     password: string;
     specialization?: string;
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

export interface SetDayOffInput {
     day_of_week: string;
     is_day_off?: boolean;
}

export interface SetWorkingHoursInput {
     day_of_week: string;
     time_start: string;
     time_end: string;
}

function request<T>(
     method: string,
     path: string,
     token?: string,
     body?: any
): Promise<T> {
     return fetch(`${API_BASE}${path}`, {
          method,
          headers: {
               "Content-Type": "application/json",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
     }).then(async (res) => {
          if (!res.ok) {
               const err: ErrorResponse = await res.json();
               throw new Error(err.error || res.statusText);
          }
          return res.status === 204 ? ("" as any) : res.json();
     });
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

     setWorkingHours(token: string, input: SetWorkingHoursInput): Promise<void> {
          return request("PUT", "/schedule/hours", token, input);
     },
};
