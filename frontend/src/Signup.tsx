import React, { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "./AuthContext";

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      let message = "Failed to sign up";
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          message = "User already exists";
        } else if (err.code === "auth/invalid-email") {
          message = "Invalid email";
        } else if (err.code === "auth/weak-password") {
          message = "Password is too weak";
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Signup;
