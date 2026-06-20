import { useState } from "react";
import "../styles/components/LeadTable.css";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const LeadTable = ({ leads, onDelete }) => {
  const [selectedLead, setSelectedLead] = useState(null);

  if (!leads || leads.length === 0) {
    return <div className="lead-table-empty">No leads found.</div>;
  }

  return (
    <>
      <div className="lead-table-wrap">
        <table className="lead-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone || "-"}</td>
                <td>
                  <span className={`lead-status lead-status-${lead.status}`}>
                    {lead.status}
                  </span>
                </td>
                <td>{formatDate(lead.createdAt)}</td>
                <td>
                  <div className="lead-table-actions">
                    <button
                      className="lead-table-view"
                      onClick={() => setSelectedLead(lead)}
                    >
                      View
                    </button>
                    <button
                      className="lead-table-delete"
                      onClick={() => onDelete(lead._id)}
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

      {selectedLead && (
        <div className="lead-modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lead-modal-header">
              <h2>Lead Details</h2>
              <button
                className="lead-modal-close"
                onClick={() => setSelectedLead(null)}
              >
                ×
              </button>
            </div>

            <div className="lead-modal-body">
              <div className="lead-modal-field">
                <span className="lead-modal-label">Name</span>
                <span className="lead-modal-value">{selectedLead.name}</span>
              </div>
              <div className="lead-modal-field">
                <span className="lead-modal-label">Email</span>
                <span className="lead-modal-value">{selectedLead.email}</span>
              </div>
              <div className="lead-modal-field">
                <span className="lead-modal-label">Phone</span>
                <span className="lead-modal-value">{selectedLead.phone || "-"}</span>
              </div>
              <div className="lead-modal-field">
                <span className="lead-modal-label">Status</span>
                <span className="lead-modal-value">{selectedLead.status}</span>
              </div>
              <div className="lead-modal-field">
                <span className="lead-modal-label">Source</span>
                <span className="lead-modal-value">{selectedLead.source}</span>
              </div>
              <div className="lead-modal-field">
                <span className="lead-modal-label">Date</span>
                <span className="lead-modal-value">{formatDate(selectedLead.createdAt)}</span>
              </div>
              <div className="lead-modal-field lead-modal-field-full">
                <span className="lead-modal-label">Message</span>
                <span className="lead-modal-message">
                  {selectedLead.message || "No message provided."}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadTable;