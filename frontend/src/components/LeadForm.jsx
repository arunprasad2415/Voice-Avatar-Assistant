import { useState } from "react";
import leadService from "../services/leadService";
import { isValidEmail } from "../utils/emailValidation";
import "../styles/components/LeadForm.css";

const LeadForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

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

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="lead-form-success">
        <h2>Thank You!</h2>

        <p>
          We have received your details and will contact you shortly.
        </p>

        <button
          type="button"
          className="lead-form-reset"
          onClick={() => setSuccess(false)}
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h2 className="lead-form-title">
        Leave Your Details
      </h2>

      <p className="lead-form-subtitle">
        Fill in the form and our team will reach out to you.
      </p>

      {error && (
        <div className="lead-form-error">
          {error}
        </div>
      )}

      <div className="lead-form-group">
        <label htmlFor="name">
          Name
        </label>

        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your name"
        />
      </div>

      <div className="lead-form-group">
        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
      </div>

      <div className="lead-form-group">
        <label htmlFor="phone">
          Phone
        </label>

        <input
          id="phone"
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter your phone"
        />
      </div>

      <div className="lead-form-group">
        <label htmlFor="message">
          Message
        </label>

        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          placeholder="How can we help?"
        />
      </div>

      <button
        type="submit"
        className="lead-form-button"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default LeadForm;