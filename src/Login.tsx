
import { useState } from "react";
import { LockKeyhole, User, Eye, EyeOff } from "lucide-react";
import "./Login.css";

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === "admin" && password === "1234") {
      setError("");
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">S</div>

        <h1>SHELVI</h1>
        <p className="login-subtitle">Campaign Platform</p>

        <h2>Welcome back!</h2>
        <p className="login-description">
          Sign in to access your dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <div className="login-input">
            <User size={18} />
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">
            Login to Dashboard
          </button>
        </form>

        <p className="login-footer">
          SHELVI Campaign Management Platform
        </p>
      </div>
    </div>
  );
}
