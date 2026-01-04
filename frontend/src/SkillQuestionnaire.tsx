import React, {useState} from 'react';
import {FirebaseError} from 'firebase/app';
import {getApp} from 'firebase/app';
import {connectFunctionsEmulator, getFunctions, httpsCallable} from 'firebase/functions';
import ResumeUpload from './ResumeUpload.tsx';
import HackathonInformer from './HackathonInformer.tsx';
import InterviewQuestions from './InterviewQuestions.tsx';
import {useAuth} from './AuthContext';
import {doc, getDoc} from 'firebase/firestore';
import {db} from './firebase';
import Logo from './Logo.tsx';
import Button from './Button.tsx';

 type Answers = {
  frontend: number;
  backend: number;
  dsa: number;
  databases: number;
  devops: number;
  systemDesign: number;
 };

 const categories: {key: keyof Answers; label: string}[] = [
  {key: 'frontend', label: 'Frontend'},
  {key: 'backend', label: 'Backend'},
  {key: 'dsa', label: 'Data Structures & Algorithms'},
  {key: 'databases', label: 'Databases'},
  {key: 'devops', label: 'DevOps'},
  {key: 'systemDesign', label: 'System Design'},
 ];

 const SkillQuestionnaire: React.FC = () => {
  const {user} = useAuth();
  const [answers, setAnswers] = useState<Answers>({
    frontend: 0,
    backend: 0,
    dsa: 0,
    databases: 0,
    devops: 0,
    systemDesign: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState<"selection" | "hackathon" | "resume" | "interview" | null>(null);
  const [remoteSkills, setRemoteSkills] = useState<string[] | null>(null);

  const deriveSkills = (a: Answers): string[] => {
    return categories
      .filter((c) => a[c.key] >= 2)
      .map((c) => c.label);
  };

  const handleChange = (key: keyof Answers, value: number) => {
    setAnswers((prev) => ({...prev, [key]: value}));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const app = getApp();
      const functions = getFunctions(app);

      if (window.location.hostname === 'localhost') {
        try {
          connectFunctionsEmulator(functions, '127.0.0.1', 5001);
        } catch (e) {
          // ignore "already connected" errors
        }
      }

      const analyzeSkills = httpsCallable(functions, 'analyzeSkills');
      await analyzeSkills({answers});
      setSuccess(true);
      setView('selection');
      // Optionally navigate to dashboard afterwards
      // window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      let message = 'Failed to analyze skills. Please try again.';

      if (err instanceof FirebaseError) {
        // Typical: functions/not-found, functions/unauthenticated, functions/internal, etc.
        message = `${err.code}: ${err.message}`;
      } else if (err && typeof err === 'object') {
        const anyErr = err as any;
        if (typeof anyErr?.code === 'string' && typeof anyErr?.message === 'string') {
          message = `${anyErr.code}: ${anyErr.message}`;
        } else if (typeof anyErr?.message === 'string') {
          message = anyErr.message;
        }
        if (anyErr?.details) {
          try {
            message += `\nDetails: ${JSON.stringify(anyErr.details)}`;
          } catch (e) {
            // ignore
          }
        }
      }

      setError(message);
    } finally {
      setLoading(false);
      // Show next-step selection even if function failed
      if (view === null) {
        setView('selection');
      }
    }
  };

  // When a user is present and a next-step view is open, try loading skills from Firestore
  React.useEffect(() => {
    const load = async () => {
      if (!user || !view) return;
      try {
        const ref = doc(db, 'assessments', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as { detectedSkills?: string[]; strengthAreas?: string[] };
          const s = Array.isArray(data.detectedSkills) && data.detectedSkills.length > 0
            ? data.detectedSkills
            : Array.isArray(data.strengthAreas) ? data.strengthAreas : [];
          setRemoteSkills(s.map(String));
        }
      } catch (e) {
        // ignore Firestore read errors in this UX step
      }
    };
    load();
  }, [user, view]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-2">
          <Logo size={28} />
          <h1 className="text-2xl font-semibold text-gray-900">Skill Assessment</h1>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Rate your current comfort level in each area from 0 (no experience) to 3 (strong).
        </p>

        {view === null && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {categories.map(({key, label}) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-900">{label}</label>
                  <span className="text-xs text-gray-500">{answers[key]} / 3</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={answers[key]}
                  onChange={(e) => handleChange(key, Number(e.target.value) || 0)}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>0 · No experience</span>
                  <span>1 · Basic</span>
                  <span>2 · Comfortable</span>
                  <span>3 · Strong</span>
                </div>
              </div>
            ))}

            {error && (
              <div className="text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                Skills analyzed and saved. You can now view your dashboard.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze my skills'}
            </button>
          </form>
        )}

        {view === 'selection' && (
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Choose what to do next</h2>
            <Button onClick={() => setView('hackathon')} variant="primary" className="h-16 text-lg">
              Hackathons
            </Button>
            <Button onClick={() => setView('resume')} variant="success" className="h-16 text-lg">
              Resume Check
            </Button>
            <Button onClick={() => setView('interview')} variant="warning" className="h-16 text-lg">
              Interview Qs
            </Button>
          </div>
        )}

        {view === 'resume' && (
          <div className="mt-6">
            <ResumeUpload />
          </div>
        )}

        {view === 'hackathon' && (
          <div className="mt-6">
            <HackathonInformer skills={(remoteSkills && remoteSkills.length > 0) ? remoteSkills : deriveSkills(answers)} />
          </div>
        )}

        {view === 'interview' && (
          <div className="mt-6">
            <InterviewQuestions skills={(remoteSkills && remoteSkills.length > 0) ? remoteSkills : deriveSkills(answers)} />
          </div>
        )}
      </div>
    </div>
  );
 };

 export default SkillQuestionnaire;
