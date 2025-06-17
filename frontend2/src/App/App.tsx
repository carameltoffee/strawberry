import { Alert } from '../components/Alert/Alert';
import { InitRoutes } from '../routes/Routes';
import './App.css';
import { useEffect } from 'react';
import { loadUser } from '../components/Auth/Auth.thunks';
import Header from '../components/Header/Header';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch } from '../hooks/hooks';
import Confirm from '../components/Confirm/Confirm';
function App() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(loadUser());
	}, [dispatch]);

	return (
		<>
			<BrowserRouter>
				<Header />
				<InitRoutes />
				<Alert />
				<Confirm />
			</BrowserRouter>
		</>
	)
}

export default App
