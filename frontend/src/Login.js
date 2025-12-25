import React, { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "./AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      let message = "Failed to log in";
      if (err instanceof FirebaseError) {
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          message = "Invalid credentials";
        } else if (err.code === "auth/invalid-email") {
          message = "Invalid email";
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
