import { useUser } from "../context/UserContext";

export default function UserSelector() {
  const { currentUser, setCurrentUser, users } = useUser();

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    const selectedUser = users.find((user) => user.id === userId);
    setCurrentUser(selectedUser);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        padding: "0.75rem",
        zIndex: 1000,
      }}
    >
      <label htmlFor="user-select" style={{ marginRight: "0.5rem" }}>
        Current User:
      </label>
      <select
        id="user-select"
        value={currentUser.id}
        onChange={handleUserChange}
        style={{
          padding: "0.5rem",
          fontSize: "1rem",
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
