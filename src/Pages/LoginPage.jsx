// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './Supabase';
import '../CSS/Auth.css'; // Import your CSS file for styling

// Every sign-in path used to fail into console.error only, so a wrong password
// looked like a dead button. Surface the reason the way the rest of the app does.
//
// SweetAlert is imported on demand: the login screen is in the entry bundle, and
// an alert library is only needed once something has actually gone wrong.
async function showAlert(options) {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire(options);
}

function showAuthError(error, fallback = 'Please try again.') {
  return showAlert({
    icon: 'error',
    title: 'Sign in failed',
    text: error?.message || fallback,
  });
}

const Login = ({ setAuthenticated, setUserID }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSignInWithGoogle(response) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });
    if (error) {
      console.error('Error logging in with Google:', error);
      showAuthError(error);
      return;
    }
    await completeSignIn(data);
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
    if (!email || !password) {
      showAlert({
        icon: 'warning',
        title: 'Missing details',
        text: 'Enter both your email and password.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Error logging in:', error);
        showAuthError(error, 'Check your email and password.');
        return;
      }
      await completeSignIn(data);
    } catch (error) {
      console.error('Error logging in:', error);
      showAuthError(error, 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  async function signInWithDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    });
    if (error) {
      console.error('Authentication Failed:', error.message);
      showAuthError(error);
    }
  }

  /**
   * Publishes the signed-in user before navigating. The id comes from the
   * sign-in response itself; the previous version fired a second getUser()
   * request and navigated without waiting for it, so the app could land on the
   * home page with an empty user id.
   */
  const completeSignIn = async (data) => {
    let userId = data?.user?.id;
    if (!userId) {
      const { data: current } = await supabase.auth.getUser();
      userId = current?.user?.id;
    }
    if (!userId) {
      showAuthError(null, 'Signed in, but the session could not be read.');
      return;
    }
    setUserID(userId);
    setAuthenticated(true);
    navigate('/');
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
          className="auth-input"
        />
        <button
          onClick={handleLogin}
          className="auth-button"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Login'}
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
