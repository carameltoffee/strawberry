import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/layout";
import Welcome from "./components/welcome/welcome";
import Reservation from "./components/reservation/reservation";
import SchedulePage from "./components/schedule/schedule";
import AuthForm from "./components/auth/auth";

function App() {
  return (
    <Router>
      <Layout title={__APP_NAME__}>
        <Routes>
          <Route path="/" Component={Welcome} />
          <Route path="/reservation/:id" Component={Reservation} />
          <Route path="/user" Component={SchedulePage} />
          <Route path="/auth" Component={AuthForm}/>
        </Routes>
      </Layout>
    </Router>
  );
}


export default App;
