import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nbojegbpyzfhfeqoiebn.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vLCym3N81KNa7M-GBcXLA_AnSPDis5";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STATUS = {
  "on-track":   { bg: "#FFD60015", text: "#FFD600", dot: "#FFD600", label: "On Track" },
  "at-risk":    { bg: "#00C9CC15", text: "#00C9CC", dot: "#00C9CC", label: "At Risk" },
  "completed":  { bg: "#4ade8015", text: "#4ade80", dot: "#4ade80", label: "Completed" },
  "critical":   { bg: "#ff444415", text: "#ff6b6b", dot: "#ff6b6b", label: "Critical" },
  "pending":    { bg: "#ffffff10", text: "#888",    dot: "#888",    label: "Pending" },
  "in-progress":{ bg: "#FFD60015", text: "#FFD600", dot: "#FFD600", label: "In Progress" },
  "done":       { bg: "#4ade8015", text: "#4ade80", dot: "#4ade80", label: "Done" },
  "overdue":    { bg: "#ff444415", text: "#ff6b6b", dot: "#ff6b6b", label: "Overdue" },
};

const ROLE_BADGE = {
  owner:   { color: "#FFD600", label: "OWNER" },
  manager: { color: "#00C9CC", label: "MANAGER" },
  employee:{ color: "#888",    label: "EMPLOYEE" },
};

