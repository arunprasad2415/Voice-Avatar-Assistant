import "../styles/components/FAQTable.css";

const FAQTable = ({ faqs, editingId, onEdit, onToggle, onDelete }) => {
  if (!faqs || faqs.length === 0) {
    return <div className="faq-table-empty">No FAQs found.</div>;
  }

  return (
    <div className="faq-table-wrap">
      <table className="faq-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>Category</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr
              key={faq._id}
              className={`${faq.isActive ? "" : "row-inactive"} ${
                faq._id === editingId ? "row-editing" : ""
              }`}
            >
              <td>{faq.question}</td>
              <td className="faq-answer-cell">{faq.answer}</td>
              <td>
                <span className="faq-category">{faq.category}</span>
              </td>
              <td className="cell-status">
                <button
                  type="button"
                  className="switch"
                  role="switch"
                  aria-checked={faq.isActive}
                  aria-label={`${faq.isActive ? "Deactivate" : "Activate"} "${faq.question}"`}
                  onClick={() => onToggle(faq)}
                />
              </td>
              <td>
                <div className="faq-table-actions">
                  <button className="faq-table-edit" onClick={() => onEdit(faq)}>
                    Edit
                  </button>
                  <button
                    className="faq-table-delete"
                    onClick={() => onDelete(faq._id)}
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
  );
};

export default FAQTable;
