import "../styles/components/FAQTable.css";

const FAQTable = ({ faqs, onDelete }) => {
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq._id}>
              <td>{faq.question}</td>
              <td className="faq-answer-cell">{faq.answer}</td>
              <td>
                <span className="faq-category">{faq.category}</span>
              </td>
              <td>
                <button
                  className="faq-table-delete"
                  onClick={() => onDelete(faq._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FAQTable;