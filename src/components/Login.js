import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FacebookLogin } from 'react-facebook-login-lite';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();


  const handleGoogleSuccess = async (credentialResponse) => {
    
    const decodedToken = jwtDecode(credentialResponse.credential);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/social-login', {
        email: decodedToken.email,
        name: decodedToken.name,
      });
      console.log(response.data);
      if (response.data.user.contacts.length==0) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/managecontacts');
        
      } else {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        const from = location.state?.from || '/';
        navigate(from);
      }
     
    } catch (error) {
      console.error('Error with Google login:', error.message);
      alert('Google login failed.');
    }
  };

  const handleGoogleFailure = (response) => {
    console.error('Google Login Failed:', response);
    alert('Google login failed.');
  };

  const handleFacebookResponse = async (response) => {
   
    try {
      const { email, name } = response;
      const fbResponse = await axios.post('http://localhost:5000/api/auth/social-login', {
        email,
        name,
      });

      if (fbResponse.data.isNewUser) {
        localStorage.setItem('user', JSON.stringify(fbResponse.data.user));
        navigate('/managecontacts'); // Redirect to registration if new user
      } else {
        localStorage.setItem('user', JSON.stringify(fbResponse.data.user));
        const from = location.state?.from || '/';
        navigate(from);
       
      }
     
    } catch (error) {
      console.error('Error with Facebook login:', error.message);
      alert('Facebook login failed.');
    }
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data.user));     
      const from = location.state?.from || '/';
      navigate(from);
    } catch (error) {
      console.error('Error with email/password login:', error.message);
      alert('Invalid email or password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <p>Welcome back! Please log in to continue.</p>

        <div className="login-buttons">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            className="google-login-btn"
          />

          {/* <FacebookLogin
            appId="2071984283236132"
            autoLoad={false}
            fields="name,email,picture"
            callback={handleFacebookResponse}
            textButton="Login with Facebook"
            cssClass="facebook-login-btn"
          /> */}
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="login-form" onSubmit={handleEmailPasswordLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
