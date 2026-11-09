import { useState, type FormEvent } from "react";
import { LockKeyhole, UserRound } from "lucide-react";
import type { WorkerUser } from "../worker/WorkerDashboard";
import "./LocalLogin.css";

type UserLoginProps = {
  onLogin: (worker: WorkerUser) => void;
};

// Local demo credentials
const USER_USERNAME = "worker";
const USER_PASSWORD = "user123";

export default function UserLogin({ onLogin }: UserLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      username.trim().toLowerCase() !== USER_USERNAME.toLowerCase() ||
      password !== USER_PASSWORD
    ) {
      setError("Incorrect username or password.");
      return;
    }

    // Send the authenticated demo worker to App.tsx.
    // handleWorkerLogin in App.tsx saves the session and opens the dashboard.
    const worker: WorkerUser = {
      id: "demo-worker",
      fullName: "Demo Worker",
      email: "worker@shelvi.demo",
      phone: "",
      country: "India",
      state: "",
      city: "",
      language: "English",
      device: "Desktop",
      role: "worker",
      verificationStatus: "Pending",
    };

    onLogin(worker);
  }

  return (
    <main className="local-login-page">
      <section className="local-login-card">
        <div className="local-login-brand">
          <span className="local-login-logo">S</span>
          <div>
            <strong>SHELVI</strong>
            <small>USER PORTAL</small>
          </div>
        </div>

        <div className="local-login-heading">
          <span className="local-login-icon">
            <UserRound size={22} />
          </span>
          <h1>User Login</h1>
          <p>Sign in to access your worker dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="local-login-form">
          <label>
            Username
            <span className="local-login-input">
              <UserRound size={17} />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </span>
          </label>

          <label>
            Password
            <span className="local-login-input">
              <LockKeyhole size={17} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </span>
          </label>

          {error && (
            <p className="local-login-error" role="alert">
              {error}
            </p>
          )}

          <button className="local-login-submit" type="submit">
            Login
          </button>
        </form>

        <p className="local-login-hint">
          Demo username: <strong>worker</strong>
          <br />
          Demo password: <strong>user123</strong>
        </p>
      </section>
    </main>
  );
}
