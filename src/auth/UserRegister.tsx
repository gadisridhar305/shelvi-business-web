
import { useState } from "react";
import type { FormEvent } from "react";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  MapPin,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import "./Auth.css";

type UserRegisterProps = {
  onGoToLogin?: () => void;
  onBack?: () => void;
};

type FormData = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  country: string;
  state: string;
  city: string;
  language: string;
  device: string;
};

const initialForm: FormData = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  country: "India",
  state: "",
  city: "",
  language: "",
  device: "",
};

export default function UserRegister({
  onGoToLogin,
  onBack,
}: UserRegisterProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            phone: form.phone,
            email: form.email.trim().toLowerCase(),
            password: form.password,
            country: form.country,
            state: form.state,
            city: form.city,
            language: form.language,
            device: form.device,
            deviceInfo: navigator.userAgent,
            role: "worker",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(
        "Registration successful! Please log in using your registered email and password."
      );
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card user-register-card">
        <button
          type="button"
          className="auth-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="auth-brand">
          <div className="auth-brand-logo">S</div>
          <div>
            <h1>SHELVI</h1>
            <span>CAMPAIGN PLATFORM</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="auth-heading-icon user-icon">
            <UserPlus size={23} />
          </div>
          <h2>User / Worker Registration</h2>
          <p>
            Create your worker account and start discovering tasks and
            earning rewards.
          </p>
        </div>

        {error && (
          <div className="auth-message auth-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message auth-success" role="status">
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <label className="auth-field full-width">
              Full name *
              <span className="auth-input-wrap">
                <UserRound size={18} />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) =>
                    updateField("fullName", e.target.value)
                  }
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              Phone number *
              <span className="auth-input-wrap">
                <Phone size={18} />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  autoComplete="tel"
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              Email address *
              <span className="auth-input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="auth-field full-width">
              Password *
              <span className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    updateField("password", e.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <label className="auth-field">
              Country *
              <span className="auth-input-wrap">
                <Globe size={18} />
                <select
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  required
                >
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </span>
            </label>

            <label className="auth-field">
              State *
              <span className="auth-input-wrap">
                <MapPin size={18} />
                <input
                  type="text"
                  placeholder="Enter your state"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              City *
              <span className="auth-input-wrap">
                <MapPin size={18} />
                <input
                  type="text"
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              Preferred language *
              <span className="auth-input-wrap">
                <Globe size={18} />
                <select
                  value={form.language}
                  onChange={(e) => updateField("language", e.target.value)}
                  required
                >
                  <option value="">Select language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Other">Other</option>
                </select>
              </span>
            </label>

            <label className="auth-field full-width">
              Device information *
              <span className="auth-input-wrap">
                <Smartphone size={18} />
                <select
                  value={form.device}
                  onChange={(e) => updateField("device", e.target.value)}
                  required
                >
                  <option value="">Select your device</option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </span>
            </label>
          </div>

          <p className="auth-required-note">
            * All fields are required.
          </p>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create User Account"}
          </button>
        </form>

        <div className="auth-switch">
          Already registered?
          <button type="button" onClick={onGoToLogin}>
            User Login
          </button>
        </div>

        <p className="auth-footer">
          © 2026 SHELVI Campaign Platform
        </p>
      </section>
    </main>
  );
}
