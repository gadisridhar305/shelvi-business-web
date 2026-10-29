import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BriefcaseBusiness, CheckCircle2,
  ChevronDown, CircleHelp, Compass, CreditCard, Filter, LayoutDashboard, Menu,
  Plus, Search, Settings, ShieldCheck, Sparkles, Target, Users, Wallet, X,
  Youtube, Instagram, Smartphone, Clock3, MoreHorizontal, Pencil, Trash2, Building2
} from "lucide-react";
import TaskMarketplace from "./TaskMarketplace";
import BusinessPortal from "./BusinessPortal";

type Campaign = {
  id: number;
  name: string;
  type: string;
  status: "Active" | "Pending" | "Paused";
  completed: number;
  target: number;
  budget: number;
  reward: number;
  region: string;
  icon: "phone" | "youtube" | "instagram";
  ownerEmail?: string;
};


const initialCampaigns: Campaign[] = [
  { id: 1, name: "App install & onboarding", type: "App task", status: "Active", completed: 684, target: 1000, budget: 20000, reward: 12, region: "India · Android", icon: "phone" },
  { id: 2, name: "YouTube product awareness", type: "Social task", status: "Active", completed: 1250, target: 2000, budget: 12000, reward: 4, region: "India · All devices", icon: "youtube" },
  { id: 3, name: "Instagram creator launch", type: "Influencer", status: "Pending", completed: 0, target: 25, budget: 45000, reward: 1800, region: "Andhra Pradesh · Telugu", icon: "instagram" },
  { id: 4, name: "Website usability feedback", type: "Research", status: "Paused", completed: 92, target: 250, budget: 15000, reward: 60, region: "India · Desktop", icon: "phone" },
];

