export const ERROR_ALERT = 'ERROR_ALERT';
export const SUCCESS_ALERT = 'SUCCESS_ALERT';
export const HIDE_ALERT = 'HIDE_ALERT';

export type AlertActionTypes = AlertSuccess | AlertError | AlertHide;

interface AlertSuccess {
     type: typeof SUCCESS_ALERT;
     payload: string,
}

interface AlertError {
     type: typeof ERROR_ALERT;
     payload: string,
}

interface AlertHide {
     type: typeof HIDE_ALERT;
}


export const setAlertSuccess = (payload: string): AlertSuccess => ({
     type: SUCCESS_ALERT,
     payload,
});

export const setAlertError = (payload: string): AlertError => ({
     type: ERROR_ALERT,
     payload,
})

export const hideAlert = (): AlertHide => ({
     type: HIDE_ALERT,
})