// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './Supabase';
import '../CSS/Auth.css'; // Import your CSS file for styling

const Login = ({ setAuthenticated, setUserID }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSignInWithGoogle(response) {
    console.log(response);
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });
    if (error) {
      console.error('Error logging in:', error);
    } else {
      setAuthenticated(true); // Set authenticated to true
      checkUser(); // Check the logged in user
      navigate('/'); // Redirect to the main page
    }
  }

  useEffect(() => {
    const loadGoogleSignInScript = () => {
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;

        script.onload = () => {
          // Initialize the GIS client
          window.google.accounts.id.initialize({
            client_id:
              '340937088626-ae2f5h7tsl54eetsjsggl12cp5b2qdu6.apps.googleusercontent.com',
            callback: handleSignInWithGoogle,
            itp_support: true,
          });
          // customization attributes
          window.google.accounts.id.renderButton(
            document.getElementById('g_btn_div'),
            {
              theme: 'filled_blue',
              size: 'large',
            }
          );
          window.google.accounts.id.prompt(); // also display the One Tap dialog
        };

        // Append the script to the document
        document.head.appendChild(script);
      }
    };

    loadGoogleSignInScript();
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
        checkUser(); // Check the logged in user
        navigate('/'); // Redirect to the main page
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  async function signInWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    });
    console.log(data, error);
    if (error) {
      console.error('Authentication Failed:', error.message);
    }
  }

  const checkUser = async () => {
    const currentUser = await supabase.auth.getUser();
    setUserID(currentUser.data.user.id);
  };

  return (
    <div>
      <div className="auth-container">
        <h1>NousIndex</h1>
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
        {/* Discord Sign-In Button */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
          integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center justify-center w-full">
          <button
            id="discord_signin"
            onClick={signInWithDiscord}
            className="discord-login-button"
          >
            <div className="flex items-center justify-start">
              <i className="fa-brands fa-discord text-l"></i>
            </div>
            <div className="discord-login-text">Login with Discord</div>
          </button>
        </div>
        <div className="google-sign-in-button">
          <div id="g_btn_div"></div>
        </div>{' '}
      </div>
    </div>
  );
};

export default Login;
