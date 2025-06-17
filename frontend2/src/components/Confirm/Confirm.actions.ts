export const CONFIRM_SHOW = 'CONFIRM_SHOW';
export const CONFIRM_HIDE = 'CONFIRM_HIDE';
export const CONFIRM_SET_CALLBACK = 'CONFIRM_SET_CALLBACK';

interface ConfirmShowAction {
     type: typeof CONFIRM_SHOW;
     payload: { message: string };
}

interface ConfirmHideAction {
     type: typeof CONFIRM_HIDE;
}

interface ConfirmSetCallbackAction {
     type: typeof CONFIRM_SET_CALLBACK;
     payload: { onConfirm: () => void; onCancel?: () => void };
}

export const showConfirm = (message: string): ConfirmActionTypes => ({
     type: CONFIRM_SHOW,
     payload: { message },
});

export const hideConfirm = (): ConfirmActionTypes => ({
     type: CONFIRM_HIDE,
});

export const setConfirmCallbacks = (onConfirm: () => void, onCancel?: () => void): ConfirmActionTypes => ({
     type: CONFIRM_SET_CALLBACK,
     payload: { onConfirm, onCancel },
});

export type ConfirmActionTypes =
     | ConfirmShowAction
     | ConfirmHideAction
     | ConfirmSetCallbackAction;
