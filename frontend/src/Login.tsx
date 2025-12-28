import React, { useState } from "react";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { auth } from "./firebase";

const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        await login(email, password);
      } else {
        // signup mode
        await signup(email, password);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      let message = mode === "login" ? "Failed to sign in" : "Failed to sign up";
      if (err instanceof FirebaseError) {
        if (mode === "login") {
          if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
            message = "Invalid credentials";
          } else if (err.code === "auth/invalid-email") {
            message = "Invalid email address";
          }
        } else {
          if (err.code === "auth/email-already-in-use") {
            message = "User already exists";
          } else if (err.code === "auth/invalid-email") {
            message = "Invalid email";
          } else if (err.code === "auth/weak-password") {
            message = "Password is too weak";
          }
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route for Google login
    window.location.href = "/auth/google";
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);

    if (!email) {
      setError("Please enter your email first to reset your password");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      let message = "Failed to send reset email";
      if (err instanceof FirebaseError && err.code === "auth/invalid-email") {
        message = "Invalid email address";
      }
      setError(message);
    }
  };

  const handleSwitchMode = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side: Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5">
          <div className="flex flex-col justify-center px-8 lg:px-16 py-12 bg-gradient-to-br from-indigo-50 to-blue-50 w-full">
            <div className="max-w-md">
              {/* Logo and brand */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
                  <svg
                    className="w-9 h-9 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17L17 7M17 7H7M17 7V17"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">Ascend</h1>
                </div>
              </div>

              {/* Tagline and description */}
              <div className="mb-10">
                <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
                  Level up your career, one step at a time
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Your AI-powered companion for interview prep, resume building, and discovering the best hackathons.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">Interview Mastery</h3>
                    <p className="text-sm text-gray-600">Practice with AI-powered mock interviews tailored to your field</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 20h16M4 10l6-6 4 4 6-6" />
                      <path d="M2 12l4-4 4 4 4-4 4 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">Resume Excellence</h3>
                    <p className="text-sm text-gray-600">Build standout resumes that get past ATS and impress recruiters</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">Hackathon Discovery</h3>
                    <p className="text-sm text-gray-600">Find and participate in hackathons that match your interests</p>
                  </div>
                </div>
              </div>

              {/* Visual accent */}
              <div className="mt-12 pt-8 border-t border-indigo-200">
                <p className="text-sm text-gray-500">
                  Trusted by students at top universities worldwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Login form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 mb-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              </div>
              <h1 className="text-2xl text-gray-900">Ascend</h1>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl text-gray-900 mb-2">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-base text-gray-600">
                  {mode === "login"
                    ? "Sign in to continue your journey"
                    : "Join Ascend to start leveling up your career"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-gray-900 text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                        setResetMessage(null);
                      }}
                      className="w-full h-11 px-3 pl-10 rounded-md border border-input bg-input-background text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-gray-900 text-sm font-medium">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M9 11V8a3 3 0 0 1 6 0v3" />
                    </svg>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      className="w-full h-11 px-3 pl-10 rounded-md border border-input bg-input-background text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <svg
                      className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v5" />
                      <path d="M12 16h.01" />
                    </svg>
                    <p className="text-sm text-orange-800">{error}</p>
                  </div>
                )}

                {resetMessage && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-sm text-orange-800">{resetMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading
                    ? mode === "login"
                      ? "Signing in..."
                      : "Signing up..."
                    : mode === "login"
                      ? "Sign in"
                      : "Sign up"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-md border border-input bg-background text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </form>

              <div className="mt-8 text-center">
                {mode === "login" ? (
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={handleSwitchMode}
                      className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors underline-offset-4 hover:underline"
                    >
                      Sign up for free
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={handleSwitchMode}
                      className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors underline-offset-4 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-gray-700 hover:text-gray-900 underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-gray-700 hover:text-gray-900 underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
