import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function RequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const { currentUser } = useUser();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  const handleApproverCommentChange = (e) => {
    if(e.target.value.length > 600)
      return;
    setComment(e.target.value);
  }

  const isRequester = currentUser.roles.includes("Requester");
  const isApprover = currentUser.roles.includes("Approver");

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      let response = await fetch(`${API_URL}/requests`, {
        headers: {
          "user-id": currentUser.id.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.find((r) => r.id === Number(id));
        if (found) {
          setRequest(found);
          setLoading(false);
          return;
        }
      }

      response = await fetch(`${API_URL}/requests/pending`, {
        headers: {
          "user-id": currentUser.id.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.find((r) => r.id === Number(id));
        if (found) {
          setRequest(found);
          setLoading(false);
          return;
        }
      }

      throw new Error("Request not found");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/requests/${id}`, {
        method: "DELETE",
        headers: {
          "user-id": currentUser.id.toString(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete request");
      }

      navigate("/requests");
    } catch (err) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/requests/${id}/submit`, {
        method: "POST",
        headers: {
          "user-id": currentUser.id.toString(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      navigate("/requests");
    } catch (err) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    const finalComment = comment.trim() || "Approved";

    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/requests/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": currentUser.id.toString(),
        },
        body: JSON.stringify({
          approverComment: finalComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve request");
      }

      navigate("/requests/pending");
    } catch (err) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const finalComment = comment.trim() || "Rejected";

    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/requests/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": currentUser.id.toString(),
        },
        body: JSON.stringify({
          approverComment: finalComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      navigate("/requests/pending");
    } catch (err) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!request) {
    return <div className="page-container">Request not found</div>;
  }

  const isDraft = request.status === "Draft";
  const isSubmitted = request.status === "Submitted";
  const isOwnRequest = request.createdByUserId === currentUser.id;

  return (
    <div className="page-container">
      <div style={{ marginBottom: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ margin: 0 }}>{request.title}</h1>
          <span className={getStatusClass(request.status)}>
            {request.status}
          </span>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Type:</strong> {request.type}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Created by:</strong> {request.createdByUserName}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Created:</strong>{" "}
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
          {request.updatedAt && (
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <strong>Updated:</strong>{" "}
              {new Date(request.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {request.description && (
          <div style={{ marginBottom: "1rem" }}>
            <h3>Description</h3>
            <p style={{ color: "#555", whiteSpace: "pre-wrap" }}>
              {request.description}
            </p>
          </div>
        )}

        {request.approverComment && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
            }}
          >
            <h3>Approver Comment</h3>
            <p style={{ color: "#555", whiteSpace: "pre-wrap" }}>
              {request.approverComment}
            </p>
          </div>
        )}
      </div>

      {isRequester && isOwnRequest && isDraft && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/requests/${id}/edit`)}
            disabled={actionLoading}
          >
            Edit
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={actionLoading}
          >
            {actionLoading ? "Submitting..." : "Submit for Approval"}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {isApprover && isSubmitted && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Approval Decision</h3>
          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              Comment (optional)
            </label>
            <textarea
              id="comment"
              className="form-textarea"
              value={comment}
              onChange={handleApproverCommentChange}
              placeholder="Add a comment for your decision"
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-primary"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? "Approving..." : "Approve"}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}