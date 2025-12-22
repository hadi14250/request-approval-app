import { useNavigate } from "react-router-dom";
import useMakeRequest from "../hooks/useMakeRequest";
import { useUser } from "../context/UserContext";

export default function Pending() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const { currentUser } = useUser();

  const { data, loading, error } = useMakeRequest(
    `${API_URL}/requests/pending`,
    "GET",
    currentUser.id
  );

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Pending Approvals</h1>

      {!data || data.length === 0 ? (
        <div className="empty-state">
          <p>No pending requests</p>
        </div>
      ) : (
        <div>
          {data.map((request) => (
            <div
              key={request.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/requests/${request.id}`)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "0.5rem",
                }}
              >
                <h3 style={{ margin: 0 }}>{request.title}</h3>
                <span className={getStatusClass(request.status)}>
                  {request.status}
                </span>
              </div>

              <div
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Type: {request.type}</span>
                <span style={{ marginLeft: "1rem" }}>
                  Created by: {request.createdByUserName}
                </span>
                <span style={{ marginLeft: "1rem" }}>
                  Created: {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>

              {request.description && (
                <p style={{ margin: "0.5rem 0", color: "#555" }}>
                  {request.description.length > 100
                    ? request.description.substring(0, 100) + "..."
                    : request.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
