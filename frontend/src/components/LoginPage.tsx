import React from "react";
import { FaQuinscape } from "react-icons/fa";
// import axios from "axios";

const LoginPage: React.FC = () => {

  const handleLogin = async () => {
    try {
        window.location.href = `${import.meta.env.VITE_APP_URL}/auth`;
    } catch (error) {
      console.error("Error initiating auth:", error);
      alert("Failed to connect to authentication service");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96 text-center">
        <div className="flex flex-col items-center">
          <FaQuinscape className="text-green-600 text-5xl mb-4" />
          <h1 className="text-xl font-semibold">QuickBooks Integration</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Connect your QuickBooks account to manage your financial data
        </p>
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
          onClick={handleLogin}
        >
          Connect with QuickBooks
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
