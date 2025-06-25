import {
     APPOINTMENTS_LOAD_REQUEST,
     APPOINTMENTS_LOAD_SUCCESS,
     APPOINTMENTS_LOAD_FAILURE,
     APPOINTMENT_CREATE_SUCCESS,
     APPOINTMENT_DELETE_SUCCESS,
     AppointmentsActionTypes,
} from "./Appointments.actions";


export interface AppointmentsState {
     loading: boolean;
     error: string | null;
     items: IAppointments;
}

const initialState: AppointmentsState = {
     loading: false,
     error: null,
     items: {
          user_appointments: [],
          master_appointments: [],
     },
};

export const appointmentsReducer = (
     state = initialState,
     action: AppointmentsActionTypes
): AppointmentsState => {
     switch (action.type) {
          case APPOINTMENTS_LOAD_REQUEST:
               return { ...state, loading: true, error: null };
          case APPOINTMENTS_LOAD_SUCCESS:
               const { user_appointments, master_appointments } = action.payload.appointments;
               console.log(user_appointments);

               return {
                    ...state,
                    loading: false,
                    items: {
                         user_appointments: Array.isArray(user_appointments) ? user_appointments : [],
                         master_appointments: Array.isArray(master_appointments) ? master_appointments : [],
                    }
               };
          case APPOINTMENTS_LOAD_FAILURE:
               return { ...state, loading: false, error: action.payload.error };
          case APPOINTMENT_CREATE_SUCCESS:
               return {
                    ...state,
                    items: {
                         ...state.items,
                         // user_appointments: [
                         //      ...(state.items.user_appointments || []),
                         //      action.payload.appointment,
                         // ],
                    },
               };
          case APPOINTMENT_DELETE_SUCCESS:
               return {
                    ...state,
                    items: {
                         ...state.items,
                         user_appointments: state.items.user_appointments.filter(
                              (a) => a.id !== action.payload.id
                         ),
                         master_appointments: state.items.master_appointments.filter(
                              (a) => a.id !== action.payload.id
                         ),
                    },
               };
          default:
               return state;
     }
};
