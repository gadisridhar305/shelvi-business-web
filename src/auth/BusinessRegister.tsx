

import { useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Globe,
  MapPin,
  Eye,
  EyeOff,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";
import "./Auth.css";


type BusinessRegisterProps = {
  onGoToLogin?: () => void;
  onBack?: () => void;
};

type BusinessAccount = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  country: string;
  businessName: string;
  businessCategory: string;
  location: string;
  role: "business";
  verificationStatus: "Pending";
  createdAt: string;
};

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  businessName: string;
  businessCategory: string;
  location: string;
};

const STORAGE_KEY = "shelvi_demo_business_registrations";

const initialForm: FormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  country: "India",
  businessName: "",
  businessCategory: "",
  location: "",
};

async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getBusinessAccounts(): BusinessAccount[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as BusinessAccount[]) : [];
  } catch {
    return [];
  }
}

export default function BusinessRegister({
  onGoToLogin,
  onBack,
}: BusinessRegisterProps) {
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

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const businessName = form.businessName.trim();
    const location = form.location.trim();

    if (fullName.length < 2) {
      setError("Please enter the contact person's name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid business email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (
      !form.country ||
      !businessName ||
      !form.businessCategory ||
      !location
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const accounts = getBusinessAccounts();

      const emailExists = accounts.some(
        (account) => account.email.toLowerCase() === email
      );

      if (emailExists) {
        setError("This email is already registered. Please log in.");
        return;
      }

      const phoneExists = accounts.some(
        (account) => account.phone === phone
      );

      if (phoneExists) {
        setError("This phone number is already registered.");
        return;
      }

      const passwordHash = await hashPassword(form.password);

      const newAccount: BusinessAccount = {
        id: `business_${Date.now()}`,
        fullName,
        email,
        phone,
        passwordHash,
        country: form.country,
        businessName,
        businessCategory: form.businessCategory,
        location,
        role: "business",
        verificationStatus: "Pending",
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));

      setForm(initialForm);
      setSuccess(
        "Business registration successful! You can now log in using your registered email and password."
      );
    } catch (err) {
      console.error("Business demo registration error:", err);
      setError("Unable to save your registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card business-register-card">
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
          <div className="auth-heading-icon business-icon">
            <Building2 size={23} />
          </div>

          <h2>Business Registration</h2>

          <p>
            Register your business to create campaigns, reach users
            and manage your campaign performance.
          </p>
        </div>

        {error && (
          <div className="auth-message auth-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message auth-success" role="status">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <label className="auth-field full-width">
              Contact person name *
              <span className="auth-input-wrap">
                <UserRound size={18} />
                <input
                  type="text"
                  placeholder="Enter contact person's name"
                  value={form.fullName}
                  onChange={(e) =>
                    updateField("fullName", e.target.value)
                  }
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              Business email *
              <span className="auth-input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="Enter business email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  autoComplete="email"
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
                  placeholder="10-digit phone number"
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
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </span>
            </label>

            <label className="auth-field">
              Country *
              <span className="auth-input-wrap">
                <Globe size={18} />
                <select
                  value={form.country}
                  onChange={(e) =>
                    updateField("country", e.target.value)
                  }
                  required
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">
                    United Arab Emirates
                  </option>
                  <option value="Other">Other</option>
                </select>
              </span>
            </label>

            <label className="auth-field">
              Business category *
              <span className="auth-input-wrap">
                <BriefcaseBusiness size={18} />
                <select
                  value={form.businessCategory}
                  onChange={(e) =>
                    updateField("businessCategory", e.target.value)
                  }
                  required
                >
                  <option value="">Select category</option>
                  <option value="Retail & E-commerce">
                    Retail & E-commerce
                  </option>
                  <option value="Technology & Software">
                    Technology & Software
                  </option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Travel & Tourism">Travel & Tourism</option>
                  <option value="Media & Entertainment">
                    Media & Entertainment
                  </option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </span>
            </label>

            <label className="auth-field full-width">
              Business name *
              <span className="auth-input-wrap">
                <Building2 size={18} />
                <input
                  type="text"
                  placeholder="Enter your business or company name"
                  value={form.businessName}
                  onChange={(e) =>
                    updateField("businessName", e.target.value)
                  }
                  maxLength={150}
                  required
                />
              </span>
            </label>

            <label className="auth-field full-width">
              Business location *
              <span className="auth-input-wrap">
                <MapPin size={18} />
                <input
                  type="text"
                  placeholder="Enter city, state or business address"
                  value={form.location}
                  onChange={(e) =>
                    updateField("location", e.target.value)
                  }
                  maxLength={250}
                  required
                />
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
            {loading ? "Creating account..." : "Create Business Account"}
          </button>
        </form>

        <div className="auth-switch">
          Already registered?
          <button
            type="button"
            onClick={onGoToLogin}
          >
            Business Login
          </button>
        </div>

        <p className="auth-footer">
          © 2026 SHELVI Campaign Platform · Demo Mode
        </p>
      </section>
    </main>
  );
}
