import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import UserSelector from "./components/UserSelector";
import Home from "./pages/Home";
import Requests from "./pages/Requests";
import Pending from "./pages/Pending";
import RequestDetails from "./pages/RequestDetails";
import RequestForm from "./components/RequestForm";
import { useUser } from "./context/UserContext";

function Navigation() {
  const location = useLocation();
  const { currentUser } = useUser();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/requests/pending") {
      return location.pathname.startsWith("/requests/pending");
    }
    if (path === "/requests") {
      return (
        location.pathname === "/requests" ||
        (location.pathname.startsWith("/requests/") &&
          !location.pathname.startsWith("/requests/pending"))
      );
    }
    return false;
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className={isActive("/") ? "nav-link-active" : ""}>
          Home
        </Link>
        { currentUser.roles.includes("Requester") &&
          <Link
            to="/requests"
            className={isActive("/requests") ? "nav-link-active" : ""}
          >
            My Requests
          </Link>
        }
        <Link
          to="/requests/pending"
          className={isActive("/requests/pending") ? "nav-link-active" : ""}
        >
          Pending Approvals
        </Link>
      </div>
      <UserSelector />
    </nav>
  );
}

function App() {
  return (
    <UserProvider>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/new" element={<RequestForm />} />
        <Route path="/requests/pending" element={<Pending />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
        <Route path="/requests/:id/edit" element={<RequestForm />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
