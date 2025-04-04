import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaBook, FaUsers, FaExchangeAlt, FaKey, FaSignOutAlt } from "react-icons/fa";
import { toast } from "sonner";

interface ConnectionStatus {
  status?: string;
  realmId?: string;
  tokenExpires?: string;
}

interface NavbarProps  {
  connectionStatus: ConnectionStatus
}

const Navbar: React.FC<NavbarProps> = ({connectionStatus}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue-500 font-bold" : "text-gray-700";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realmId: connectionStatus.realmId })
      });

      if (response.ok) {
        // Clear local storage or authentication state if needed
        toast.success("Logged out successfully!");
        navigate("/");
        window.location.reload();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out.");
    }
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-900">QuickBooks Integration</div>
      <ul className="flex space-x-6">
        <li>
          <Link to="/dashboard" className={`flex items-center space-x-2 ${isActive("/dashboard")}`}>
            <FaHome /> <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/chart-of-accounts" className={`flex items-center space-x-2 ${isActive("/chart-of-accounts")}`}>
            <FaBook /> <span>Accounts</span>
          </Link>
        </li>
        <li>
          <Link to="/payees" className={`flex items-center space-x-2 ${isActive("/payees")}`}>
            <FaUsers /> <span>Payees</span>
          </Link>
        </li>
        <li>
          <Link to="/transactions" className={`flex items-center space-x-2 ${isActive("/transactions")}`}>
            <FaExchangeAlt /> <span>Transactions</span>
          </Link>
        </li>
        <li>
          <Link to="/token-status" className={`flex items-center space-x-2 ${isActive("/token-status")}`}>
            <FaKey /> <span>Auth</span>
          </Link>
        </li>
      </ul>
      <button onClick={handleLogout} className="flex items-center space-x-2 text-red-500 hover:text-red-700 cursor-pointer">
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default Navbar;
