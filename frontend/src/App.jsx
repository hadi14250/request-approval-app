import useMakeRequest from "./hooks/useMakeRequest";
import "./App.css";
import {Routes, Route, Link} from "react-router-dom";
import Home from "./pages/Home";
import Requests from "./pages/Requests";

function App() {

  return (
    <>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/requests">Requests</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
    </>
  )
}

export default App;
