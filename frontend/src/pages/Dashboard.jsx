import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import leadService from "../services/leadService";
import faqService from "../services/faqService";
import voiceService from "../services/voiceService";
import "../styles/pages/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({ leads: 0, faqs: 0, voiceResponses: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [leadsRes, faqsRes, voiceRes] = await Promise.all([
          leadService.getLeads(),
          faqService.getFAQs(),
          voiceService.getVoiceResponses(),
        ]);

        setStats({
          leads: leadsRes.data?.length || 0,
          faqs: faqsRes.data?.length || 0,
          voiceResponses: voiceRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error.message);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Overview of your voice assistant.</p>

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <div className="dashboard-card-label">Total Leads</div>
          <div className="dashboard-card-value">{stats.leads}</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-label">FAQs</div>
          <div className="dashboard-card-value">{stats.faqs}</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-label">Voice Responses</div>
          <div className="dashboard-card-value">{stats.voiceResponses}</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;