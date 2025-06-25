import { ThunkAction } from 'redux-thunk';
import { RootState } from '../../store/store';
import {
     WorksActionTypes,
     sendWorksLoadReq,
     setWorksLoadFailure,
     setWorksLoadSuccess,
     workAddSuccess,
     workDeleteSuccess,
} from './Works.actions';
import { setErrorAlert } from '../Alert/Alert.thunks';

export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     WorksActionTypes
>;

export const getWorks = (userId: string): AppThunk => async (dispatch) => {
     dispatch(sendWorksLoadReq());

     try {
          const response = await fetch(`${__BASE_API_URL__}/users/${userId}/works`, {
               method: 'GET',
          });
          const data = await response.json();
          if (data?.error == "cannot get works") {
               dispatch(setWorksLoadSuccess(data));
               return;
          }
          if (!response.ok) throw new Error(data?.error || 'Неизвестная ошибка');

          dispatch(setWorksLoadSuccess(data));
     } catch (error) {
          if (error instanceof Error) {
               dispatch(setErrorAlert(error.message));
               dispatch(setWorksLoadFailure(error.message));
          } else {
               dispatch(setWorksLoadFailure('Неизвестная ошибка'));
          }
     }
};

export const addWork = (token: string, file: File): AppThunk => async (dispatch) => {
     try {
          const formData = new FormData();
          formData.append('work', file); 

          const response = await fetch(`${__BASE_API_URL__}/users/works`, {
               method: 'POST',
               headers: {
                    'Authorization': `Bearer ${token}`,
               },
               body: formData,
          });

          if (!response.ok) throw new Error(await response.text());

          const newWorkId = await response.json(); 
          dispatch(workAddSuccess(newWorkId));
     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : 'Неизвестная ошибка'));
     }
};


export const deleteWork = (token: string, workId: number): AppThunk => async (dispatch) => {
     try {
          const response = await fetch(`${__BASE_API_URL__}/masters/works/${workId}`, {
               method: 'DELETE',
               headers: {
                    'Authorization': `Bearer ${token}`,
               },
          });

          if (!response.ok) throw new Error(await response.text());

          dispatch(workDeleteSuccess(workId));
     } catch (error) {
          dispatch(setErrorAlert(error instanceof Error ? error.message : 'Неизвестная ошибка'));
     }
};

