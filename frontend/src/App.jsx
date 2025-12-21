import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import UserSelector from "./components/UserSelector";
import Home from "./pages/Home";
import Requests from "./pages/Requests";

function App() {
  return (
    <UserProvider>
      <UserSelector />

      <nav style={{ display: "flex", gap: 12, padding: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/requests">Requests</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
