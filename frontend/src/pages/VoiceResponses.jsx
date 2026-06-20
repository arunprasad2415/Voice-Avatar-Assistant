import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import voiceService from "../services/voiceService";
import "../styles/pages/VoiceResponses.css";

const VoiceResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ trigger: "", response: "", type: "custom" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const res = await voiceService.getVoiceResponses();
      setResponses(res.data || []);
    } catch (err) {
      console.error("Failed to load voice responses:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.trigger.trim() || !form.response.trim()) {
      setError("Trigger and response are required.");
      return;
    }

    setSubmitting(true);
    try {
      await voiceService.createVoiceResponse(form);
      setForm({ trigger: "", response: "", type: "custom" });
      loadResponses();
    } catch (err) {
      setError("Failed to add response.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this voice response?")) {
      return;
    }
    try {
      await voiceService.deleteVoiceResponse(id);
      loadResponses();
    } catch (err) {
      console.error("Failed to delete:", err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="vr">
        <h1 className="vr-title">Voice Responses</h1>

        <form className="vr-form" onSubmit={handleSubmit}>
          <h2 className="vr-form-title">Add Response</h2>

          {error && <div className="vr-error">{error}</div>}

          <div className="vr-form-group">
            <label htmlFor="trigger">Trigger</label>
            <input
              id="trigger"
              name="trigger"
              type="text"
              value={form.trigger}
              onChange={handleChange}
              placeholder="e.g. hello"
            />
          </div>

          <div className="vr-form-group">
            <label htmlFor="response">Response</label>
            <textarea
              id="response"
              name="response"
              value={form.response}
              onChange={handleChange}
              placeholder="What the assistant should say"
              rows="2"
            />
          </div>

          <div className="vr-form-group">
            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              <option value="custom">Custom</option>
              <option value="greeting">Greeting</option>
              <option value="fallback">Fallback</option>
            </select>
          </div>

          <button type="submit" className="vr-form-button" disabled={submitting}>
            {submitting ? "Adding..." : "Add Response"}
          </button>
        </form>

        {loading ? (
          <p className="vr-loading">Loading...</p>
        ) : responses.length === 0 ? (
          <div className="vr-empty">No voice responses found.</div>
        ) : (
          <div className="vr-table-wrap">
            <table className="vr-table">
              <thead>
                <tr>
                  <th>Trigger</th>
                  <th>Response</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r._id}>
                    <td>{r.trigger}</td>
                    <td>{r.response}</td>
                    <td>
                      <span className="vr-type">{r.type}</span>
                    </td>
                    <td>
                      <button
                        className="vr-delete"
                        onClick={() => handleDelete(r._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VoiceResponses;