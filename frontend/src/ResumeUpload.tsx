import React, { useState } from "react";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import Logo from "./Logo.tsx";

// Simple, first-step resume upload screen for new users.
// In a real app you would also upload the file to Firebase Storage
// and trigger analysis via Cloud Functions. Here we just
// register that a resume exists and create a placeholder
// resumeAnalysis document so the dashboard can show stats later.

const ResumeUpload: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-600">You need to be logged in to upload your resume.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError("Please select a resume file to upload.");
      return;
    }

    try {
      setSaving(true);

      // Placeholder Firestore document indicating a resume is present.
      // Downstream services can update this document with real analysis
      // once the file has been processed.
      const ref = doc(db, "resumeAnalysis", user.uid);
      await setDoc(
        ref,
        {
          hasResume: true,
          fileName: file.name,
          uploadedAt: serverTimestamp(),
          // Initial placeholder values for dashboard
          score: 0,
          detectedSkills: [],
          missingSkills: [],
        },
        { merge: true },
      );

      setSuccess(true);

      // Simple approach: refresh so App can re-check Firestore and
      // route the user to the dashboard.
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Failed to save resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Logo size={28} />
            <h1 className="text-2xl font-semibold text-gray-900">Upload your resume</h1>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            We&apos;ll analyze your resume to compute a score and highlight skills that are detected
            or missing. You can upload a PDF or DOCX.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-background">
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-gray-900">Select resume file</span>
                <span className="text-xs text-gray-500">
                  {file ? file.name : "PDF or DOCX, up to a few MB"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {error && (
              <div className="text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                Resume saved. Redirecting to your dashboard...
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Saving..." : "Continue to dashboard"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResumeUpload;
