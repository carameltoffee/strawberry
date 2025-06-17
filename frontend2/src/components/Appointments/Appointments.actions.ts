export const APPOINTMENTS_LOAD_REQUEST = "APPOINTMENTS_LOAD_REQUEST";
export const APPOINTMENTS_LOAD_SUCCESS = "APPOINTMENTS_LOAD_SUCCESS";
export const APPOINTMENTS_LOAD_FAILURE = "APPOINTMENTS_LOAD_FAILURE";

export const APPOINTMENT_CREATE_SUCCESS = "APPOINTMENT_CREATE_SUCCESS";
export const APPOINTMENT_DELETE_SUCCESS = "APPOINTMENT_DELETE_SUCCESS";

export interface AppointmentsLoadRequest {
     type: typeof APPOINTMENTS_LOAD_REQUEST;
}

export interface AppointmentsLoadSuccess {
     type: typeof APPOINTMENTS_LOAD_SUCCESS;
     payload: { appointments: IAppointments };
}

export interface AppointmentsLoadFailure {
     type: typeof APPOINTMENTS_LOAD_FAILURE;
     payload: { error: string };
}

export interface AppointmentCreateSuccess {
     type: typeof APPOINTMENT_CREATE_SUCCESS;
     payload: { appointment: IAppointment };
}

export interface AppointmentDeleteSuccess {
     type: typeof APPOINTMENT_DELETE_SUCCESS;
     payload: { id: number };
}

export type AppointmentsActionTypes =
     | AppointmentsLoadRequest
     | AppointmentsLoadSuccess
     | AppointmentsLoadFailure
     | AppointmentCreateSuccess
     | AppointmentDeleteSuccess;


export const appointmentsLoadRequest = (): AppointmentsLoadRequest => ({
     type: APPOINTMENTS_LOAD_REQUEST,
});

export const appointmentsLoadSuccess = (
     appointments: IAppointments
): AppointmentsLoadSuccess => ({
     type: APPOINTMENTS_LOAD_SUCCESS,
     payload: { appointments },
});

export const appointmentsLoadFailure = (error: string): AppointmentsLoadFailure => ({
     type: APPOINTMENTS_LOAD_FAILURE,
     payload: { error },
});

export const appointmentCreateSuccess = (
     appointment: IAppointment
): AppointmentCreateSuccess => ({
     type: APPOINTMENT_CREATE_SUCCESS,
     payload: { appointment },
});

export const appointmentDeleteSuccess = (
     id: number
): AppointmentDeleteSuccess => ({
     type: APPOINTMENT_DELETE_SUCCESS,
     payload: { id },
});