const navGroups = [
  { label: "WORKSPACE", items: [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Campaigns", icon: Target },
    { label: "Task marketplace", icon: Compass },
    { label: "Influencers", icon: Users },
  ]},
  { label: "MANAGEMENT", items: [
    { label: "Wallet & payments", icon: Wallet },
    { label: "Analytics", icon: Activity },
    { label: "Verification", icon: ShieldCheck },
    { label: "Business profile", icon: Building2 },
  ]},
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [businessEmail, setBusinessEmail] = useState<string | null>(() => localStorage.getItem("shelvi_demo_business_session"));
  const [campaignsOwner, setCampaignsOwner] = useState<string | null>(() => localStorage.getItem("shelvi_demo_business_session"));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const email = localStorage.getItem("shelvi_demo_business_session");
      const key = email ? `shelvi_campaigns_${encodeURIComponent(email)}` : "shelvi_campaigns";
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as Campaign[]) : (email ? [] : initialCampaigns);
    } catch {
      return localStorage.getItem("shelvi_demo_business_session") ? [] : initialCampaigns;
    }
  });

  // Load a separate campaign collection whenever the signed-in business changes.
  useEffect(() => {
    try {
      const key = businessEmail
        ? `shelvi_campaigns_${encodeURIComponent(businessEmail)}`
        : "shelvi_campaigns";
      const saved = localStorage.getItem(key);
      setCampaigns(saved ? (JSON.parse(saved) as Campaign[]) : (businessEmail ? [] : initialCampaigns));
      setCampaignsOwner(businessEmail);
    } catch {
      setCampaigns(businessEmail ? [] : initialCampaigns);
      setCampaignsOwner(businessEmail);
    }
  }, [businessEmail]);

  // Avoid saving the previous business's campaigns during a business switch.
  useEffect(() => {
    if (campaignsOwner !== businessEmail) return;
    try {
      const key = businessEmail
        ? `shelvi_campaigns_${encodeURIComponent(businessEmail)}`
        : "shelvi_campaigns";
      localStorage.setItem(key, JSON.stringify(campaigns));
    } catch {
      setNotice("Could not save campaigns in browser storage.");
    }
  }, [campaigns, businessEmail, campaignsOwner]);

  const visibleCampaigns = useMemo(
    () => campaigns.filter((campaign) => businessEmail
      ? campaign.ownerEmail === businessEmail
      : !campaign.ownerEmail),
    [campaigns, businessEmail]
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [openCampaignMenu, setOpenCampaignMenu] = useState<number | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => visibleCampaigns.filter((c) =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "All status" || c.status === statusFilter)
  ), [visibleCampaigns, search, statusFilter]);

  const totalBudget = visibleCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalCompleted = visibleCampaigns.reduce((sum, c) => sum + c.completed, 0);
  const activeCount = visibleCampaigns.filter((c) => c.status === "Active").length;

  function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const budget = Number(form.get("budget") || 0);
    const reward = Number(form.get("reward") || 0);
    if (!name || budget <= 0 || reward <= 0) return;
    const campaign: Campaign = {
      id: Date.now(),
      name,
      type: String(form.get("type") || "App task"),
      status: "Pending",
      completed: 0,
      target: Number(form.get("target") || 100),
      budget,
      reward,
      region: String(form.get("region") || "India · All devices"),
      icon: "phone",
      ...(businessEmail ? { ownerEmail: businessEmail } : {}),
    };
    setCampaigns((current) => [campaign, ...current]);
    setShowCreate(false);
    setActiveNav("Campaigns");
    setNotice("Campaign saved as Pending. Connect the backend to enable real approval and funding.");
    window.setTimeout(() => setNotice(""), 5000);
  }

  function toggleCampaignStatus(id: number): void {
    setCampaigns((current) =>
      current.map((campaign) => {
        if (campaign.id !== id) {
          return campaign;
        }

        if (campaign.status === "Active") {
          return { ...campaign, status: "Paused" };
        }

        if (campaign.status === "Paused") {
          return { ...campaign, status: "Active" };
        }

        return campaign;
      })
    );
  }

  function saveCampaignEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCampaign) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const budget = Number(form.get("budget") || 0);
    const reward = Number(form.get("reward") || 0);
    const target = Number(form.get("target") || 0);

    if (!name || budget <= 0 || reward <= 0 || target <= 0) {
      setNotice("Enter a campaign name and valid positive numbers for budget, reward, and target.");
      return;
    }

    setCampaigns((current) => current.map((campaign) =>
      campaign.id === editingCampaign.id
        ? {
            ...campaign,
            name,
            type: String(form.get("type") || campaign.type),
            budget,
            reward,
            target,
            region: String(form.get("region") || "India · All devices").trim(),
          }
        : campaign
    ));
    setEditingCampaign(null);
    setOpenCampaignMenu(null);
    setNotice("Campaign updated successfully.");
    window.setTimeout(() => setNotice(""), 5000);
  }

  function deleteCampaign(campaign: Campaign) {
    const confirmed = window.confirm(`Delete the campaign "${campaign.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
    setOpenCampaignMenu(null);
    setNotice(`Campaign "${campaign.name}" was deleted.`);
    window.setTimeout(() => setNotice(""), 5000);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">S</div>
          <div><div className="brand-name">SHELVI</div><div className="brand-caption">CAMPAIGN PLATFORM</div></div>
          <button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">AC</div>
          <div className="workspace-text"><strong>{businessEmail || "Demo workspace"}</strong><span>{businessEmail ? "Business workspace" : "Demo workspace"}</span></div>
          <ChevronDown size={16} className="muted"/>
        </div>
        <nav className="side-nav">
          {navGroups.map((group) => <div className="nav-group" key={group.label}>
            <div className="nav-heading">{group.label}</div>
            {group.items.map(({ label, icon: Icon }) => <button key={label} className={`nav-link ${activeNav === label ? "selected" : ""}`} onClick={() => { setActiveNav(label); setMobileNav(false); }}>
              <Icon size={18}/><span>{label}</span>{label === "Verification" && <span className="nav-count">4</span>}
            </button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Explore the SHELVI guide and best practices.</p><button onClick={() => setNotice("Help center is a placeholder in this starter. Add your support module next.")}>Visit help center <ArrowUpRight size={14}/></button></div>
          <button className="nav-link" onClick={() => setNotice("Settings page will be added in a later phase.")}><Settings size={18}/><span>Settings</span></button>
          <div className="profile-row"><div className="profile-avatar">GA</div><div className="profile-text"><strong>User</strong><span>Workspace admin</span></div><MoreHorizontal size={18} className="muted"/></div>
        </div>
      </aside>

      {mobileNav && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <div className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns..." aria-label="Search campaigns"/></div>
            <button className="icon-button notification-button" onClick={() => setNotice("You’re all caught up. Notifications will appear here.")} aria-label="Notifications"><Bell size={18}/><i/></button>
            <div className="top-avatar">GA</div>
          </div>
        </header>

        <div className="page-content">
          {activeNav === "Task marketplace" ? (
            <TaskMarketplace />
          ) : activeNav === "Business profile" ? (
            <BusinessPortal onSessionChange={(email) => { setBusinessEmail(email); setActiveNav(email ? "Campaigns" : "Business profile"); }} />
          ) : (
            <>


          {notice && <div className="notice"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
          <section className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={14}/> YOUR CAMPAIGN COMMAND CENTER</div><h1>{activeNav === "Overview" ? "Good afternoon, " : activeNav}</h1><p className="page-subtitle">{activeNav === "Overview" ? "Here’s what’s happening across your SHELVI workspace today." : `Manage and monitor your ${activeNav.toLowerCase()} in one place.`}</p></div>
            <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={18}/> Create campaign</button>
          </section>

          <section className="stat-grid">
            <StatCard title="Total campaign budget" value={money(totalBudget)} change="+12.8%" note="vs. previous month" icon={<Wallet size={19}/>} tone="purple" trend="up"/>
            <StatCard title="Tasks completed" value={totalCompleted.toLocaleString("en-IN")} change="+8.2%" note="vs. previous month" icon={<CheckCircle2 size={19}/>} tone="green" trend="up"/>
            <StatCard title="Active campaigns" value={String(activeCount).padStart(2, "0")} change={`${visibleCampaigns.length} total`} note="across all task types" icon={<Target size={19}/>} tone="blue" trend="none"/>
            <StatCard title="Pending verification" value="24" change="Needs review" note="sample dashboard data" icon={<ShieldCheck size={19}/>} tone="orange" trend="down"/>
          </section>

          <section className="content-grid">
            <div className="panel campaign-panel">
              <div className="panel-header"><div><h2>Campaign performance</h2><p>Track delivery and budget across your campaigns.</p></div><button className="text-button" onClick={() => setActiveNav("Campaigns")}>View all <ArrowUpRight size={15}/></button></div>
              <div className="chart-summary"><div><span className="summary-label">Total completions</span><div className="summary-number">{totalCompleted.toLocaleString("en-IN")} <span className="positive"><ArrowUpRight size={14}/> 8.2%</span></div></div><div className="chart-legend"><span><i className="legend-dot violet"/> Completed</span><span><i className="legend-dot pale"/> Target</span></div></div>
              <div className="chart" role="img" aria-label="Illustrative weekly campaign completion chart">
                <div className="chart-y-labels"><span>2k</span><span>1.5k</span><span>1k</span><span>500</span><span>0</span></div>
                <div className="chart-plot"><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="gridline g4"/><div className="gridline g5"/>
                  <svg viewBox="0 0 640 190" preserveAspectRatio="none" className="chart-svg" aria-hidden="true"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7868e8" stopOpacity=".2"/><stop offset="100%" stopColor="#7868e8" stopOpacity="0"/></linearGradient></defs><path d="M0,150 C38,143 45,125 90,130 S155,95 190,112 S255,70 290,88 S350,60 390,73 S455,35 490,56 S555,25 590,39 S620,24 640,18 L640,190 L0,190 Z" fill="url(#areaFill)"/><path d="M0,150 C38,143 45,125 90,130 S155,95 190,112 S255,70 290,88 S350,60 390,73 S455,35 490,56 S555,25 590,39 S620,24 640,18" fill="none" stroke="#7868e8" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/></svg>
                  <div className="chart-x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                </div>
              </div>
              <div className="chart-footnote"><span className="status-dot"/> Illustrative weekly trend <span className="footnote-right">Demo data · Not live analytics</span></div>
            </div>
            <div className="panel wallet-panel">
              <div className="panel-header"><div><h2>Wallet overview</h2><p>Campaign funds at a glance</p></div><button className="more-button" onClick={() => setActiveNav("Wallet & payments")} aria-label="Open wallet"><MoreHorizontal size={20}/></button></div>
              <div className="wallet-card"><div className="wallet-card-top"><span>AVAILABLE BALANCE</span><CreditCard size={20}/></div><div className="wallet-balance">{money(84500)}</div><div className="wallet-card-bottom"><span><span className="wallet-live-dot"/> Demo wallet</span><span>INR ₹</span></div></div>
              <div className="wallet-line"><div className="wallet-line-icon committed"><BriefcaseBusiness size={17}/></div><div className="wallet-line-label"><strong>Committed funds</strong><span>Allocated to campaigns</span></div><strong>{money(32000)}</strong></div>
              <div className="wallet-line"><div className="wallet-line-icon spent"><ArrowDownRight size={17}/></div><div className="wallet-line-label"><strong>Total spent</strong><span>Campaign spend to date</span></div><strong>{money(18750)}</strong></div>
              <button className="secondary-button" onClick={() => setActiveNav("Wallet & payments")}>View transactions <ArrowUpRight size={15}/></button>
            </div>
          </section>

          <section className="panel table-panel">
            <div className="panel-header campaign-table-heading"><div><h2>Recent campaigns</h2><p>Review the status and progress of your campaigns.</p></div><div className="table-actions"><label className="filter-select"><Filter size={15}/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter campaign status"><option>All status</option><option>Active</option><option>Pending</option><option>Paused</option></select><ChevronDown size={14}/></label><button className="secondary-button compact" onClick={() => setActiveNav("Campaigns")}>View campaigns</button></div></div>
            <div className="table-wrap"><table><thead><tr><th>CAMPAIGN</th><th>STATUS</th><th>COMPLETION</th><th>BUDGET</th><th>WORKER REWARD</th><th/></tr></thead><tbody>
              {filtered.map((campaign) => <tr key={campaign.id}><td><div className="campaign-cell"><div className={`campaign-icon ${campaign.icon}`}>{campaign.icon === "youtube" ? <Youtube size={18}/> : campaign.icon === "instagram" ? <Instagram size={18}/> : <Smartphone size={18}/>}</div><div><strong>{campaign.name}</strong><span>{campaign.type} · {campaign.region}</span></div></div></td><td><StatusPill status={campaign.status}/></td><td><div className="completion-cell"><div className="completion-label"><strong>{campaign.completed.toLocaleString("en-IN")}</strong><span>{campaign.target.toLocaleString("en-IN")}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, campaign.target ? campaign.completed / campaign.target * 100 : 0)}%` }}/></div></div></td><td className="money-cell">{money(campaign.budget)}</td><td className="money-cell">{money(campaign.reward)}</td><td>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, position: "relative" }}>
                  {campaign.status !== "Pending" && (
                    <button className="secondary-button compact" onClick={() => toggleCampaignStatus(campaign.id)}>
                      {campaign.status === "Active" ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button
                    className="row-more"
                    onClick={() => setOpenCampaignMenu((current) => current === campaign.id ? null : campaign.id)}
                    aria-label={`Campaign actions for ${campaign.name}`}
                    aria-expanded={openCampaignMenu === campaign.id}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {openCampaignMenu === campaign.id && (
                    <div role="menu" style={{ position: "absolute", zIndex: 20, right: 0, top: "calc(100% + 6px)", minWidth: 170, padding: 6, background: "var(--panel, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
                      <button type="button" role="menuitem" onClick={() => { setEditingCampaign(campaign); setOpenCampaignMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 8px", border: 0, background: "transparent", cursor: "pointer", textAlign: "left" }}>
                        <Pencil size={15} /> Edit campaign
                      </button>
                      <button type="button" role="menuitem" onClick={() => deleteCampaign(campaign)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 8px", border: 0, background: "transparent", color: "#dc2626", cursor: "pointer", textAlign: "left" }}>
                        <Trash2 size={15} /> Delete campaign
                      </button>
                    </div>
                  )}
                </div>
                </td></tr>)}
              {filtered.length === 0 && <tr><td colSpan={6} className="empty-state">No campaigns match your search or filter.</td></tr>}
            </tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{visibleCampaigns.length}</strong> campaigns</span><span className="demo-label"><Clock3 size={13}/> Demo workspace</span></div>
          </section>
          <footer className="page-footer">
            <span>© 2026 SHELVI Marketplace</span><span><ShieldCheck size={14}/> Built for transparent campaign operations</span>
            </footer>
            </>
)}
        </div>
      </main>

      {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-header"><div><div className="eyebrow">CAMPAIGN BUILDER</div><h2 id="create-title">Create a campaign</h2><p>Enter the basics to add a draft to your workspace.</p></div><button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close"><X size={19}/></button></div><form onSubmit={createCampaign}><label>Campaign name<input name="name" placeholder="e.g. App install & onboarding" required maxLength={90}/></label><div className="form-two"><label>Task type<select name="type"><option>App task</option><option>Social task</option><option>Website testing</option><option>Research</option><option>Influencer</option></select></label><label>Target quantity<input name="target" type="number" min="1" defaultValue="100" required/></label></div><div className="form-two"><label>Campaign budget (₹)<input name="budget" type="number" min="1" placeholder="20000" required/></label><label>Worker reward (₹)<input name="reward" type="number" min="1" placeholder="12" required/></label></div><label>Target audience<input name="region" placeholder="India · Telugu · Android"/></label><div className="modal-note"><ShieldCheck size={16}/><span>This starter saves campaigns in the current browser session only. Funding and approval are not connected.</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={17}/> Save campaign</button></div></form></div></div>}
      {editingCampaign && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingCampaign(null); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title"><div className="modal-header"><div><div className="eyebrow">CAMPAIGN BUILDER</div><h2 id="edit-title">Edit campaign</h2><p>Update the details for this campaign.</p></div><button className="icon-button" onClick={() => setEditingCampaign(null)} aria-label="Close"><X size={19}/></button></div><form onSubmit={saveCampaignEdits}><label>Campaign name<input name="name" defaultValue={editingCampaign.name} required maxLength={90}/></label><div className="form-two"><label>Task type<select name="type" defaultValue={editingCampaign.type}><option>App task</option><option>Social task</option><option>Website testing</option><option>Research</option><option>Influencer</option></select></label><label>Target quantity<input name="target" type="number" min="1" defaultValue={editingCampaign.target} required/></label></div><div className="form-two"><label>Campaign budget (₹)<input name="budget" type="number" min="1" defaultValue={editingCampaign.budget} required/></label><label>Worker reward (₹)<input name="reward" type="number" min="1" defaultValue={editingCampaign.reward} required/></label></div><label>Target audience<input name="region" defaultValue={editingCampaign.region} placeholder="India · Telugu · Android"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditingCampaign(null)}>Cancel</button><button type="submit" className="primary-button"><Pencil size={17}/> Save changes</button></div></form></div></div>}
    </div>
  );
}

function StatCard({ title, value, change, note, icon, tone, trend }: { title: string; value: string; change: string; note: string; icon: React.ReactNode; tone: string; trend: "up" | "down" | "none" }) {
  return <div className="stat-card"><div className="stat-top"><span>{title}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><div className="stat-value">{value}</div><div className="stat-foot"><span className={trend === "up" ? "positive" : trend === "down" ? "attention" : "neutral-change"}>{trend === "up" ? <ArrowUpRight size={14}/> : trend === "down" ? <ArrowDownRight size={14}/> : null}{change}</span><span>{note}</span></div></div>;
}
function StatusPill({ status }: { status: Campaign["status"] }) {
  return <span className={`status-pill ${status.toLowerCase()}`}><i/>{status}</span>;
}

export default App;