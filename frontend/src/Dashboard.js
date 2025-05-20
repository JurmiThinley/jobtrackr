import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [jobs, setJobs] = useState([]);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    status: "applied",
    date_applied: "",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    setLoading(true);

    Promise.all([
      fetch("http://localhost:5000/jobs/protected-route", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch protected data");
        return res.json();
      }),
      fetch("http://localhost:5000/jobs/", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      }),
    ])
      .then(([messageData, jobsData]) => {
        setMessage(messageData.message || "");
        const sortedJobs = [...jobsData].sort((a, b) => {
          const dateA = a.date_applied ? new Date(a.date_applied) : new Date(0);
          const dateB = b.date_applied ? new Date(b.date_applied) : new Date(0);
          return dateB - dateA;
        });
        setJobs(sortedJobs);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    fetch("http://localhost:5000/jobs/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add job");
        return res.json();
      })
      .then((newJob) => {
        setJobs((prev) => [newJob, ...prev]);
        setForm({
          title: "",
          company: "",
          location: "",
          status: "applied",
          date_applied: "",
          notes: "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    fetch(`http://localhost:5000/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete job");
        setJobs((prev) => prev.filter((job) => job.id !== id));
      })
      .catch((err) => setError(err.message));
  };

  const startEdit = (job) => {
    setEditingJobId(job.id);
    setEditForm({ status: job.status, notes: job.notes || "" });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setEditForm({ status: "", notes: "" });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = (id) => {
    setError(null);

    fetch(`http://localhost:5000/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update job");
        return res.json();
      })
      .then((updatedJob) => {
        setJobs((prev) =>
          prev.map((job) => (job.id === id ? updatedJob : job))
        );
        cancelEdit();
      })
      .catch((err) => setError(err.message));
  };

  const jobsToShow = showAllJobs ? jobs : jobs.slice(0, 5);

  return (
    <div className="container">
      <h2>JobTrackR</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <button onClick={handleLogout}>Logout</button>

      <hr />
      <h3>Add a New Job Application</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          required
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="date"
          name="date_applied"
          value={form.date_applied}
          onChange={handleChange}
        />
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Job"}
        </button>
      </form>

      <h3>Your Job Applications</h3>
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobsToShow.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{job.date_applied || "N/A"}</td>
                  <td>
                    {editingJobId === job.id ? (
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                      >
                        <option value="applied">Applied</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      job.status
                    )}
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <textarea
                        name="notes"
                        value={editForm.notes}
                        onChange={handleEditChange}
                        rows={2}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      job.notes || "-"
                    )}
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <>
                        <button onClick={() => handleEditSubmit(job.id)}>
                          Save
                        </button>
                        <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(job)}>Edit</button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(job.id)}
                          title="Delete Job"
                          style={{ marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {jobs.length > 5 && !showAllJobs && (
            <button onClick={() => setShowAllJobs(true)} style={{ marginTop: 12 }}>
              View More
            </button>
          )}
          {showAllJobs && (
            <button onClick={() => setShowAllJobs(false)} style={{ marginTop: 12 }}>
              View Less
            </button>
          )}
        </>
      )}

      
    </div>
  );
}

export default Dashboard;
