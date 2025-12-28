import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";

// Shape of the resume analysis document in Firestore
// Collection: "resumeAnalysis"
// Doc ID: user.uid
// Example document:
// {
//   score: 82,
//   detectedSkills: ["React", "TypeScript", "Firebase"],
//   missingSkills: ["GraphQL", "Docker"]
// }

type ResumeAnalysis = {
  score: number;
  detectedSkills: string[];
  missingSkills: string[];
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, "resumeAnalysis", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No resume analysis found for this account.");
        } else {
          const raw = snap.data();
          setData({
            score: raw.score ?? 0,
            detectedSkills: Array.isArray(raw.detectedSkills) ? raw.detectedSkills : [],
            missingSkills: Array.isArray(raw.missingSkills) ? raw.missingSkills : [],
          });
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load resume analysis. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user]);

  if (!user) {
    // This component assumes auth has already happened; just guard against misuse.
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-600">You need to be logged in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-secondary/40 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Ascend</p>
            <p className="text-xs text-gray-500">Career dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
          <SidebarItem label="Resume" active />
          <SidebarItem label="Hackathons" disabled helper="Coming soon" />
          <SidebarItem label="Mock Interviews" disabled helper="Coming soon" />
          <SidebarItem label="Skill Roadmap" disabled helper="Coming soon" />
        </nav>

        <div className="px-4 py-4 border-t border-gray-200 text-xs text-gray-500">
          Logged in as {user.email}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-6 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resume Overview</h1>
            <p className="text-sm text-gray-600 mt-1">
              Snapshot of how your current resume aligns with common hiring expectations.
            </p>
          </div>
        </header>

        {loading && (
          <div className="text-sm text-gray-600">Loading resume analysis...</div>
        )}

        {!loading && error && (
          <div className="text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-md px-4 py-3 max-w-xl">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6 max-w-3xl">
            <ScoreCard score={data.score} />

            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Skills detected on your resume</h2>
              {data.detectedSkills.length === 0 ? (
                <p className="text-sm text-gray-500">No skills were detected on your resume.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.detectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Skills you might want to add</h2>
              {data.missingSkills.length === 0 ? (
                <p className="text-sm text-gray-500">We didn’t find any obvious missing skills at the moment.</p>
              ) : (
                <ul className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {data.missingSkills.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 bg-background"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

type SidebarItemProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  helper?: string;
};

const SidebarItem: React.FC<SidebarItemProps> = ({ label, active, disabled, helper }) => {
  const base =
    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors select-none";

  const classes = [base];
  if (active) {
    classes.push("bg-white text-gray-900 font-semibold shadow-sm");
  } else if (disabled) {
    classes.push("text-gray-400 cursor-not-allowed bg-transparent");
  } else {
    classes.push("text-gray-700 hover:bg-gray-100");
  }

  return (
    <button type="button" className={classes.join(" ")} disabled={disabled}>
      <span>{label}</span>
      {helper && (
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {helper}
        </span>
      )}
    </button>
  );
};

type ScoreCardProps = {
  score: number;
};

const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  const normalized = Math.max(0, Math.min(100, score));

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-4 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Resume score</h2>
          <p className="text-xs text-gray-500 mt-1">
            Higher scores indicate stronger alignment with typical job descriptions.
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-semibold text-indigo-600">{normalized}</span>
          <span className="text-sm text-gray-500 ml-1">/ 100</span>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </section>
  );
};

export default Dashboard;
