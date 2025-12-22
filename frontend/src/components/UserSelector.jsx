import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function UserSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser, users } = useUser();

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    const selectedUser = users.find((user) => user.id === userId);
    setCurrentUser(selectedUser);
  };

  if (currentUser.id === 2 && location.pathname === "/requests") {
    navigate("/");
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <label htmlFor="user-select" style={{ margin: 0, fontSize: "0.9rem" }}>
        Current User:
      </label>
      <select
        id="user-select"
        value={currentUser.id}
        onChange={handleUserChange}
        style={{
          padding: "0.5rem",
          fontSize: "0.9rem",
          borderRadius: "4px",
          border: "1px solid #646cff",
          cursor: "pointer",
        }}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.roles.join(", ")})
          </option>
        ))}
      </select>
    </div>
  );
}
