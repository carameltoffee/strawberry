import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/layout";
import Reservation from "./pages/reservation/reservation";
import UserPage from "./pages/profile/profile_page";
import AuthPage from "./pages/auth/auth";
import { useState, useEffect } from "react";
import { Main } from "./pages/main/main";

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		setIsAuthenticated(!!token);
	}, []);

	const handleLogin = (token: string) => {
		localStorage.setItem("token", token);
		setIsAuthenticated(true);
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsAuthenticated(false);
	};

	return (
		<Router>
			<Layout
				title={__APP_NAME__}
				isAuthenticated={isAuthenticated}
				onLogout={handleLogout}
			>
				<Routes>
					<Route path="/" Component={Main} />
					<Route path="/reservation/:id" Component={Reservation} />
					<Route path="/user" Component={UserPage} />
					<Route path="/auth/login" element={<AuthPage onLogin={handleLogin}/>} />
					<Route path="/auth/register" element={<AuthPage />} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
