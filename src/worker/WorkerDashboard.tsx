
import { useCallback, useMemo, useState } from "react";
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
import TaskMarketplace, { type WorkerTask } from "../TaskMarketplace";
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

type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  requestedAt: string;
  status: "Requested";
};

const taskStorageKey = (id: string) =>
  `shelvi_worker_tasks_${id}`;

const withdrawalStorageKey = (id: string) =>
  `shelvi_worker_withdrawals_${id}`;

const readTasks = (id: string): WorkerTask[] => {
  try {
    const value = JSON.parse(
      localStorage.getItem(taskStorageKey(id)) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const readWithdrawals = (id: string): Withdrawal[] => {
  try {
    const value = JSON.parse(
      localStorage.getItem(withdrawalStorageKey(id)) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function WorkerDashboard({
  worker,
  onLogout,
}: WorkerDashboardProps) {
  const [activeSection, setActiveSection] =
    useState<Section>("Overview");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [workerTasks, setWorkerTasks] =
    useState<WorkerTask[]>(() => readTasks(worker.id));

  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>(() => readWithdrawals(worker.id));

  const [withdrawAmount, setWithdrawAmount] =
    useState("");

  const [withdrawMethod, setWithdrawMethod] =
    useState("UPI");

  const [withdrawMessage, setWithdrawMessage] =
    useState("");

  const firstName =
    worker.fullName?.trim().split(/\s+/)[0] || "Worker";

  const verification =
    worker.verificationStatus || "Pending";

  const onTasksChange = useCallback(
    (next: WorkerTask[]) => {
      setWorkerTasks(next);
    },
    []
  );

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

  const activeCount = workerTasks.filter(
    (task) =>
      task.status === "Accepted" ||
      task.status === "Pending Verification"
  ).length;

  const completedCount = workerTasks.filter(
    (task) =>
      task.status === "Completed" ||
      task.status === "Approved"
  ).length;

  const lockedBalance = workerTasks
    .filter((task) => task.status === "Accepted")
    .reduce((sum, task) => sum + task.reward, 0);

  const pendingBalance = workerTasks
    .filter(
      (task) => task.status === "Pending Verification"
    )
    .reduce((sum, task) => sum + task.reward, 0);

  const availableBalance = workerTasks
    .filter(
      (task) =>
        task.status === "Approved" ||
        task.status === "Completed"
    )
    .reduce((sum, task) => sum + task.reward, 0);

  const lifetimeEarnings =
    availableBalance + pendingBalance;

  const recentTasks = useMemo(
    () =>
      [...workerTasks]
        .sort((a, b) =>
          (b.submittedAt || b.acceptedAt).localeCompare(
            a.submittedAt || a.acceptedAt
          )
        )
        .slice(0, 4),
    [workerTasks]
  );

  function requestWithdrawal(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawMessage(
        "Enter a valid withdrawal amount."
      );
      return;
    }

    if (amount > availableBalance) {
      setWithdrawMessage(
        `Your available balance is ${money(
          availableBalance
        )}. You cannot request more than this amount.`
      );
      return;
    }

    const request: Withdrawal = {
      id: `WD-${Date.now()}`,
      amount,
      method: withdrawMethod,
      requestedAt: new Date().toISOString(),
      status: "Requested",
    };

    const next = [request, ...withdrawals];

    setWithdrawals(next);

    localStorage.setItem(
      withdrawalStorageKey(worker.id),
      JSON.stringify(next)
    );

    setWithdrawAmount("");

    setWithdrawMessage(
      "Your demo withdrawal request has been recorded."
    );
  }

  return (
    <div className="worker-app">
      <aside
        className={`worker-sidebar ${
          mobileMenuOpen ? "is-open" : ""
        }`}
      >
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
          <div className="worker-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="worker-account-text">
            <strong>{worker.fullName}</strong>
            <span>Worker account</span>
          </div>
        </div>

        <nav
          className="worker-nav"
          aria-label="Worker navigation"
        >
          <span className="worker-nav-heading">
            MY WORKSPACE
          </span>

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

          <button
            className="worker-logout"
            onClick={onLogout}
          >
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
            Worker portal <span>/</span>{" "}
            <strong>{activeSection}</strong>
          </div>

          <div className="worker-topbar-right">
            <span className="worker-status">
              <i />
              Demo account
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
                  <span className="worker-eyebrow">
                    TASK MARKETPLACE
                  </span>

                  <h1>Find available tasks</h1>

                  <p>
                    Explore campaigns and choose tasks that
                    suit you.
                  </p>
                </div>
              </div>

              <div className="worker-marketplace">
                <TaskMarketplace
                  workerId={worker.id}
                  view="marketplace"
                  onTasksChange={onTasksChange}
                />
              </div>
            </section>
          ) : activeSection === "My tasks" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">
                    YOUR ACTIVITY
                  </span>

                  <h1>My tasks</h1>

                  <p>
                    Track accepted tasks, submit proof and
                    review your task history.
                  </p>
                </div>
              </div>

              <div className="worker-marketplace">
                <TaskMarketplace
                  workerId={worker.id}
                  view="my-tasks"
                  onTasksChange={onTasksChange}
                />
              </div>
            </section>
          ) : activeSection === "Earnings" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">
                    PAYMENTS
                  </span>

                  <h1>My earnings</h1>

                  <p>
                    Rewards are released after task
                    verification and approval.
                  </p>
                </div>
              </div>

              <div className="worker-stat-grid">
                <StatCard
                  label="Locked balance"
                  value={money(lockedBalance)}
                  icon={<Wallet size={19} />}
                  note="Accepted tasks not yet submitted"
                />

                <StatCard
                  label="Pending balance"
                  value={money(pendingBalance)}
                  icon={<Clock3 size={19} />}
                  note="Awaiting task verification"
                />

                <StatCard
                  label="Available balance"
                  value={money(availableBalance)}
                  icon={<ArrowDownToLine size={19} />}
                  note="Approved rewards"
                />

                <StatCard
                  label="Lifetime earnings"
                  value={money(lifetimeEarnings)}
                  icon={<IndianRupee size={19} />}
                  note="Approved plus pending rewards"
                />
              </div>

              <div className="worker-panel worker-earnings-panel">
                <div className="worker-panel-title">
                  <div>
                    <h2>Request a withdrawal</h2>
                    <p>
                      Only approved available balance can be
                      requested.
                    </p>
                  </div>

                  <Wallet size={21} />
                </div>

                <form
                  className="worker-withdraw-form"
                  onSubmit={requestWithdrawal}
                >
                  <label>
                    Amount (₹)

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(event) =>
                        setWithdrawAmount(event.target.value)
                      }
                      placeholder="Enter amount"
                      required
                    />
                  </label>

                  <label>
                    Payment method

                    <select
                      value={withdrawMethod}
                      onChange={(event) =>
                        setWithdrawMethod(event.target.value)
                      }
                    >
                      <option>UPI</option>
                      <option>Bank transfer</option>
                    </select>
                  </label>

                  <button
                    className="worker-primary-button"
                    type="submit"
                  >
                    Request withdrawal
                  </button>
                </form>

                {withdrawMessage && (
                  <p
                    className="worker-form-message"
                    role="status"
                  >
                    {withdrawMessage}
                  </p>
                )}
              </div>

              <div className="worker-panel worker-recent-panel">
                <div className="worker-panel-title">
                  <div>
                    <h2>Withdrawal history</h2>
                    <p>
                      Track your submitted withdrawal
                      requests.
                    </p>
                  </div>

                  <ArrowDownToLine size={20} />
                </div>

                {withdrawals.length ? (
                  <div className="worker-table-wrap">
                    <table className="worker-data-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id}>
                            <td>{withdrawal.id}</td>
                            <td>
                              {money(withdrawal.amount)}
                            </td>
                            <td>{withdrawal.method}</td>
                            <td>
                              {new Date(
                                withdrawal.requestedAt
                              ).toLocaleDateString("en-IN")}
                            </td>
                            <td>
                              <span className="worker-request-status">
                                {withdrawal.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="worker-empty-inline">
                    <ArrowDownToLine size={20} />
                    <span>
                      No withdrawal requests yet.
                    </span>
                  </div>
                )}
              </div>

              <p className="worker-demo-note">
                Demo mode: withdrawal requests are saved in
                this browser only. Payment processing,
                minimum limits and risk checks require the
                SHELVI backend.
              </p>
            </section>
          ) : activeSection === "My profile" ? (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">
                    ACCOUNT DETAILS
                  </span>

                  <h1>My profile</h1>

                  <p>
                    Review the information saved in your
                    worker account.
                  </p>
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
                    <ShieldCheck size={15} />
                    {verification}
                  </span>
                </div>

                <div className="worker-profile-grid">
                  <ProfileItem
                    label="Phone"
                    value={worker.phone}
                  />

                  <ProfileItem
                    label="Country"
                    value={worker.country}
                  />

                  <ProfileItem
                    label="State"
                    value={worker.state}
                  />

                  <ProfileItem
                    label="City"
                    value={worker.city}
                  />

                  <ProfileItem
                    label="Preferred language"
                    value={worker.language}
                  />

                  <ProfileItem
                    label="Device"
                    value={worker.device}
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="worker-section">
              <div className="worker-page-heading">
                <div>
                  <span className="worker-eyebrow">
                    WORKER DASHBOARD
                  </span>

                  <h1>Welcome back, {firstName}!</h1>

                  <p>
                    Find tasks, complete activities, and earn
                    rewards with SHELVI.
                  </p>
                </div>

                <button
                  className="worker-primary-button"
                  onClick={() =>
                    chooseSection("Find tasks")
                  }
                >
                  <Compass size={17} />
                  Explore tasks
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
                  value={String(activeCount)}
                  icon={<Activity size={19} />}
                  note="Accepted or awaiting review"
                />

                <StatCard
                  label="Completed tasks"
                  value={String(completedCount)}
                  icon={<CheckCircle2 size={19} />}
                  note="Approved tasks"
                />

                <StatCard
                  label="Total earnings"
                  value={money(lifetimeEarnings)}
                  icon={<IndianRupee size={19} />}
                  note="Pending and approved rewards"
                />
              </div>

              <div className="worker-dashboard-grid">
                <div className="worker-panel worker-welcome-panel">
                  <div className="worker-panel-title">
                    <div>
                      <h2>Start earning with SHELVI</h2>

                      <p>
                        Choose a task, follow its instructions,
                        and submit your work.
                      </p>
                    </div>

                    <div className="worker-panel-icon">
                      <BadgeCheck size={22} />
                    </div>
                  </div>

                  <div className="worker-steps">
                    <div>
                      <span>1</span>
                      <p>
                        <strong>Find a task</strong>
                        Browse available campaigns.
                      </p>
                    </div>

                    <div>
                      <span>2</span>
                      <p>
                        <strong>Complete the task</strong>
                        Follow the campaign instructions.
                      </p>
                    </div>

                    <div>
                      <span>3</span>
                      <p>
                        <strong>Submit proof</strong>
                        Wait for business verification.
                      </p>
                    </div>
                  </div>

                  <button
                    className="worker-secondary-button"
                    onClick={() =>
                      chooseSection("Find tasks")
                    }
                  >
                    Browse marketplace
                    <ArrowUpRight size={16} />
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
                    <span className="worker-verification-icon">
                      <ShieldCheck size={18} />
                    </span>

                    <div>
                      <strong>{verification}</strong>
                      <span>
                        Worker profile verification
                      </span>
                    </div>
                  </div>

                  <p className="worker-demo-note">
                    Task activity and balances are calculated
                    from this worker's saved task records.
                  </p>

                  <button
                    className="worker-text-button"
                    onClick={() =>
                      chooseSection("My profile")
                    }
                  >
                    View profile
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>

              <div className="worker-panel worker-recent-panel">
                <div className="worker-panel-title">
                  <div>
                    <h2>Recent activity</h2>
                    <p>
                      Your latest accepted and submitted
                      tasks.
                    </p>
                  </div>

                  <Clock3 size={20} />
                </div>

                {recentTasks.length ? (
                  <div className="worker-recent-list">
                    {recentTasks.map((task) => (
                      <div
                        className="worker-recent-item"
                        key={task.id}
                      >
                        <div>
                          <strong>{task.title}</strong>

                          <span>
                            {task.client} ·{" "}
                            {new Date(
                              task.submittedAt ||
                                task.acceptedAt
                            ).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <span className="worker-request-status">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="worker-empty-inline">
                    <CheckCircle2 size={20} />

                    <span>
                      No recent activity yet. Browse the
                      marketplace to get started.
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          <footer className="worker-footer">
            © 2026 SHELVI Marketplace
            <span>Worker portal · Demo mode</span>
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

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="worker-profile-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}
