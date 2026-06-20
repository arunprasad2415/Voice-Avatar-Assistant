import { NavLink, Link } from "react-router-dom";
import "../styles/components/Sidebar.css";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/voice-responses", label: "Voice Responses" },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Admin Panel</div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-assistant-link">
          ← Go to Voice Assistant
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;