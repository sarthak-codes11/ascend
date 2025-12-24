import React, { useState } from "react";
import { useAuth } from "./AuthContext";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await logout();
    } catch (e) {
      setError("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Logging out..." : "Log Out"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LogoutButton;
