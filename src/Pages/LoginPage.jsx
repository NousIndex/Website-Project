// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './Supabase';
import '../CSS/Auth.css'; // Import your CSS file for styling

const Login = ({ setAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Use useEffect to check if the user is signed in when the component mounts
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await supabase.auth.getUser();
      console.log('Logged in as', currentUser.error);
    };

    checkUser();
  }, []);

  const handleLogin = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Error logging in:', error);
      } else {
        setAuthenticated(true); // Set authenticated to true
        navigate('/'); // Redirect to the main page
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
      />
      <button
        onClick={handleLogin}
        className="auth-button"
      >
        Login
      </button>
      <Link
        to="/register"
        className="auth-link"
      >
        Register
      </Link>
    </div>
    
  );
};

export default Login;
