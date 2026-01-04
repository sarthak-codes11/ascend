import React, {useEffect, useState} from 'react';
import {doc, getDoc} from 'firebase/firestore';
import {useAuth} from './AuthContext';
import {db} from './firebase';
import Logo from './Logo.tsx';

 type Answers = {
  frontend: number;
  backend: number;
  dsa: number;
  databases: number;
  devops: number;
  systemDesign: number;
 };

 type AssessmentDoc = {
  answers: Answers;
  detectedSkills: string[];
  missingSkills: string[];
  strengthAreas: string[];
  score: number;
  summary: string;
 };

 const SkillDashboard: React.FC = () => {
  const {user} = useAuth();
  const [data, setData] = useState<AssessmentDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, 'assessments', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('No assessment found. Please complete the questionnaire.');
        } else {
          setData(snap.data() as AssessmentDoc);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load assessment.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-600">You need to be logged in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-600">Loading your analysis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
          {error || 'No data found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <main className="flex-1 min-w-0 px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Logo size={28} />
          <h1 className="text-2xl font-semibold text-gray-900">Skill Overview</h1>
        </div>
        <p className="text-sm text-gray-600 mb-6">{data.summary}</p>

        <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Overall score</h2>
          <p className="text-3xl font-semibold text-indigo-600">
            {data.score}
            <span className="text-sm text-gray-500 ml-1">/ 100</span>
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Strength areas</h2>
          {data.strengthAreas.length === 0 ? (
            <p className="text-sm text-gray-500">No clear strengths yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.strengthAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Detected skills</h2>
          {data.detectedSkills.length === 0 ? (
            <p className="text-sm text-gray-500">We didn&apos;t infer specific skills yet.</p>
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
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Skills to develop</h2>
          {data.missingSkills.length === 0 ? (
            <p className="text-sm text-gray-500">No obvious gaps detected right now.</p>
          ) : (
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {data.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 bg-background"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
 };

 export default SkillDashboard;
