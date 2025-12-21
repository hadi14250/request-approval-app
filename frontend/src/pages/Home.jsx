import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const isRequester = currentUser.roles.includes("Requester");
  const isApprover = currentUser.roles.includes("Approver");

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem",
      textAlign: "left"
    }}>
      <h1 style={{ marginBottom: "1.5rem" }}>
        Welcome, {currentUser.name}!
      </h1>

      <div style={{
        marginBottom: "2rem",
        padding: "1rem",
        backgroundColor: "rgba(100, 108, 255, 0.1)",
        borderRadius: "8px",
        borderLeft: "4px solid #646cff"
      }}>
        <p style={{ margin: 0, fontSize: "1.1rem" }}>
          Your role: <strong>{currentUser.roles.join(", ")}</strong>
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>What you can do:</h2>
        <ul style={{ lineHeight: "1.8", fontSize: "1rem" }}>
          {isRequester && <li>Create, submit, and edit your requests</li>}
          {isApprover && <li>View pending requests, approve, and reject them</li>}
        </ul>
      </div>

      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Quick Actions:</h2>
        <div style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          {isRequester && (
            <button
              onClick={() => navigate("/requests")}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#646cff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#535bf2"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#646cff"}
            >
              View My Requests
            </button>
          )}

          {isApprover && (
            <button
              onClick={() => navigate("/requests/pending")}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#646cff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#535bf2"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#646cff"}
            >
              View Pending Requests
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
