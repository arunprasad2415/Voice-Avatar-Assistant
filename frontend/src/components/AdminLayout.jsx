import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/components/AdminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Navbar />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;