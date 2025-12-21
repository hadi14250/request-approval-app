import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import UserSelector from "./components/UserSelector";
import Home from "./pages/Home";
import Requests from "./pages/Requests";
import Pending from "./pages/Pending";

function App() {
  return (
    <UserProvider>
      <nav className="navbar">
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/requests">Requests</Link>
          <Link to="/requests/pending">Pending Approval</Link>
        </div>
        <UserSelector />
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/pending" element={<Pending />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
