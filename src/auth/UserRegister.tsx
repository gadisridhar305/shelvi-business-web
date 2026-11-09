import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import type { WorkerUser } from "../worker/WorkerDashboard";
import "./UserAuth.css";

type Props = { onBack: () => void; onGoToLogin: () => void };
type Account = WorkerUser & { passwordHash: string };
const KEY = "shelvi_demo_workers";

function readAccounts(): Account[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value as Account[] : [];
  } catch { return []; }
}
async function hashPassword(password: string): Promise<string> {
  if (!crypto.subtle) throw new Error("Secure hashing is unavailable. Use localhost or HTTPS.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, "0")).join("");
}

export default function UserRegister({ onBack, onGoToLogin }: Props) {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", country: "India", state: "",
    city: "", language: "Telugu", device: "Android", password: "", confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm(old => ({ ...old, [field]: value }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const email = form.email.trim().toLowerCase();
    if (!form.fullName.trim() || !email || !form.phone.trim() ||
        !form.state.trim() || !form.city.trim()) {
      setError("Please complete all required fields."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address."); return;
    }
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }

    setSaving(true);
    try {
      const accounts = readAccounts();
      if (accounts.some(a => a.email.toLowerCase() === email)) {
        setError("This email is already registered. Please log in."); return;
      }
      const account: Account = {
        id: `worker-${Date.now()}`,
        fullName: form.fullName.trim(),
        email,
        phone: form.phone.trim(),
        country: form.country.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        language: form.language,
        device: form.device,
        role: "worker",
        verificationStatus: "Pending",
        passwordHash: await hashPassword(form.password)
      };
      localStorage.setItem(KEY, JSON.stringify([...accounts, account]));
      window.alert("User account created successfully. Please log in.");
      onGoToLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account.");
    } finally { setSaving(false); }
  }

  const field = (label: string, key: keyof typeof form, placeholder = "", type = "text") => (
    <label className="shelvi-field">
      {label}
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e => update(key, e.target.value)} required />
    </label>
  );

  return (
    <main className="shelvi-auth-page">
      <section className="shelvi-auth-card">
        <button type="button" className="shelvi-back-button" onClick={onBack}><ArrowLeft size={17}/> Back</button>
        <div className="shelvi-auth-brand"><span className="shelvi-auth-logo">S</span><div><strong>SHELVI</strong><small>WORKER REGISTRATION</small></div></div>
        <div className="shelvi-auth-heading"><span className="shelvi-auth-icon"><UserPlus size={22}/></span><h1>Create your worker account</h1><p>Register to discover tasks and earn rewards.</p></div>
        <form onSubmit={submit}>
          <div className="shelvi-form-grid">
            {field("Full name *", "fullName", "Your full name")}
            {field("Email address *", "email", "you@example.com", "email")}
            {field("Phone number *", "phone", "+91 98765 43210", "tel")}
            {field("Country *", "country", "India")}
            {field("State *", "state", "Andhra Pradesh")}
            {field("City *", "city", "Your city")}
            <label className="shelvi-field">Preferred language
              <select value={form.language} onChange={e => update("language", e.target.value)}>
                {["Telugu","English","Hindi","Tamil","Kannada","Malayalam","Other"].map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="shelvi-field">Primary device
              <select value={form.device} onChange={e => update("device", e.target.value)}>
                {["Android","iOS","Desktop","Tablet"].map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="shelvi-field">Password *
              <span className="shelvi-password-wrap"><input type={showPassword ? "text" : "password"} value={form.password} minLength={8} autoComplete="new-password" onChange={e => update("password", e.target.value)} required placeholder="At least 8 characters"/><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span>
            </label>
            <label className="shelvi-field">Confirm password *
              <span className="shelvi-password-wrap"><input type={showConfirm ? "text" : "password"} value={form.confirmPassword} autoComplete="new-password" onChange={e => update("confirmPassword", e.target.value)} required placeholder="Re-enter password"/><button type="button" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span>
            </label>
          </div>
          {error && <p className="shelvi-auth-error" role="alert">{error}</p>}
          <button className="shelvi-auth-submit" type="submit" disabled={saving}>{saving ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="shelvi-auth-switch">Already registered? <button type="button" onClick={onGoToLogin}>Login</button></p>
        <p className="shelvi-auth-disclaimer">Demo accounts are stored in this browser only.</p>
      </section>
    </main>
  );
}
