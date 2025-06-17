import { DELETE_WORKING_HOURS_DATE_SUCCESS, SCHEDULE_LOAD_FAILURE, SCHEDULE_LOAD_REQUEST, SCHEDULE_LOAD_SUCCESS, ScheduleActionTypes, SET_DAY_OFF_SUCCESS, SET_WORKING_HOURS_DATE_SUCCESS, SET_WORKING_HOURS_WEEKDAY_SUCCESS } from "./Schedule.actions";

export interface ScheduleState {
     loading: boolean;
     error: string | null;
     schedule: ISchedule | null;
}

const initialState: ScheduleState = {
     loading: false,
     error: null,
     schedule: null,
}

export function scheduleReducer(state = initialState, action: ScheduleActionTypes): ScheduleState {
     switch (action.type) {
          case SCHEDULE_LOAD_REQUEST:
               return {
                    loading: true,
                    error: null,
                    schedule: null,
               }
          case SCHEDULE_LOAD_SUCCESS:
               return {
                    loading: false,
                    error: null,
                    schedule: action.payload,
               }
          case SCHEDULE_LOAD_FAILURE:
               return {
                    loading: false,
                    error: action.payload.error,
                    schedule: null,
               }
          case SET_DAY_OFF_SUCCESS:
               return {
                    ...state,
               };

          case SET_WORKING_HOURS_DATE_SUCCESS:
          case SET_WORKING_HOURS_WEEKDAY_SUCCESS:
               return {
                    ...state,
               };

          case DELETE_WORKING_HOURS_DATE_SUCCESS:
               return {
                    ...state,
               };
          default:
               return state;
     }
}