export const SCHEDULE_LOAD_REQUEST = 'SCHEDULE_LOAD_REQUEST'
export const SCHEDULE_LOAD_SUCCESS = 'SCHEDULE_LOAD_SUCCESS'
export const SCHEDULE_LOAD_FAILURE = 'SCHEDULE_LOAD_FAILURE'
export const SET_DAY_OFF_SUCCESS = 'SET_DAY_OFF_SUCCESS';
export const SET_WORKING_HOURS_DATE_SUCCESS = 'SET_WORKING_HOURS_DATE_SUCCESS';
export const DELETE_WORKING_HOURS_DATE_SUCCESS = 'DELETE_WORKING_HOURS_DATE_SUCCESS';
export const SET_WORKING_HOURS_WEEKDAY_SUCCESS = 'SET_WORKING_HOURS_WEEKDAY_SUCCESS';

interface SetDayOffSuccessAction {
     type: typeof SET_DAY_OFF_SUCCESS;
}

interface SetWorkingHoursDateSuccessAction {
     type: typeof SET_WORKING_HOURS_DATE_SUCCESS;
}

interface DeleteWorkingHoursDateSuccessAction {
     type: typeof DELETE_WORKING_HOURS_DATE_SUCCESS;
}

interface SetWorkingHoursWeekdaySuccessAction {
     type: typeof SET_WORKING_HOURS_WEEKDAY_SUCCESS;
}

interface ScheduleLoadRequestAction {
     type: typeof SCHEDULE_LOAD_REQUEST;
}

interface ScheduleLoadSuccessAction {
     type: typeof SCHEDULE_LOAD_SUCCESS;
     payload: ISchedule;
}

interface ScheduleLoadFailureAction {
     type: typeof SCHEDULE_LOAD_FAILURE;
     payload: {
          error: string;
     };
}

export type ScheduleActionTypes =
     | ScheduleLoadRequestAction
     | ScheduleLoadSuccessAction
     | ScheduleLoadFailureAction
     | SetDayOffSuccessAction
     | SetWorkingHoursDateSuccessAction
     | DeleteWorkingHoursDateSuccessAction
     | SetWorkingHoursWeekdaySuccessAction;

export const setDayOffSuccess = (): SetDayOffSuccessAction => ({
     type: SET_DAY_OFF_SUCCESS,
});

export const setWorkingHoursDateSuccess = (): SetWorkingHoursDateSuccessAction => ({
     type: SET_WORKING_HOURS_DATE_SUCCESS,
});

export const deleteWorkingHoursDateSuccess = (): DeleteWorkingHoursDateSuccessAction => ({
     type: DELETE_WORKING_HOURS_DATE_SUCCESS,
});

export const setWorkingHoursWeekdaySuccess = (): SetWorkingHoursWeekdaySuccessAction => ({
     type: SET_WORKING_HOURS_WEEKDAY_SUCCESS,
});

export const sendScheduleLoadReq = (): ScheduleLoadRequestAction => ({
     type: SCHEDULE_LOAD_REQUEST,
})

export const setScheduleLoadSuccess = (schedule: ISchedule): ScheduleLoadSuccessAction => ({
     type: SCHEDULE_LOAD_SUCCESS,
     payload: schedule,
})

export const setScheduleLoadFailure = (error: string): ScheduleLoadFailureAction => ({
     type: SCHEDULE_LOAD_FAILURE,
     payload: {
          error,
     }
})


