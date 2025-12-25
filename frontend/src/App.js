import './App.css';
import { useAuth } from './AuthContext';
import Login from './Login';
import Signup from './Signup';
import LogoutButton from './LogoutButton';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="App">
        <h1>Welcome</h1>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Login />
          <Signup />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Logged in as {user.email}</h1>
      <LogoutButton />
    </div>
  );
}

export default App;
