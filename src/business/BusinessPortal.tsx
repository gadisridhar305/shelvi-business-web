import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import "./BusinessPortal.css";
import {
  Building2, CheckCircle2, LockKeyhole, LogIn,
  Mail, MapPin, Phone, Upload, UserRound, ShieldCheck, LogOut, Save,
} from "lucide-react";

type BusinessProfile = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  businessName: string;
  category: string;
  location: string;
  logo: string;
  description: string;
  website: string;
  industry: string;
  state: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  billingTaxId: string;
  verificationStatus: "Not submitted" | "Pending" | "Verified" | "Rejected";
};

type StoredAccount = {
  email: string;
  passwordHash: string;
  profile: BusinessProfile;
};

const ACCOUNTS_KEY = "shelvi_demo_business_accounts";
const SESSION_KEY = "shelvi_demo_business_session";

const emptyProfile: BusinessProfile = {
  fullName: "", email: "", phone: "", country: "India", businessName: "",
  category: "Agency", location: "", logo: "", description: "", website: "",
  industry: "Marketing & Advertising", state: "", city: "", contactName: "",
  contactEmail: "", contactPhone: "", billingName: "", billingEmail: "",
  billingAddress: "", billingTaxId: "", verificationStatus: "Not submitted",
};

function readAccounts(): StoredAccount[] {
  try {
    const value = localStorage.getItem(ACCOUNTS_KEY);
    return value ? (JSON.parse(value) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function BusinessPortal({ onSessionChange }: { onSessionChange?: (email: string | null) => void } = {}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [account, setAccount] = useState<StoredAccount | null>(null);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const sessionEmail = localStorage.getItem(SESSION_KEY);
      if (!sessionEmail) return;
      const savedAccount = readAccounts().find((item) => item.email === sessionEmail);
      if (savedAccount) {
        setAccount(savedAccount);
        setProfile(savedAccount.profile);
      }
    } catch {
      // The registration and profile demo can still be used if browser storage is unavailable.
    }
  }, []);

  function updateProfile(field: keyof BusinessProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const accounts = readAccounts();
    const email = profile.email.trim().toLowerCase();
    if (accounts.some((item) => item.email === email)) {
      setError("An account with this email already exists. Please log in.");
      return;
    }
    setSaving(true);
    try {
      const nextProfile = { ...profile, email, contactName: profile.contactName || profile.fullName, contactEmail: profile.contactEmail || email, contactPhone: profile.contactPhone || profile.phone };
      const nextAccount: StoredAccount = { email, passwordHash: await hashPassword(password), profile: nextProfile };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, nextAccount]));
      localStorage.setItem(SESSION_KEY, email);
      setAccount(nextAccount);
      setProfile(nextProfile);
      onSessionChange?.(email);
      setPassword("");
      setConfirmPassword("");
      setMessage("Business account created. Complete your profile and submit it for verification when ready.");
    } catch {
      setError("Could not save the account in browser storage. Check browser storage settings and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const email = profile.email.trim().toLowerCase();
      const found = readAccounts().find((item) => item.email === email);
      if (!found || found.passwordHash !== await hashPassword(password)) {
        setError("Email or password is incorrect. If this is your first visit, register first.");
        return;
      }
      localStorage.setItem(SESSION_KEY, email);
      setAccount(found);
      setProfile(found.profile);
      onSessionChange?.(email);
      setPassword("");
      setMessage("You are logged in.");
    } catch {
      setError("Login failed in this browser. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    setError("");
    setMessage("");
    const nextAccount = { ...account, profile: { ...profile, email: account.email } };
    const accounts = readAccounts().map((item) => item.email === account.email ? nextAccount : item);
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      setAccount(nextAccount);
      setProfile(nextAccount.profile);
      setMessage("Business profile saved in this browser.");
    } catch {
      setError("Could not save the profile. The logo may be too large; try a smaller image.");
    }
  }

  function submitForVerification() {
    if (!account) return;
    const nextProfile = { ...profile, verificationStatus: "Pending" as const };
    const nextAccount = { ...account, profile: nextProfile };
    const accounts = readAccounts().map((item) => item.email === account.email ? nextAccount : item);
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      setAccount(nextAccount);
      setProfile(nextProfile);
      setMessage("Demo status set to Pending. No real verification request was sent.");
      setError("");
    } catch {
      setError("Could not update verification status in browser storage.");
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    onSessionChange?.(null);
    setAccount(null);
    setProfile(emptyProfile);
    setMode("login");
    setPassword("");
    setConfirmPassword("");
    setMessage("You have logged out.");
    setError("");
  }

  async function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the business logo.");
      return;
    }
    if (file.size > 500 * 1024) {
      setError("Choose a logo smaller than 500 KB for this browser-storage demo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateProfile("logo", String(reader.result || ""));
    reader.onerror = () => setError("Could not read this image. Try another file.");
    reader.readAsDataURL(file);
  }

  const field = (label: string, name: keyof BusinessProfile, options: { required?: boolean; type?: string; placeholder?: string; full?: boolean } = {}) => (
    <label className={`business-field ${options.full ? "business-field-full" : ""}`} key={name}>
      <span>{label}{options.required ? " *" : ""}</span>
      <input
        type={options.type || "text"}
        value={String(profile[name] ?? "")}
        onChange={(event) => updateProfile(name, event.target.value)}
        placeholder={options.placeholder || label}
        required={options.required}
        maxLength={name === "description" ? 1000 : 180}
      />
    </label>
  );

  if (account) {
    return (
      <div className="business-portal">
        <div className="business-page-heading">
          <div><p className="business-eyebrow">BUSINESS WORKSPACE</p><h1>Business profile</h1><p>Manage your company details, contact information, billing, and verification.</p></div>
          <button className="business-outline-button" type="button" onClick={logout}><LogOut size={16} /> Log out</button>
        </div>
        {message && <div className="business-alert business-alert-success"><CheckCircle2 size={17} /><span>{message}</span></div>}
        {error && <div className="business-alert business-alert-error">{error}</div>}
        <div className="business-profile-summary">
          <div className="business-logo-preview">{profile.logo ? <img src={profile.logo} alt="Business logo" /> : <Building2 size={28} />}</div>
          <div className="business-summary-copy"><h2>{profile.businessName || "Your business name"}</h2><p>{profile.industry || profile.category} · {profile.city || profile.location || profile.country}</p><span className={`business-status business-status-${profile.verificationStatus.toLowerCase().replace(/ /g, "")}`}>{profile.verificationStatus}</span></div>
          <div className="business-profile-email"><Mail size={15} /> {account.email}</div>
        </div>

        <form className="business-form business-profile-form" onSubmit={saveProfile}>
          <section className="business-form-section">
            <div className="business-section-heading"><Building2 size={19} /><div><h2>Business details</h2><p>Public information about your company.</p></div></div>
            <label className="business-logo-upload"><span className="business-upload-icon"><Upload size={18} /></span><span><strong>Upload business logo</strong><small>Image file, maximum 500 KB for this demo.</small></span><input type="file" accept="image/*" onChange={handleLogo} /></label>
            <div className="business-form-grid">
              {field("Business name", "businessName", { required: true })}
              {field("Website", "website", { type: "url", placeholder: "https://example.com" })}
              {field("Industry", "industry", { required: true })}
              {field("Business category", "category", { required: true })}
              {field("Business description", "description", { full: true, placeholder: "Describe your business and services" })}
            </div>
          </section>
          <section className="business-form-section">
            <div className="business-section-heading"><MapPin size={19} /><div><h2>Location</h2><p>Where your business operates.</p></div></div>
            <div className="business-form-grid">
              {field("Country", "country", { required: true })}
              {field("State / Province", "state", { required: true })}
              {field("City", "city", { required: true })}
              {field("Full location / address", "location", { full: true, required: true })}
            </div>
          </section>
          <section className="business-form-section">
            <div className="business-section-heading"><Phone size={19} /><div><h2>Contact information</h2><p>Who should we contact about this business?</p></div></div>
            <div className="business-form-grid">
              {field("Contact name", "contactName", { required: true })}
              {field("Contact email", "contactEmail", { type: "email", required: true })}
              {field("Contact phone", "contactPhone", { type: "tel", required: true })}
            </div>
          </section>
          <section className="business-form-section">
            <div className="business-section-heading"><Mail size={19} /><div><h2>Billing information</h2><p>Billing details for future invoices. Payments are not connected in demo mode.</p></div></div>
            <div className="business-form-grid">
              {field("Billing contact / legal name", "billingName")}
              {field("Billing email", "billingEmail", { type: "email" })}
              {field("Billing address", "billingAddress", { full: true })}
              {field("Tax ID / GSTIN (optional)", "billingTaxId")}
            </div>
          </section>
          <section className="business-form-section">
            <div className="business-section-heading"><ShieldCheck size={19} /><div><h2>Verification</h2><p>Submitting changes the local demo status only; no documents are checked.</p></div></div>
            <div className="business-verification-row"><div><strong>Current status: {profile.verificationStatus}</strong><p>Real verification must be handled by your backend or authorized review team.</p></div><button type="button" className="business-outline-button" onClick={submitForVerification} disabled={profile.verificationStatus === "Pending" || profile.verificationStatus === "Verified"}>Submit for review</button></div>
          </section>
          <div className="business-form-actions"><button className="business-primary-button" type="submit"><Save size={17} /> Save business profile</button></div>
        </form>
      </div>
    );
  }

  return (
    <div className="business-portal business-auth-layout">
      <div className="business-auth-intro"><div className="business-auth-mark"><Building2 size={28} /></div><p className="business-eyebrow">SHELVI BUSINESS</p><h1>Grow your business with the right audience.</h1><p>Create a business workspace to manage your profile and prepare campaigns in one place.</p><div className="business-auth-benefit"><CheckCircle2 size={17} /> Manage company information</div><div className="business-auth-benefit"><CheckCircle2 size={17} /> Prepare campaign details</div><div className="business-auth-benefit"><CheckCircle2 size={17} /> Track profile verification status</div></div>
      <div className="business-auth-card">
        <div className="business-auth-tabs"><button type="button" className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setError(""); }}>Register</button><button type="button" className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setError(""); }}>Log in</button></div>
        <div className="business-auth-heading"><h2>{mode === "register" ? "Create your business account" : "Welcome back"}</h2><p>{mode === "register" ? "Enter your contact and business details to get started." : "Log in with the email and password you registered with."}</p></div>
        {message && <div className="business-alert business-alert-success"><CheckCircle2 size={17} /><span>{message}</span></div>}
        {error && <div className="business-alert business-alert-error">{error}</div>}
        <form className="business-form" onSubmit={mode === "register" ? handleRegister : handleLogin}>
          {mode === "register" && <>
            <div className="business-form-grid">
              <label className="business-field"><span>Full name *</span><input value={profile.fullName} onChange={(event) => updateProfile("fullName", event.target.value)} required autoComplete="name" placeholder="Your full name" /></label>
              <label className="business-field"><span>Phone *</span><input type="tel" value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} required autoComplete="tel" placeholder="Phone number" /></label>
            </div>
          </>}
          <label className="business-field"><span>Email *</span><input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} required autoComplete="email" placeholder="you@company.com" /></label>
          <label className="business-field"><span>Password *</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder="At least 8 characters" /></label>
          {mode === "register" && <label className="business-field"><span>Confirm password *</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Enter password again" /></label>}
          {mode === "register" && <>
            <div className="business-form-grid">
              <label className="business-field"><span>Country *</span><input value={profile.country} onChange={(event) => updateProfile("country", event.target.value)} required placeholder="Country" /></label>
              <label className="business-field"><span>Business category *</span><select value={profile.category} onChange={(event) => updateProfile("category", event.target.value)} required><option>Agency</option><option>Retail</option><option>E-commerce</option><option>Technology</option><option>Education</option><option>Healthcare</option><option>Finance</option><option>Food & Beverage</option><option>Other</option></select></label>
            </div>
            <label className="business-field"><span>Business name *</span><input value={profile.businessName} onChange={(event) => updateProfile("businessName", event.target.value)} required placeholder="Registered or trading name" /></label>
            <label className="business-field"><span>Business location *</span><input value={profile.location} onChange={(event) => updateProfile("location", event.target.value)} required placeholder="City, state or address" /></label>
          </>}
          <button className="business-primary-button business-auth-submit" type="submit" disabled={saving}>{mode === "register" ? <><UserRound size={17} /> {saving ? "Creating account…" : "Create business account"}</> : <><LogIn size={17} /> {saving ? "Logging in…" : "Log in"}</>}</button>
        </form>
        <p className="business-demo-disclaimer"><LockKeyhole size={14} /> Demo only: account data stays in this browser. This is not production authentication.</p>
      </div>
    </div>
  );
}
