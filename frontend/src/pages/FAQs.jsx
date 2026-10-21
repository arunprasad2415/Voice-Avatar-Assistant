import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import FAQForm from "../components/FAQForm";
import FAQTable from "../components/FAQTable";
import faqService from "../services/faqService";
import "../styles/pages/FAQs.css";

const FAQs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  // A question handed over from the dashboard's "Add as FAQ".
  const [draft, setDraft] = useState(() =>
    location.state?.question ? { question: location.state.question } : null
  );

  const clearDraft = () => {
    setDraft(null);
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  };

  const loadFaqs = () =>
    faqService
      .getFAQs()
      .then((res) => setFaqs(res.data || []))
      .catch((error) => console.error("Failed to load FAQs:", error.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleSubmit = async (payload) => {
    if (editing) {
      await faqService.updateFAQ(editing._id, payload);
    } else {
      await faqService.createFAQ(payload);
    }
    setEditing(null);
    clearDraft();
    loadFaqs();
  };

  const handleEdit = (faq) => {
    setEditing(faq);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditing(null);
    clearDraft();
  };

  const handleToggle = async (faq) => {
    const isActive = !faq.isActive;
    setFaqs((prev) => prev.map((f) => (f._id === faq._id ? { ...f, isActive } : f)));
    try {
      await faqService.updateFAQ(faq._id, { isActive });
    } catch (error) {
      console.error("Failed to update FAQ:", error.message);
      loadFaqs();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) {
      return;
    }
    try {
      await faqService.deleteFAQ(id);
      if (editing?._id === id) {
        setEditing(null);
      }
      loadFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ:", error.message);
    }
  };

  const formInitial = editing || draft;

  return (
    <AdminLayout>
      <div className="faqs">
        <h1 className="faqs-title">FAQs</h1>

        <div className="faqs-layout">
          <FAQForm
            key={editing?._id || (draft ? "draft" : "new")}
            initial={formInitial}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />

          {loading ? (
            <p className="faqs-loading">Loading...</p>
          ) : (
            <FAQTable
              faqs={faqs}
              editingId={editing?._id}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FAQs;
