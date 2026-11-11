
import { useEffect, useMemo, useState } from "react";
import "./TaskMarketplace.css";
import {
  Search,
  Smartphone,
  Globe,
  ClipboardCheck,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Eye,
  Upload,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  client: string;
  category: string;
  reward: number;
  minutes: number;
  device: string;
  location: string;
  description: string;
  instructions: string[];
  proofRequired: string;
  deadlineDays: number;
};

export type WorkerTask = Task & {
  status:
    | "Accepted"
    | "Pending Verification"
    | "Approved"
    | "Rejected"
    | "Completed";
  acceptedAt: string;
  submittedAt?: string;
  proofNote?: string;
  proofFileName?: string;
};

type Props = {
  workerId: string;
  view?: "marketplace" | "my-tasks";
  onTasksChange?: (tasks: WorkerTask[]) => void;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Install and register in an app",
    client: "Tech Solutions",
    category: "App task",
    reward: 12,
    minutes: 5,
    device: "Android",
    location: "India",
    description:
      "Install the application and complete registration.",
    instructions: [
      "Open the campaign app link provided by the client.",
      "Install the app on your Android device.",
      "Complete the registration form using valid details.",
      "Capture a screenshot showing successful registration.",
    ],
    proofRequired:
      "Screenshot of the successful registration screen",
    deadlineDays: 2,
  },
  {
    id: 2,
    title: "Complete a website usability test",
    client: "Digital Research",
    category: "Website testing",
    reward: 60,
    minutes: 15,
    device: "Desktop",
    location: "India",
    description:
      "Explore the website and submit your feedback.",
    instructions: [
      "Open the website on a desktop browser.",
      "Explore the home page and the main navigation.",
      "Test the key user journey.",
      "Write clear feedback about your experience.",
    ],
    proofRequired:
      "Feedback note and screenshot of the tested page",
    deadlineDays: 3,
  },
  {
    id: 3,
    title: "Complete a product survey",
    client: "Market Insights",
    category: "Research",
    reward: 25,
    minutes: 10,
    device: "All devices",
    location: "India",
    description:
      "Answer the survey questions honestly.",
    instructions: [
      "Open the survey.",
      "Answer every required question honestly.",
      "Review your answers before submitting.",
      "Save the survey completion confirmation.",
    ],
    proofRequired: "Survey completion screenshot",
    deadlineDays: 2,
  },
  {
    id: 4,
    title: "Test a mobile application",
    client: "App Studio",
    category: "App testing",
    reward: 40,
    minutes: 12,
    device: "Android",
    location: "India",
    description:
      "Test the main screens and report any issues.",
    instructions: [
      "Install and open the test application.",
      "Visit each main screen.",
      "Try the available buttons and forms.",
      "Describe any issue and attach a screenshot.",
    ],
    proofRequired:
      "Screenshots and a short issue report",
    deadlineDays: 3,
  },
];

