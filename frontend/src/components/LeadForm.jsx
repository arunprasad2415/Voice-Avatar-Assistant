import { useState } from "react";
import leadService from "../services/leadService";
import { isValidEmail } from "../utils/emailValidation";
import "../styles/components/LeadForm.css";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const LeadForm = ({ onBack }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await leadService.createLead(form);

      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const backButton = onBack && (
    <button type="button" className="lead-form-back" onClick={onBack}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to chat
    </button>
  );

  if (success) {
    return (
      <div className="lead-form lead-form-done">
        {backButton}

        <div className="lead-form-success">
          <span className="lead-form-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h2>Thank you</h2>
          <p>We have received your details and will contact you shortly.</p>

          <button
            type="button"
            className="lead-form-reset"
            onClick={() => setSuccess(false)}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      {backButton}

      <h2 className="lead-form-title">Leave your details</h2>
      <p className="lead-form-subtitle">
        Our team will reach out to you personally.
      </p>

      {error && <div className="lead-form-error">{error}</div>}

      <div className="lead-form-row">
        <div className="lead-form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

        <div className="lead-form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="lead-form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Optional"
          autoComplete="tel"
        />
      </div>

      <div className="lead-form-group lead-form-group-grow">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="How can we help?"
        />
      </div>

      <button
        type="submit"
        className="lead-form-button"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send details"}
      </button>
    </form>
  );
};

export default LeadForm;
