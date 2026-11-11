import { ArrowRight, BriefcaseBusiness, UsersRound } from "lucide-react";
import "./LandingPage.css";

type LandingPageProps = {
  onOpenUser: () => void;
  onOpenBusiness: () => void;
};

export default function LandingPage({
  onOpenUser,
  onOpenBusiness,
}: LandingPageProps) {
  return (
    <main className="shelvi-home">
      <header className="shelvi-home-header">
        <a className="shelvi-home-brand" href="/" aria-label="SHELVI home">
          <span className="shelvi-home-logo">S</span>
          <span>
            <strong>SHELVI</strong>
            <small>CAMPAIGN PLATFORM</small>
          </span>
        </a>
        <span className="shelvi-home-tag">Welcome to SHELVI</span>
      </header>

      <section className="shelvi-home-hero">
        <div className="shelvi-home-copy">
          <span className="shelvi-home-eyebrow">ONE PLATFORM · TWO EXPERIENCES</span>
          <h1>Welcome to <em>SHELVI!</em></h1>
          <span className="shelvi-home-rule" />
          <p>
            Connect with opportunities, discover campaigns, and grow your
            business. Choose how you want to continue.
          </p>
          <div className="shelvi-home-points">
            <span><i /> Simple access</span>
            <span><i /> Dedicated dashboards</span>
            <span><i /> One connected platform</span>
          </div>
        </div>

        <div className="shelvi-home-options">
          
          <article className="shelvi-choice-card business-choice">
            <div className="shelvi-choice-icon"><BriefcaseBusiness size={25} /></div>
            <span className="shelvi-choice-kicker">FOR BUSINESSES</span>
            <h2>Business Dashboard</h2>
            <p>Access your business workspace to manage campaigns, tasks, and your profile.</p>
            <button type="button" onClick={onOpenBusiness}>
              Continue as Business <ArrowRight size={17} />
            </button>
            <small>Business login · Registration · Dashboard</small>
          </article>
          
          <article className="shelvi-choice-card user-choice">
            <div className="shelvi-choice-icon"><UsersRound size={25} /></div>
            <span className="shelvi-choice-kicker">FOR WORKERS & USERS</span>
            <h2>User Portal</h2>
            <p>Sign in or create a user account to explore tasks and manage your activity.</p>
            <button type="button" onClick={onOpenUser}>
              Continue as User <ArrowRight size={17} />
            </button>
            <small>Login · Registration · User dashboard</small>
          </article>

        </div>
      </section>

      <footer className="shelvi-home-footer">
        <span>© {new Date().getFullYear()} SHELVI Campaign Platform</span>
        <span>Choose a portal to get started</span>
      </footer>
    </main>
  );
}
