// Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './Supabase';
import '../CSS/Auth.css'; // Import your CSS file for styling

// Loaded on demand -- see the note in LoginPage.jsx.
async function showAlert(options) {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire(options);
}

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const {user, error} = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        // Use Swal to display an error message
        showAlert({
          icon: 'error',
          title: 'Registration Failed',
          text: error.message,
        });
      } else {
        // Use Swal to display a success message with email verification instructions
        showAlert({
          icon: 'success',
          title: 'Registration Successful',
          html: `Registered as ${email}.<br>Please check your email for a verification link.`,
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="auth-container">
      <h1>NousIndex</h1>
      <h2>Register</h2>
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
        onClick={handleRegister}
        className="auth-button"
      >
        Register
      </button>
      <Link
        to="/login"
        className="auth-link"
      >
        Login
      </Link>
    </div>
  );
};

export default Register;
