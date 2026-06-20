import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import FAQForm from "../components/FAQForm";
import FAQTable from "../components/FAQTable";
import faqService from "../services/faqService";
import "../styles/pages/FAQs.css";

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await faqService.getFAQs();
      setFaqs(res.data || []);
    } catch (error) {
      console.error("Failed to load FAQs:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleAdd = async (payload) => {
    await faqService.createFAQ(payload);
    loadFaqs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) {
      return;
    }
    try {
      await faqService.deleteFAQ(id);
      loadFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ:", error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="faqs">
        <h1 className="faqs-title">FAQs</h1>

        <div className="faqs-layout">
          <FAQForm onSubmit={handleAdd} />

          {loading ? (
            <p className="faqs-loading">Loading...</p>
          ) : (
            <FAQTable faqs={faqs} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FAQs;