function getRole(profile) {
  if (profile?.is_owner) return "owner";
  if (profile?.is_manager) return "manager";
  return "employee";
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ height: "5px", background: "#1a1a1a", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(value || 0, 100)}%`, height: "100%", background: color, borderRadius: "10px", transition: "width 0.5s ease" }} />
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS[status] || STATUS["pending"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: s.bg, color: s.text, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function RolePill({ profile }) {
  const role = getRole(profile);
  const rb = ROLE_BADGE[role];
  return (
    <span style={{ fontSize: "9px", color: rb.color, background: `${rb.color}15`, padding: "2px 8px", borderRadius: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>{rb.label}</span>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "#333", fontSize: "13px" }}>Loading...</div>;
}

function Empty({ msg }) {
  return <div style={{ textAlign: "center", padding: "60px", color: "#222", fontSize: "13px" }}>{msg}</div>;
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "8px 12px", color: "#e0e0e0", fontSize: "12px", outline: "none" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "8px 12px", color: "#e0e0e0", fontSize: "12px", outline: "none" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    onLogin(data.user);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Bebas+Neue&display=swap');`}</style>
      <div style={{ width: "380px", background: "#111", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#0d0d0d", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 100 100" width="22" height="22">
              <ellipse cx="50" cy="38" rx="28" ry="26" fill="#FFD600" />
              <circle cx="50" cy="38" r="11" fill="#00C9CC" />
              <rect x="43" y="63" width="14" height="18" rx="4" fill="white" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2.5px", color: "#fff" }}>WE ARE EYEDIA</div>
            <div style={{ fontSize: "9px", color: "#222", letterSpacing: "1px", textTransform: "uppercase" }}>Workflow OS</div>
          </div>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#e0e0e0", marginBottom: "6px" }}>Welcome back</div>
        <div style={{ fontSize: "12px", color: "#333", marginBottom: "28px" }}>Sign in to access your dashboard</div>
        {error && <div style={{ background: "#ff6b6b15", border: "1px solid #ff6b6b30", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#ff6b6b", marginBottom: "16px" }}>{error}</div>}
        <div style={{ marginBottom: "14px" }}>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@eyedia.com" />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
        </div>
        <button onClick={login} disabled={loading} style={{
          width: "100%", padding: "12px", background: loading ? "#1a1a1a" : "#FFD600", border: "none",
          borderRadius: "10px", color: loading ? "#333" : "#000", fontSize: "13px", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s"
        }}>{loading ? "Signing in..." : "Sign In →"}</button>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────
function OverviewView({ bizFilter, bizColor, profile }) {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getRole(profile);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let projQuery = supabase.from("projects").select("*").eq("business", bizFilter);
      if (role === "manager") {
        const { data: mp } = await supabase.from("manager_projects").select("project_id").eq("manager_id", profile.id);
        const ids = (mp || []).map(r => r.project_id);
        if (ids.length) projQuery = projQuery.in("id", ids); else { setProjects([]); setLoading(false); return; }
      }
      const [{ data: emps }, { data: projs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("business", bizFilter),
        projQuery,
      ]);
      setEmployees(emps || []);
      setProjects(projs || []);
      setLoading(false);
    }
    load();
  }, [bizFilter]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Team Members", value: employees.length, sub: `in ${bizFilter}`, color: bizColor, icon: "◈" },
          { label: "Active Projects", value: projects.length, sub: `${projects.filter(p => p.status === "completed").length} completed`, color: "#4ade80", icon: "◻" },
          { label: "Critical", value: projects.filter(p => p.status === "critical").length, sub: "need attention", color: "#ff6b6b", icon: "⚠" },
          { label: "On Track", value: projects.filter(p => p.status === "on-track").length, sub: "running smoothly", color: "#888", icon: "✦" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "10px", color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: s.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "1px" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "4px" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "16px" }}>Team</div>
          {employees.length === 0 ? <Empty msg="No team members yet" /> : employees.map(emp => (
            <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${bizColor}20`, color: bizColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
                {emp.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#ccc" }}>{emp.full_name}</div>
                <div style={{ fontSize: "10px", color: "#2a2a2a" }}>{emp.role}</div>
              </div>
              <RolePill profile={emp} />
            </div>
          ))}
        </div>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "16px" }}>
            {role === "manager" ? "Your Projects" : "All Projects"}
          </div>
          {projects.length === 0 ? <Empty msg="No projects yet" /> : projects.map(p => {
            const barColor = p.status === "critical" ? "#ff6b6b" : p.status === "at-risk" ? "#00C9CC" : bizColor;
            return (
              <div key={p.id} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#ccc" }}>{p.name}</div>
                    <div style={{ fontSize: "10px", color: "#2a2a2a" }}>{p.client}</div>
                  </div>
                  <span style={{ fontSize: "12px", color: barColor, fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} color={barColor} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tasks View ───────────────────────────────────────────
function TasksView({ bizFilter, profile }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "", project_id: "", deadline: "", status: "pending" });
  const role = getRole(profile);
  const canAdd = role === "owner" || role === "manager";

  async function load() {
    setLoading(true);
    let projIds = null;
    if (role === "manager") {
      const { data: mp } = await supabase.from("manager_projects").select("project_id").eq("manager_id", profile.id);
      projIds = (mp || []).map(r => r.project_id);
    }
    let taskQuery = supabase.from("tasks").select("*, profiles(full_name), projects(name)").eq("business", bizFilter);
    if (role === "employee") taskQuery = taskQuery.eq("assigned_to", profile.id);
    else if (role === "manager" && projIds?.length) taskQuery = taskQuery.in("project_id", projIds);

    let projQuery = supabase.from("projects").select("id, name").eq("business", bizFilter);
    if (role === "manager" && projIds?.length) projQuery = projQuery.in("id", projIds);

    const [{ data: t }, { data: p }, { data: e }] = await Promise.all([
      taskQuery,
      projQuery,
      supabase.from("profiles").select("id, full_name").eq("business", bizFilter),
    ]);
    setTasks(t || []);
    setProjects(p || []);
    setEmployees(e || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  async function addTask() {
    if (!form.title || !form.project_id) return;
    await supabase.from("tasks").insert([{ ...form, business: bizFilter }]);
    setShowAdd(false);
    setForm({ title: "", description: "", assigned_to: "", project_id: "", deadline: "", status: "pending" });
    load();
  }

  async function updateStatus(id, status) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {canAdd && (
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "8px 18px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "10px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            + Add Task
          </button>
        </div>
      )}

      {showAdd && (
        <div style={{ background: "#111", border: "1px solid #FFD60030", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#FFD600", fontWeight: 700, marginBottom: "14px" }}>New Task</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <Input label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Task title" />
            <Input label="Deadline" value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} type="date" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <Select label="Assign To" value={form.assigned_to} onChange={v => setForm({ ...form, assigned_to: v })}
              options={[{ value: "", label: "Select employee" }, ...employees.map(e => ({ value: e.id, label: e.full_name }))]} />
            <Select label="Project" value={form.project_id} onChange={v => setForm({ ...form, project_id: v })}
              options={[{ value: "", label: "Select project" }, ...projects.map(p => ({ value: p.id, label: p.name }))]} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <Input label="Description (optional)" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Brief description..." />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addTask} style={{ padding: "8px 18px", background: "#FFD600", border: "none", borderRadius: "8px", color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Save Task</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "8px", color: "#333", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? <Empty msg={canAdd ? "No tasks yet. Add your first task above!" : "No tasks assigned to you yet."} /> : (
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                {["Task", "Assigned To", "Project", "Deadline", "Status", "Update"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <tr key={task.id} style={{ borderBottom: i < tasks.length - 1 ? "1px solid #111" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#e0e0e0" }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "2px" }}>{task.description}</div>}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#555" }}>{task.profiles?.full_name || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#555" }}>{task.projects?.name || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#555", whiteSpace: "nowrap" }}>{task.deadline || "—"}</td>
                  <td style={{ padding: "13px 16px" }}><Badge status={task.status} /></td>
                  <td style={{ padding: "13px 16px" }}>
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                      style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "4px 8px", color: "#555", fontSize: "11px", cursor: "pointer", outline: "none" }}>
                      {["pending", "in-progress", "done", "overdue"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Projects View ────────────────────────────────────────
function ProjectsView({ bizFilter, bizColor, profile }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", deadline: "", progress: 0, status: "on-track" });
  const role = getRole(profile);
  const canAdd = role === "owner" || role === "manager";

  async function load() {
    setLoading(true);
    let query = supabase.from("projects").select("*").eq("business", bizFilter);
    if (role === "manager") {
      const { data: mp } = await supabase.from("manager_projects").select("project_id").eq("manager_id", profile.id);
      const ids = (mp || []).map(r => r.project_id);
      if (ids.length) query = query.in("id", ids); else { setProjects([]); setLoading(false); return; }
    }
    const { data } = await query;
    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  async function addProject() {
    if (!form.name || !form.client) return;
    const { data } = await supabase.from("projects").insert([{ ...form, business: bizFilter }]).select().single();
    if (data && role === "manager") {
      await supabase.from("manager_projects").insert([{ manager_id: profile.id, project_id: data.id }]);
    }
    setShowAdd(false);
    setForm({ name: "", client: "", deadline: "", progress: 0, status: "on-track" });
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {canAdd && (
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "8px 18px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "10px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>+ Add Project</button>
        </div>
      )}
      {showAdd && (
        <div style={{ background: "#111", border: "1px solid #FFD60030", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#FFD600", fontWeight: 700, marginBottom: "14px" }}>New Project</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <Input label="Project Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Input label="Client" value={form.client} onChange={v => setForm({ ...form, client: v })} />
            <Input label="Deadline" value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} type="date" />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addProject} style={{ padding: "8px 18px", background: "#FFD600", border: "none", borderRadius: "8px", color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "8px", color: "#333", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      {projects.length === 0 ? <Empty msg="No projects yet." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {projects.map(p => {
            const barColor = p.status === "critical" ? "#ff6b6b" : p.status === "at-risk" ? "#00C9CC" : bizColor;
            return (
              <div key={p.id} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ flex: 1, marginRight: "10px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#e0e0e0", marginBottom: "3px" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "#2a2a2a" }}>{p.client} · {p.deadline}</div>
                  </div>
                  <Badge status={p.status} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#333" }}>Progress</span>
                  <span style={{ fontSize: "12px", color: barColor, fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} color={barColor} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Deliverables View ────────────────────────────────────
function DeliverablesView({ bizFilter, profile }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getRole(profile);

  async function load() {
    setLoading(true);
    let query = supabase.from("deliverables").select("*, profiles(full_name)").eq("business", bizFilter);
    if (role === "manager") {
      const { data: mp } = await supabase.from("manager_projects").select("project_id").eq("manager_id", profile.id);
      const ids = (mp || []).map(r => r.project_id);
      if (ids.length) query = query.in("project_id", ids); else { setItems([]); setLoading(false); return; }
    }
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  async function toggle(id, delivered) {
    await supabase.from("deliverables").update({ delivered: !delivered, delivered_at: !delivered ? new Date().toISOString() : null }).eq("id", id);
    load();
  }

  if (loading) return <Spinner />;
  if (items.length === 0) return <Empty msg="No deliverables yet." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map(d => (
        <div key={d.id} style={{ background: "#111", border: `1px solid ${d.delivered ? "#4ade8025" : "#1a1a1a"}`, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: d.delivered ? "#4ade8015" : "#ff6b6b15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
              {d.delivered ? "✓" : "⏳"}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#e0e0e0" }}>{d.name}</div>
              <div style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "2px" }}>{d.client} · {d.profiles?.full_name || "—"} · Due {d.due_date}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: d.delivered ? "#4ade80" : "#ff6b6b", textTransform: "uppercase" }}>
              {d.delivered ? "Delivered" : "Pending"}
            </span>
            <button onClick={() => toggle(d.id, d.delivered)} style={{ padding: "5px 12px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "7px", color: "#333", fontSize: "11px", cursor: "pointer" }}>
              {d.delivered ? "Mark Pending" : "Mark Delivered"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Follow-ups View (Owner only) ─────────────────────────
function FollowUpsView({ bizFilter }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("followup_alerts").select("*, profiles(full_name)").eq("business", bizFilter).eq("dismissed", false).order("created_at", { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  async function dismiss(id) { await supabase.from("followup_alerts").update({ dismissed: true }).eq("id", id); load(); }
  async function markSent(id) { await supabase.from("followup_alerts").update({ sent_whatsapp: true }).eq("id", id); load(); }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", padding: "12px 16px", background: "#FFD60008", border: "1px solid #FFD60020", borderRadius: "10px" }}>
        <div style={{ width: "7px", height: "7px", background: "#FFD600", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
        <span style={{ fontSize: "12px", color: "#555" }}>Claude AI monitors your team and surfaces issues here in real time</span>
      </div>
      {alerts.length === 0
        ? <div style={{ textAlign: "center", padding: "60px", color: "#222", fontSize: "13px" }}>🎉 All clear — no pending follow-ups!</div>
        : alerts.map(f => (
          <div key={f.id} style={{ borderLeft: `3px solid ${f.alert_type === "critical" ? "#ff6b6b" : "#00C9CC"}`, background: "#111", borderRadius: "0 12px 12px 0", padding: "16px 18px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: f.alert_type === "critical" ? "#ff6b6b" : "#00C9CC" }}>{f.profiles?.full_name || "Team Member"}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: f.alert_type === "critical" ? "#ff6b6b" : "#00C9CC", textTransform: "uppercase" }}>{f.alert_type}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#2a2a2a" }}>{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px", lineHeight: "1.6" }}>{f.message}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {f.sent_whatsapp
                ? <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>✓ WhatsApp sent</span>
                : <button onClick={() => markSent(f.id)} style={{ padding: "7px 16px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "8px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>📲 Mark as Sent</button>
              }
              <button onClick={() => dismiss(f.id)} style={{ padding: "7px 16px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "8px", color: "#333", fontSize: "12px", cursor: "pointer" }}>Dismiss</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
export default function EyediaApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeBiz, setActiveBiz] = useState("digital");
  const [activeView, setActiveView] = useState("overview");
  const [authChecked, setAuthChecked] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      setAuthChecked(true);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
  }, []);

  useEffect(() => {
    if (profile?.is_owner) {
      supabase.from("followup_alerts").select("id", { count: "exact" }).eq("dismissed", false).eq("business", activeBiz)
        .then(({ count }) => setAlertCount(count || 0));
    }
  }, [activeBiz, profile]);

  async function loadProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) { setProfile(data); if (data.business && data.business !== "both") setActiveBiz(data.business); }
  }

  const bizColor = activeBiz === "digital" ? "#FFD600" : "#00C9CC";
  const bizName = activeBiz === "digital" ? "Eyedia Digital" : "Eyedia Production";
  const role = getRole(profile);

  const navItems = [
    { id: "overview", label: "Overview", icon: "⬡" },
    { id: "tasks", label: role === "employee" ? "My Tasks" : "Tasks", icon: "◈" },
    { id: "projects", label: "Projects", icon: "◻" },
    { id: "deliverables", label: "Deliverables", icon: "◷" },
    ...(role === "owner" ? [{ id: "followups", label: "Follow-ups", icon: "⚡", alert: alertCount }] : []),
  ];

  if (!authChecked) return <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontFamily: "sans-serif" }}>Loading...</div>;
  if (!user) return <AuthScreen onLogin={(u) => { setUser(u); loadProfile(u.id); }} />;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#080808", minHeight: "100vh", color: "#e0e0e0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0d0d0d; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.25s ease forwards; }
        select option { background: #111; }
      `}</style>

      {/* Top Bar */}
      <div style={{ borderBottom: "1px solid #111", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px", position: "sticky", top: 0, background: "#080808", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#111", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 100 100" width="20" height="20">
              <ellipse cx="50" cy="38" rx="28" ry="26" fill="#FFD600" />
              <circle cx="50" cy="38" r="11" fill="#00C9CC" />
              <rect x="43" y="63" width="14" height="18" rx="4" fill="white" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", letterSpacing: "2.5px", color: "#fff", lineHeight: 1 }}>WE ARE EYEDIA</div>
            <div style={{ fontSize: "9px", color: "#222", letterSpacing: "1px", textTransform: "uppercase" }}>Workflow OS</div>
          </div>
        </div>

        {(role === "owner" || profile?.business === "both") && (
          <div style={{ display: "flex", gap: "4px", background: "#0d0d0d", padding: "4px", borderRadius: "10px", border: "1px solid #111" }}>
            {[{ id: "digital", label: "Eyedia Digital", color: "#FFD600" }, { id: "production", label: "Eyedia Production", color: "#00C9CC" }].map(b => (
              <button key={b.id} onClick={() => { setActiveBiz(b.id); setActiveView("overview"); }} style={{
                padding: "6px 14px", borderRadius: "7px", border: "1px solid transparent", cursor: "pointer",
                fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
                background: activeBiz === b.id ? `${b.color}15` : "transparent",
                color: activeBiz === b.id ? b.color : "#333",
                borderColor: activeBiz === b.id ? `${b.color}30` : "transparent",
              }}>{b.label}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "#222" }}>Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#333", background: "#0d0d0d", padding: "5px 12px", borderRadius: "8px", border: "1px solid #111" }}>
            {profile?.full_name || user.email}
            {profile && <RolePill profile={profile} />}
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "5px 12px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "8px", color: "#333", fontSize: "11px", cursor: "pointer" }}>Sign out</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 58px)" }}>
        {/* Sidebar */}
        <div style={{ width: "195px", borderRight: "1px solid #111", padding: "18px 10px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: activeView === item.id ? `${bizColor}12` : "transparent",
              color: activeView === item.id ? bizColor : "#333",
              fontSize: "12px", fontWeight: activeView === item.id ? 700 : 500,
              marginBottom: "2px", transition: "all 0.15s", textAlign: "left",
            }}
              onMouseEnter={e => { if (activeView !== item.id) e.currentTarget.style.background = "#0f0f0f"; }}
              onMouseLeave={e => { if (activeView !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>{item.icon}</span>{item.label}</span>
              {item.alert > 0 && <span style={{ background: "#ff6b6b", color: "white", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "10px" }}>{item.alert}</span>}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div style={{ height: "1px", background: "#111", marginBottom: "14px" }} />
            <div style={{ padding: "12px", background: `${bizColor}08`, border: `1px solid ${bizColor}15`, borderRadius: "10px" }}>
              <div style={{ fontSize: "9px", color: bizColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Active</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ccc" }}>{bizName}</div>
              <div style={{ fontSize: "10px", color: "#2a2a2a", marginTop: "3px" }}>{role === "owner" ? "Owner" : role === "manager" ? "Manager" : profile?.role}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }} key={activeBiz + activeView} className="fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                <div style={{ width: "3px", height: "18px", background: bizColor, borderRadius: "2px" }} />
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "2px", color: "#fff" }}>
                  {navItems.find(n => n.id === activeView)?.label.toUpperCase()}
                </h1>
              </div>
              <p style={{ fontSize: "11px", color: "#222", paddingLeft: "11px" }}>{bizName}</p>
            </div>
          </div>
          {activeView === "overview" && <OverviewView bizFilter={activeBiz} bizColor={bizColor} profile={profile} />}
          {activeView === "tasks" && <TasksView bizFilter={activeBiz} profile={profile} />}
          {activeView === "projects" && <ProjectsView bizFilter={activeBiz} bizColor={bizColor} profile={profile} />}
          {activeView === "deliverables" && <DeliverablesView bizFilter={activeBiz} profile={profile} />}
          {activeView === "followups" && <FollowUpsView bizFilter={activeBiz} />}
        </div>
      </div>
    </div>
  );
}
