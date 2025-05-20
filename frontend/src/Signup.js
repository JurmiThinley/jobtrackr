import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './styles.css';

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const response = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Signup successful! You can now log in.");
      setUsername("");
      setPassword("");
      // Optionally redirect to login after a delay
      setTimeout(() => navigate("/"), 2000);
    } else {
      setError(data.msg || "Signup failed");
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
      <p className="link-text">
        Already have an account? <Link to="/">Log in here</Link>
      </p>
    </div>
  );
}

export default Signup;
