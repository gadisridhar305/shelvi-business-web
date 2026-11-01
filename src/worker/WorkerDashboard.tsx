import { useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Compass,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import TaskMarketplace from "../TaskMarketplace";
import "./WorkerDashboard.css";

export type WorkerUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  language?: string;
  device?: string;
  role: "worker";
  verificationStatus?: string;
};

type WorkerDashboardProps = {
  worker: WorkerUser;
  onLogout: () => void;
};

type Section =
  | "Overview"
  | "Find tasks"
  | "My tasks"
  | "Earnings"
  | "My profile";

export default function WorkerDashboard({
  worker,
  onLogout,
}: WorkerDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const firstName = worker.fullName?.trim().split(/\s+/)[0] || "Worker";
  const verification = worker.verificationStatus || "Pending";

  const navigation: {
    label: Section;
    icon: typeof LayoutDashboard;
  }[] = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Find tasks", icon: Compass },
    { label: "My tasks", icon: BriefcaseBusiness },
    { label: "Earnings", icon: Wallet },
    { label: "My profile", icon: CircleUserRound },
  ];

  const chooseSection = (section: Section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="worker-app">
      <aside className={`worker-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="worker-brand">
          <div className="worker-brand-mark">S</div>
          <div>
            <strong>SHELVI</strong>
            <span>WORKER PORTAL</span>
          </div>
          <button
            className="worker-icon-button worker-close-menu"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="worker-account">
          <div className="worker-avatar">{firstName.charAt(0).toUpperCase()}</div>
          <div className="worker-account-text">
            <strong>{worker.fullName}</strong>
            <span>Worker account</span>
          </div>
        </div>

        <nav className="worker-nav" aria-label="Worker navigation">
          <span className="worker-nav-heading">MY WORKSPACE</span>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`worker-nav-link ${
                activeSection === label ? "active" : ""
              }`}
              onClick={() => chooseSection(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="worker-sidebar-bottom">
          <button
            className="worker-nav-link"
            onClick={() => chooseSection("My profile")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="worker-logout" onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
          <div className="worker-sidebar-user">
            <div className="worker-avatar small">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{worker.fullName}</strong>
              <span>{worker.email}</span>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="worker-scrim"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="worker-main">
        <header className="worker-topbar">
          <button
            className="worker-icon-button worker-open-menu"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="worker-breadcrumb">
            Worker portal <span>/</span> <strong>{activeSection}</strong>
          </div>
          <div className="worker-topbar-right">
            <span className="worker-status">
              <i /> Demo account
            </span>
            <div className="worker-avatar small">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="worker-content">
          {activeSection === "Find tasks" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">TASK MARKETPLACE</span>
                  <h1>Find available tasks</h1>
                  <p>Explore campaigns and choose tasks that suit you.</p>
                </div>
              </div>
              <div className="worker-marketplace">
                <TaskMarketplace />
              </div>
            </section>
          ) : activeSection === "My tasks" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">YOUR ACTIVITY</span>
                  <h1>My tasks</h1>
                  <p>Your accepted and completed tasks will appear here.</p>
                </div>
              </div>
              <div className="worker-empty-state">
                <BriefcaseBusiness size={30} />
                <h2>No tasks accepted yet</h2>
                <p>Visit the task marketplace to find your first task.</p>
                <button
                  className="worker-primary-button"
                  onClick={() => chooseSection("Find tasks")}
                >
                  <Compass size={16} /> Browse tasks
                </button>
              </div>
            </section>
          ) : activeSection === "Earnings" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">PAYMENTS</span>
                  <h1>My earnings</h1>
                  <p>Track your task rewards and payment history.</p>
                </div>
              </div>
              <div className="worker-stat-grid two">
                <StatCard
                  label="Available balance"
                  value="₹0"
                  icon={<Wallet size={19} />}
                />
                <StatCard
                  label="Total earned"
                  value="₹0"
                  icon={<IndianRupee size={19} />}
                />
              </div>
              <div className="worker-empty-state compact">
                <ArrowDownToLine size={26} />
                <h2>No payment history</h2>
                <p>Your earnings will be listed here after task completion.</p>
              </div>
            </section>
          ) : activeSection === "My profile" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">ACCOUNT DETAILS</span>
                  <h1>My profile</h1>
                  <p>Review the information saved in your worker account.</p>
                </div>
              </div>
              <div className="worker-profile-card">
                <div className="worker-profile-heading">
                  <div className="worker-profile-avatar">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{worker.fullName}</h2>
                    <p>{worker.email}</p>
                  </div>
                  <span className="worker-verification">
                    <ShieldCheck size={15} /> {verification}
                  </span>
                </div>
                <div className="worker-profile-grid">
                  <ProfileItem label="Phone" value={worker.phone} />
                  <ProfileItem label="Country" value={worker.country} />
                  <ProfileItem label="State" value={worker.state} />
                  <ProfileItem label="City" value={worker.city} />
                  <ProfileItem label="Preferred language" value={worker.language} />
                  <ProfileItem label="Device" value={worker.device} />
                </div>
              </div>
            </section>
          ) : (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">WORKER DASHBOARD</span>
                  <h1>Welcome back, {firstName}!</h1>
                  <p>Find tasks, complete activities, and earn rewards with SHELVI.</p>
                </div>
                <button
                  className="worker-primary-button"
                  onClick={() => chooseSection("Find tasks")}
                >
                  <Compass size={17} /> Explore tasks
                </button>
              </div>

              <div className="worker-stat-grid">
                <StatCard
                  label="Available tasks"
                  value="Explore"
                  icon={<Compass size={19} />}
                  note="Browse the marketplace"
                />
                <StatCard
                  label="Active tasks"
                  value="0"
                  icon={<Activity size={19} />}
                  note="Tasks in progress"
                />
                <StatCard
                  label="Completed tasks"
                  value="0"
                  icon={<CheckCircle2 size={19} />}
                  note="Successfully submitted"
                />
                <StatCard
                  label="Total earnings"
                  value="₹0"
                  icon={<IndianRupee size={19} />}
                  note="Demo account balance"
                />
              </div>

              <div className="worker-dashboard-grid">
                <div className="worker-panel worker-welcome-panel">
                  <div className="worker-panel-title">
                    <div>
                      <h2>Start earning with SHELVI</h2>
                      <p>Choose a task, follow its instructions, and submit your work.</p>
                    </div>
                    <div className="worker-panel-icon">
                      <BadgeCheck size={22} />
                    </div>
                  </div>
                  <div className="worker-steps">
                    <div><span>1</span><p><strong>Find a task</strong>Browse available campaigns.</p></div>
                    <div><span>2</span><p><strong>Complete the task</strong>Follow the campaign instructions.</p></div>
                    <div><span>3</span><p><strong>Submit for review</strong>Wait for business verification.</p></div>
                  </div>
                  <button
                    className="worker-secondary-button"
                    onClick={() => chooseSection("Find tasks")}
                  >
                    Browse marketplace <ArrowUpRight size={16} />
                  </button>
                </div>

                <div className="worker-panel worker-account-panel">
                  <div className="worker-panel-title">
                    <div>
                      <h2>Account verification</h2>
                      <p>Your current account status</p>
                    </div>
                    <ShieldCheck size={21} />
                  </div>
                  <div className="worker-verification-row">
                    <span className="worker-verification-icon"><ShieldCheck size={18} /></span>
                    <div>
                      <strong>{verification}</strong>
                      <span>Worker profile verification</span>
                    </div>
                  </div>
                  <p className="worker-demo-note">
                    This is a demo dashboard. Task counts and earnings will update
                    when task assignment and payment services are connected.
                  </p>
                  <button
                    className="worker-text-button"
                    onClick={() => chooseSection("My profile")}
                  >
                    View profile <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>

              <div className="worker-panel worker-recent-panel">
                <div className="worker-panel-title">
                  <div>
                    <h2>Recent activity</h2>
                    <p>Your latest task activity will appear here.</p>
                  </div>
                  <Clock3 size={20} />
                </div>
                <div className="worker-empty-inline">
                  <CheckCircle2 size={20} />
                  <span>No recent activity yet. Browse the marketplace to get started.</span>
                </div>
              </div>
            </section>
          )}
          <footer className="worker-footer">
            © 2026 SHELVI Marketplace <span>Worker portal · Demo mode</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  note?: string;
}) {
  return (
    <article className="worker-stat-card">
      <div className="worker-stat-top">
        <span>{label}</span>
        <span className="worker-stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}

function ProfileItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="worker-profile-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}
