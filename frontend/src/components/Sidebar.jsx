import { NavLink, Link } from "react-router-dom";
import "../styles/components/Sidebar.css";

const Icon = ({ d }) => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z" },
  { to: "/admin/leads", label: "Leads", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { to: "/admin/faqs", label: "FAQs", icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-2.9-13a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01" },
  { to: "/admin/voice-responses", label: "Voice Responses", icon: "M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm7-3a7 7 0 0 1-14 0m7 7v3" },
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
            <Icon d={item.icon} />
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
