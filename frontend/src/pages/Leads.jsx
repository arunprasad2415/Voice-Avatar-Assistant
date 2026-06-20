import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import LeadTable from "../components/LeadTable";
import leadService from "../services/leadService";
import api from "../services/api";
import "../styles/pages/Leads.css";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLeads = async (searchTerm = "") => {
    setLoading(true);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const res = await leadService.getLeads(params);
      setLeads(res.data || []);
    } catch (error) {
      console.error("Failed to load leads:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLeads(search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }
    try {
      await leadService.deleteLead(id);
      loadLeads(search);
    } catch (error) {
      console.error("Failed to delete lead:", error.message);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/leads/export/${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leads.${type === "excel" ? "xlsx" : "csv"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="leads">
        <div className="leads-header">
          <h1 className="leads-title">Leads</h1>
          <div className="leads-export">
            <button onClick={() => handleExport("csv")} className="leads-export-btn">
              Export CSV
            </button>
            <button onClick={() => handleExport("excel")} className="leads-export-btn">
              Export Excel
            </button>
          </div>
        </div>

        <form className="leads-search" onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
          />
          <button type="submit">Search</button>
        </form>

        {loading ? (
          <p className="leads-loading">Loading...</p>
        ) : (
          <LeadTable leads={leads} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
};

export default Leads;