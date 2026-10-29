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
};

type AcceptedTask = Task & {
  status: "Accepted" | "Submitted";
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
    description: "Install the application and complete registration.",
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
    description: "Explore the website and submit your feedback.",
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
    description: "Answer the survey questions honestly.",
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
    description: "Test the main screens and report any issues.",
  },
];

const categories = ["All categories", ...Array.from(new Set(initialTasks.map((task) => task.category)))];

function loadAcceptedTasks(): AcceptedTask[] {
  try {
    const saved = localStorage.getItem("shelvi_accepted_tasks");
    if (!saved) return [];
    const parsed = JSON.parse(saved) as (Task | AcceptedTask)[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((task) => ({
      ...task,
      status: "status" in task && task.status === "Submitted" ? "Submitted" : "Accepted",
    }));
  } catch {
    return [];
  }
}

export default function TaskMarketplace() {
  const [tasks, setTasks] = useState<AcceptedTask[]>(loadAcceptedTasks);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"Available" | "Active">("Available");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [message, setMessage] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem("shelvi_accepted_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const matchesFilters = (task: Task) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.client.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "All categories" || task.category === categoryFilter;
    return matchesSearch && matchesCategory;
  };

  const availableTasks = useMemo(
    () => initialTasks.filter(
      (task) => !tasks.some((accepted) => accepted.id === task.id) && matchesFilters(task),
    ),
    [tasks, search, categoryFilter],
  );

  const activeTasks = useMemo(
    () => tasks.filter((task) => matchesFilters(task)),
    [tasks, search, categoryFilter],
  );

  function acceptTask(task: Task) {
    setTasks((current) => [...current, { ...task, status: "Accepted" }]);
    setMessage(`You accepted "${task.title}".`);
    setSelectedTask(null);
    setActiveTab("Active");
  }

  function submitTask(task: AcceptedTask) {
    if (task.status === "Submitted") return;
    setTasks((current) => current.map((item) =>
      item.id === task.id ? { ...item, status: "Submitted" } : item,
    ));
    setMessage(`"${task.title}" was submitted for review. Verification is a demo until a backend is connected.`);
  }

  const displayedTasks = activeTab === "Available" ? availableTasks : activeTasks;

  return (
    <div className="task-page">
      <div className="task-page-header">
        <div>
          <p className="task-eyebrow">WORKER WORKSPACE</p>
          <h1>Task marketplace</h1>
          <p>Discover tasks and earn rewards for completed work.</p>
        </div>
        <div className="task-total">
          <span>Accepted tasks</span>
          <strong>{tasks.length}</strong>
        </div>
      </div>

      {message && (
        <div className="task-message" role="status">
          <CheckCircle2 size={18} />
          <span>{message}</span>
          <button onClick={() => setMessage("")}>Dismiss</button>
        </div>
      )}

      <div className="task-toolbar">
        <div className="task-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks or clients..."
            aria-label="Search tasks or clients"
          />
        </div>

        <label className="task-category-filter">
          <span className="sr-only">Filter by category</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>

        <div className="task-tabs">
          {(["Available", "Active"] as const).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === "Active" && ` (${tasks.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="task-grid">
        {displayedTasks.map((task) => {
          const acceptedTask = activeTab === "Active" ? task as AcceptedTask : null;
          return (
            <article className="task-card" key={task.id}>
              <div className="task-card-top">
                <div className="task-category-icon">
                  {task.device === "Desktop" ? <Globe size={22} /> : <Smartphone size={22} />}
                </div>
                <span className="task-category">{task.category}</span>
              </div>

              <h2>{task.title}</h2>
              <p className="task-client">By {task.client}</p>
              <p className="task-description">{task.description}</p>

              <div className="task-details">
                <span><Clock size={15} /> {task.minutes} min</span>
                <span><MapPin size={15} /> {task.location}</span>
                <span><Smartphone size={15} /> {task.device}</span>
              </div>

              <div className="task-card-footer">
                <div>
                  <span className="task-reward-label">REWARD</span>
                  <strong>₹{task.reward}</strong>
                </div>
                <div className="task-card-actions">
                  <button className="task-details-button" onClick={() => setSelectedTask(task)}>
                    <Eye size={16} /> Details
                  </button>
                  {activeTab === "Available" ? (
                    <button onClick={() => acceptTask(task)}>Accept task</button>
                  ) : acceptedTask?.status === "Submitted" ? (
                    <span className="task-submitted-status">Submitted</span>
                  ) : (
                    <button className="task-complete-button" onClick={() => submitTask(acceptedTask!)}>
                      <ClipboardCheck size={16} /> Submit for review
                    </button>
                  )}
                </div>
              </div>
              {acceptedTask && (
                <p className="task-status-note">Status: <strong>{acceptedTask.status}</strong></p>
              )}
            </article>
          );
        })}

        {displayedTasks.length === 0 && (
          <div className="task-empty">
            <ClipboardCheck size={30} />
            <h2>No tasks found</h2>
            <p>Try another search, choose a different category, or switch between Available and Active.</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="task-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedTask(null);
        }}>
          <section className="task-details-modal" role="dialog" aria-modal="true" aria-labelledby="task-details-title">
            <div className="task-details-modal-header">
              <div>
                <p className="task-eyebrow">TASK DETAILS</p>
                <h2 id="task-details-title">{selectedTask.title}</h2>
              </div>
              <button className="task-modal-close" onClick={() => setSelectedTask(null)} aria-label="Close task details">
                <X size={20} />
              </button>
            </div>
            <p><strong>Client:</strong> {selectedTask.client}</p>
            <p><strong>Category:</strong> {selectedTask.category}</p>
            <p>{selectedTask.description}</p>
            <div className="task-modal-facts">
              <span><strong>Reward</strong> ₹{selectedTask.reward}</span>
              <span><strong>Estimated time</strong> {selectedTask.minutes} minutes</span>
              <span><strong>Device</strong> {selectedTask.device}</span>
              <span><strong>Location</strong> {selectedTask.location}</span>
            </div>
            <div className="task-modal-actions">
              <button className="task-details-button" onClick={() => setSelectedTask(null)}>Close</button>
              {activeTab === "Available" && !tasks.some((task) => task.id === selectedTask.id) && (
                <button onClick={() => acceptTask(selectedTask)}>Accept task · ₹{selectedTask.reward}</button>
              )}
            </div>
            <p className="task-demo-note">Demo marketplace: task acceptance and submission are saved in this browser. Review and payment require a backend.</p>
          </section>
        </div>
      )}
    </div>
  );
}
