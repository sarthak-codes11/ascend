import React from "react";
import { useAuth } from "./AuthContext";
import Button from "./Button.tsx";

const TopBarLogout: React.FC = () => {
  const { logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
      // App routing will take user to Login because user becomes null.
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="fixed top-3 right-3 z-50">
      <Button onClick={onLogout} variant="neutral" className="px-4 h-10">
        Logout
      </Button>
    </div>
  );
};

export default TopBarLogout;
