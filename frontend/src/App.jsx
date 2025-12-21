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
      <UserSelector />

      <nav style={{ display: "flex", gap: 12, padding: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/requests">Requests</Link>
        <Link to="/requests/pending">Pending Approval</Link>
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
