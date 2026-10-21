import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import voiceService from "../services/voiceService";
import "../styles/pages/VoiceResponses.css";

const EMPTY_FORM = { trigger: "", response: "", type: "custom" };

const VoiceResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadResponses = () =>
    voiceService
      .getVoiceResponses()
      .then((res) => setResponses(res.data || []))
      .catch((err) => console.error("Failed to load voice responses:", err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadResponses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
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
      if (editingId) {
        await voiceService.updateVoiceResponse(editingId, form);
      } else {
        await voiceService.createVoiceResponse(form);
      }
      resetForm();
      loadResponses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save response.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r) => {
    setForm({ trigger: r.trigger, response: r.response, type: r.type });
    setEditingId(r._id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (r) => {
    const isActive = !r.isActive;
    setResponses((prev) => prev.map((x) => (x._id === r._id ? { ...x, isActive } : x)));
    try {
      await voiceService.updateVoiceResponse(r._id, { isActive });
    } catch (err) {
      console.error("Failed to update voice response:", err.message);
      loadResponses();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this voice response?")) {
      return;
    }
    try {
      await voiceService.deleteVoiceResponse(id);
      if (editingId === id) {
        resetForm();
      }
      loadResponses();
    } catch (err) {
      console.error("Failed to delete:", err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="vr">
        <h1 className="vr-title">Voice Responses</h1>

        <form
          className={`vr-form ${editingId ? "vr-form-editing" : ""}`}
          onSubmit={handleSubmit}
        >
          <h2 className="vr-form-title">{editingId ? "Edit Response" : "Add Response"}</h2>

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
            <span className="vr-hint">
              Matches when these words appear anywhere in what the user says.
            </span>
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
            {form.type === "fallback" && (
              <span className="vr-hint">
                Said when nothing else (including AI) can answer. The trigger is ignored.
              </span>
            )}
          </div>

          <div className="vr-form-actions">
            <button type="submit" className="vr-form-button" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Add Response"}
            </button>
            {editingId && (
              <button type="button" className="vr-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
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
                  <th>Active</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr
                    key={r._id}
                    className={`${r.isActive ? "" : "row-inactive"} ${
                      r._id === editingId ? "row-editing" : ""
                    }`}
                  >
                    <td>{r.trigger}</td>
                    <td>{r.response}</td>
                    <td>
                      <span className="vr-type">{r.type}</span>
                    </td>
                    <td className="cell-status">
                      <button
                        type="button"
                        className="switch"
                        role="switch"
                        aria-checked={r.isActive}
                        aria-label={`${r.isActive ? "Deactivate" : "Activate"} "${r.trigger}"`}
                        onClick={() => handleToggle(r)}
                      />
                    </td>
                    <td>
                      <div className="vr-actions">
                        <button className="vr-edit" onClick={() => handleEdit(r)}>
                          Edit
                        </button>
                        <button
                          className="vr-delete"
                          onClick={() => handleDelete(r._id)}
                        >
                          Delete
                        </button>
                      </div>
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
