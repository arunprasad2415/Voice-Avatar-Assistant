import { useState } from "react";
import "../styles/components/FAQForm.css";

const EMPTY_FORM = { question: "", answer: "", category: "general", keywords: "" };

// Remount with a new `key` to load different `initial` values (an FAQ to edit, or a drafted question).
const FAQForm = ({ initial, onSubmit, onCancel }) => {
  const isEditing = Boolean(initial?._id);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...initial,
    keywords: initial?.keywords?.join(", ") || "",
  }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.question.trim() || !form.answer.trim()) {
      setError("Question and answer are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        keywords: form.keywords
          ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
      };
      await onSubmit(payload);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save FAQ. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`faq-form ${isEditing ? "faq-form-editing" : ""}`} onSubmit={handleSubmit}>
      <h2 className="faq-form-title">{isEditing ? "Edit FAQ" : "Add FAQ"}</h2>

      {error && <div className="faq-form-error">{error}</div>}

      <div className="faq-form-group">
        <label htmlFor="question">Question</label>
        <input
          id="question"
          name="question"
          type="text"
          value={form.question}
          onChange={handleChange}
          placeholder="e.g. What are your business hours?"
        />
      </div>

      <div className="faq-form-group">
        <label htmlFor="answer">Answer</label>
        <textarea
          id="answer"
          name="answer"
          value={form.answer}
          onChange={handleChange}
          placeholder="The answer the assistant will give"
          rows="3"
        />
      </div>

      <div className="faq-form-row">
        <div className="faq-form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="pricing">Pricing</option>
            <option value="support">Support</option>
            <option value="product">Product</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="faq-form-group">
          <label htmlFor="keywords">Keywords (comma separated)</label>
          <input
            id="keywords"
            name="keywords"
            type="text"
            value={form.keywords}
            onChange={handleChange}
            placeholder="price, cost, pricing"
          />
        </div>
      </div>

      <div className="faq-form-actions">
        <button type="submit" className="faq-form-button" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Save changes" : "Add FAQ"}
        </button>
        {initial && (
          <button type="button" className="faq-form-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default FAQForm;