const categories = [
  "All categories",
  ...Array.from(new Set(initialTasks.map((task) => task.category))),
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const storageKey = (workerId: string) =>
  `shelvi_worker_tasks_${workerId}`;

function loadTasks(workerId: string): WorkerTask[] {
  try {
    const raw = localStorage.getItem(storageKey(workerId));

    if (!raw) return [];

    const value = JSON.parse(raw);

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function TaskMarketplace({
  workerId,
  view = "marketplace",
  onTasksChange,
}: Props) {
  const [tasks, setTasks] = useState<WorkerTask[]>(() =>
    loadTasks(workerId)
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All categories");

  const [tab, setTab] = useState<
    "Available" | "Active" | "History"
  >(view === "my-tasks" ? "Active" : "Available");

  const [message, setMessage] = useState("");
  const [selected, setSelected] =
    useState<Task | WorkerTask | null>(null);

  const [proofNote, setProofNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(
    null
  );
  const [proofError, setProofError] = useState("");

  useEffect(() => {
    setTasks(loadTasks(workerId));
    setTab(view === "my-tasks" ? "Active" : "Available");
  }, [workerId, view]);

  useEffect(() => {
    localStorage.setItem(
      storageKey(workerId),
      JSON.stringify(tasks)
    );

    onTasksChange?.(tasks);
  }, [tasks, workerId, onTasksChange]);

  const available = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialTasks.filter((task) => {
      const alreadyAccepted = tasks.some(
        (item) => item.id === task.id
      );

      const matchesSearch =
        !query ||
        `${task.title} ${task.client} ${task.description} ${task.category}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All categories" ||
        task.category === category;

      return (
        !alreadyAccepted &&
        matchesSearch &&
        matchesCategory
      );
    });
  }, [tasks, search, category]);

  const active = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        `${task.title} ${task.client} ${task.description} ${task.category}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All categories" ||
        task.category === category;

      return (
        ["Accepted", "Pending Verification"].includes(
          task.status
        ) &&
        matchesSearch &&
        matchesCategory
      );
    });
  }, [tasks, search, category]);

  const history = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        `${task.title} ${task.client} ${task.description} ${task.category}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All categories" ||
        task.category === category;

      return (
        ["Approved", "Rejected", "Completed"].includes(
          task.status
        ) &&
        matchesSearch &&
        matchesCategory
      );
    });
  }, [tasks, search, category]);

  const shown =
    view === "my-tasks"
      ? tab === "History"
        ? history
        : active
      : tab === "Available"
        ? available
        : tab === "History"
          ? history
          : active;

  function acceptTask(task: Task) {
    const accepted: WorkerTask = {
      ...task,
      status: "Accepted",
      acceptedAt: new Date().toISOString(),
    };

    setTasks((current) => [...current, accepted]);

    setMessage(
      `You accepted "${task.title}". It is now listed under My tasks.`
    );

    setSelected(null);
    setTab("Active");
  }

  function submitProof(task: WorkerTask) {
    if (!proofNote.trim() && !proofFile) {
      setProofError(
        "Add a short completion note or select a proof file before submitting."
      );
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: "Pending Verification",
              submittedAt: new Date().toISOString(),
              proofNote: proofNote.trim(),
              proofFileName: proofFile?.name,
            }
          : item
      )
    );

    setMessage(
      `Proof details for "${task.title}" were submitted for verification.`
    );

    setSelected(null);
    setProofNote("");
    setProofFile(null);
    setProofError("");
    setTab("Active");
  }

  const statusClass = (status: WorkerTask["status"]) =>
    status.toLowerCase().replace(/ /g, "-");

  return (
    <div className="task-page">
      <div className="task-page-header">
        <div>
          <p className="task-eyebrow">WORKER WORKSPACE</p>

          <h1>
            {view === "my-tasks"
              ? "My tasks"
              : "Task marketplace"}
          </h1>

          <p>
            {view === "my-tasks"
              ? "Track your accepted tasks and submitted work."
              : "Discover tasks, review requirements and earn rewards."}
          </p>
        </div>

        <div className="task-total">
          <span>
            {view === "my-tasks"
              ? "My tasks"
              : "Accepted tasks"}
          </span>
          <strong>{tasks.length}</strong>
        </div>
      </div>

      {message && (
        <div className="task-message" role="status">
          <CheckCircle2 size={18} />

          <span>{message}</span>

          <button onClick={() => setMessage("")}>
            Dismiss
          </button>
        </div>
      )}

      <div className="task-toolbar">
        <div className="task-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search tasks or clients..."
            aria-label="Search tasks"
          />
        </div>

        <label className="task-category-filter">
          <span className="sr-only">
            Filter category
          </span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="task-tabs">
          {(
            view === "my-tasks"
              ? ["Active", "History"]
              : ["Available", "Active", "History"]
          ).map((item) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() =>
                setTab(
                  item as "Available" | "Active" | "History"
                )
              }
            >
              {item}

              {item === "Active" && ` (${active.length})`}
              {item === "History" && ` (${history.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="task-grid">
        {shown.map((task) => {
          const accepted =
            "status" in task ? task : null;

          return (
            <article className="task-card" key={task.id}>
              <div className="task-card-top">
                <div className="task-category-icon">
                  {task.device === "Desktop" ? (
                    <Globe size={22} />
                  ) : (
                    <Smartphone size={22} />
                  )}
                </div>

                <span className="task-category">
                  {task.category}
                </span>
              </div>

              <h2>{task.title}</h2>

              <p className="task-client">
                By {task.client}
              </p>

              <p className="task-description">
                {task.description}
              </p>

              <div className="task-details">
                <span>
                  <Clock size={15} />
                  {task.minutes} min
                </span>

                <span>
                  <MapPin size={15} />
                  {task.location}
                </span>

                <span>
                  <Smartphone size={15} />
                  {task.device}
                </span>
              </div>

              <div className="task-card-footer">
                <div>
                  <span className="task-reward-label">
                    REWARD
                  </span>

                  <strong>{money(task.reward)}</strong>
                </div>

                <div className="task-card-actions">
                  <button
                    className="task-details-button"
                    onClick={() => {
                      setSelected(task);
                      setProofNote(
                        accepted?.proofNote || ""
                      );
                      setProofFile(null);
                      setProofError("");
                    }}
                  >
                    <Eye size={16} />
                    Details
                  </button>

                  {!accepted ? (
                    <button
                      onClick={() => acceptTask(task)}
                    >
                      Accept task
                    </button>
                  ) : accepted.status === "Accepted" ? (
                    <button
                      className="task-complete-button"
                      onClick={() => {
                        setSelected(accepted);
                        setProofNote("");
                        setProofFile(null);
                        setProofError("");
                      }}
                    >
                      Submit proof
                    </button>
                  ) : (
                    <span
                      className={`task-status-pill ${statusClass(
                        accepted.status
                      )}`}
                    >
                      {accepted.status}
                    </span>
                  )}
                </div>
              </div>

              {accepted && (
                <p className="task-status-note">
                  Status: <strong>{accepted.status}</strong>
                </p>
              )}
            </article>
          );
        })}

        {shown.length === 0 && (
          <div className="task-empty">
            <ClipboardCheck size={30} />

            <h2>
              {tab === "Available"
                ? "No available tasks"
                : "No tasks to display"}
            </h2>

            <p>
              Try changing your search or category filter.
              Accepted tasks will appear here.
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="task-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section
            className="task-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-details-title"
          >
            <div className="task-details-modal-header">
              <div>
                <p className="task-eyebrow">
                  TASK DETAILS
                </p>

                <h2 id="task-details-title">
                  {selected.title}
                </h2>
              </div>

              <button
                className="task-modal-close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <p>
              <strong>Client:</strong> {selected.client}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {selected.category}
            </p>

            <p>{selected.description}</p>

            <div className="task-modal-facts">
              <span>
                <strong>Reward</strong>
                {money(selected.reward)}
              </span>

              <span>
                <strong>Estimated time</strong>
                {selected.minutes} minutes
              </span>

              <span>
                <strong>Device</strong>
                {selected.device}
              </span>

              <span>
                <strong>Deadline</strong>
                {selected.deadlineDays} days after acceptance
              </span>
            </div>

            <div className="task-instructions">
              <h3>Task instructions</h3>

              <ol>
                {selected.instructions.map(
                  (instruction, index) => (
                    <li key={index}>{instruction}</li>
                  )
                )}
              </ol>

              <p>
                <strong>Required proof:</strong>{" "}
                {selected.proofRequired}
              </p>
            </div>

            {"status" in selected &&
              selected.status === "Accepted" && (
                <div className="task-proof-form">
                  <h3>
                    <Upload size={17} />
                    Submit completion proof
                  </h3>

                  <label>
                    Completion note

                    <textarea
                      value={proofNote}
                      onChange={(event) =>
                        setProofNote(event.target.value)
                      }
                      rows={3}
                      placeholder="Explain what you completed and include any relevant details..."
                    />
                  </label>

                  <label>
                    Proof attachment (optional)

                    <input
                      type="file"
                      accept="image/*,.pdf,.mp4"
                      onChange={(event) =>
                        setProofFile(
                          event.target.files?.[0] || null
                        )
                      }
                    />
                  </label>

                  {proofFile && (
                    <small>
                      Selected: {proofFile.name}
                    </small>
                  )}

                  {proofError && (
                    <p className="task-proof-error">
                      {proofError}
                    </p>
                  )}

                  <p className="task-demo-note">
                    Demo mode stores the proof note and
                    selected filename in this browser. The
                    actual attachment must be uploaded to
                    secure server storage when the backend
                    is connected.
                  </p>
                </div>
              )}

            <div className="task-modal-actions">
              <button
                className="task-details-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>

              {!("status" in selected) &&
                tab === "Available" && (
                  <button
                    onClick={() => acceptTask(selected)}
                  >
                    Accept task · {money(selected.reward)}
                  </button>
                )}

              {"status" in selected &&
                selected.status === "Accepted" && (
                  <button
                    onClick={() =>
                      submitProof(selected as WorkerTask)
                    }
                  >
                    Submit for verification
                  </button>
                )}
            </div>

            {"status" in selected &&
              selected.status === "Pending Verification" && (
                <p className="task-demo-note">
                  Your submission is awaiting review. Reward
                  is not available for withdrawal until it is
                  approved.
                </p>
              )}
          </section>
        </div>
      )}
    </div>
  );
}
