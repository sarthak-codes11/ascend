import './App.css';
import {useEffect, useState} from 'react';
import {useAuth} from './AuthContext';
// Explicitly import the TypeScript versions so we use the new UI components
import Login from './Login.tsx';
import SkillQuestionnaire from './SkillQuestionnaire.tsx';
import SkillDashboard from './SkillDashboard.tsx';
import {doc, getDoc} from 'firebase/firestore';
import {db} from './firebase';

function App() {
  const {user, loading} = useAuth();
  const [hasAssessment, setHasAssessment] = useState(null);

  useEffect(() => {
    if (!user) {
      setHasAssessment(null);
      return;
    }

    let cancelled = false;

    const checkAssessment = async () => {
      try {
        const ref = doc(db, 'assessments', user.uid);
        const snap = await getDoc(ref);
        if (!cancelled) {
          setHasAssessment(snap.exists());
        }
      } catch (e) {
        // If something goes wrong, fall back to showing the questionnaire
        console.error('Failed to check assessment document', e);
        if (!cancelled) {
          setHasAssessment(false);
        }
      }
    };

    checkAssessment();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (!user) {
    // Render the full-screen Ascend login experience
    return <Login />;
  }

  if (hasAssessment === null) {
    return <div className="App">Preparing your assessment...</div>;
  }

  if (hasAssessment) {
    return <SkillDashboard />;
  }

  return <SkillQuestionnaire />;
}

export default App;
