import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/layout";
import Welcome from "./components/welcome/welcome";
import Reservation from "./components/reservation/reservation";

function App() {
  return (
    <Router>
      <Layout title={__APP_NAME__}>
        <Routes>
          <Route path="/" Component={Welcome} />
          <Route path="/reservation" Component={Reservation} />
        </Routes>
      </Layout>
    </Router>
  );
}


export default App;
