import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import useMakeRequest from "../hooks/useMakeRequest";

export default function RequestForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const { currentUser } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("General");
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleTitleChange = (e) => {
    if(e.target.value.length > 50)
      return;
    setTitle(e.target.value);
  }

  const handleDescriptionChange = (e) => {
    if(e.target.value.length > 600)
      return;
    setDescription(e.target.value);
  }

  const isEditMode = !!id;

  const {
    data: allRequests,
    loading: fetchingRequest,
    error: fetchError,
  } = useMakeRequest(
    isEditMode ? `${API_URL}/requests` : null,
    "GET",
    currentUser.id
  );

  useEffect(() => {
    if (allRequests && isEditMode) {
      const request = allRequests.find((r) => r.id === Number(id));
      if (request) {
        setTitle(request.title);
        setDescription(request.description || "");
        setType(request.type);
      }
    }
  }, [allRequests, id, isEditMode]);

  const handleSubmit = async (status) => {
    if (status === "Submitted" && !window.confirm("Are you sure you want to submit this request?")) {
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (status === "Submitted") {
      setSubmitting(true);
    }
    if (status === "Draft") {
      setSavingDraft(true);
    }

    setError(null);

    try {
      if (isEditMode) {
        const response = await fetch(`${API_URL}/requests/${id}/edit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "user-id": currentUser.id.toString(),
          },
          body: JSON.stringify({
            title,
            description,
            type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update request");
        }

        if (status === "Submitted") {
          const submitResponse = await fetch(
            `${API_URL}/requests/${id}/submit`,
            {
              method: "POST",
              headers: {
                "user-id": currentUser.id.toString(),
              },
            }
          );

          if (!submitResponse.ok) {
            throw new Error("Failed to submit request");
          }
        }
      } else {
        const response = await fetch(`${API_URL}/requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": currentUser.id.toString(),
          },
          body: JSON.stringify({
            title,
            description,
            type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create request");
        }

        const data = await response.json();

        if (status === "Submitted") {
          const submitResponse = await fetch(
            `${API_URL}/requests/${data.id}/submit`,
            {
              method: "POST",
              headers: {
                "user-id": currentUser.id.toString(),
              },
            }
          );

          if (!submitResponse.ok) {
            throw new Error("Failed to submit request");
          }
        }
      }

      navigate("/requests");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  };

  if (fetchingRequest) {
    return <div className="page-container">Loading...</div>;
  }

  if (fetchError) {
    return (
      <div className="page-container">
        <div className="error-message">{fetchError.message}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>{isEditMode ? "Edit Request" : "Create New Request"}</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title *
          </label>
          <input
            id="title"
            type="text"
            className="form-input"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter request title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter request description (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Type *
          </label>
          <select
            id="type"
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Access">Access</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleSubmit("Draft")}
            disabled={savingDraft || submitting}
          >
            {savingDraft ? "Saving..." : "Save as Draft"}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => handleSubmit("Submitted")}
            disabled={submitting || savingDraft}
          >
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/requests")}
            disabled={savingDraft || submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
