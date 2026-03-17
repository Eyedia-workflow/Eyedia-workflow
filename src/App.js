// v2.2 - fixed build errors
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nbojegbpyzfhfeqoiebn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ib2plZ2JweXpmaGZlcW9pZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTQ2NjQsImV4cCI6MjA4ODU3MDY2NH0.TtHMGuKqpSpE8sPaSLVhdXi5yKTJEaWsMx7cdqTGpek";
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
  "submitted":  { bg: "#a855f715", text: "#a855f7", dot: "#a855f7", label: "Pending Approval" },
  "rejected":   { bg: "#ff444415", text: "#ff6b6b", dot: "#ff6b6b", label: "Rejected" },
};

const ROLE_BADGE = {
  owner:    { color: "#FFD600", label: "OWNER" },
  manager:  { color: "#00C9CC", label: "MANAGER" },
  employee: { color: "#888",    label: "TEAM MEMBER" },
};

function getRole(profile, clientMembers) {
  if (profile?.is_owner) return "owner";
  if (clientMembers?.some(m => m.profile_id === profile?.id && m.project_role?.toLowerCase().includes("manager"))) return "manager";
  return "employee";
}

function getClientRole(profileId, clientId, clientMembers) {
  const m = clientMembers?.find(m => m.profile_id === profileId && m.client_id === clientId);
  return m?.client_role || null;
}

function isManagerOnClient(profileId, clientId, clientMembers) {
  const role = getClientRole(profileId, clientId, clientMembers);
  return role?.toLowerCase().includes("manager") || false;
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ height: "5px", background: "#e8e8e8", borderRadius: "10px", overflow: "hidden" }}>
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

function RolePill({ profile, clientMembers }) {
  const role = getRole(profile, clientMembers || []);
  const rb = ROLE_BADGE[role];
  return (
    <span style={{ fontSize: "9px", color: rb.color, background: `${rb.color}15`, padding: "2px 8px", borderRadius: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>{rb.label}</span>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "#666666", fontSize: "13px" }}>Loading...</div>;
}

function Empty({ msg }) {
  return <div style={{ textAlign: "center", padding: "60px", color: "#999999", fontSize: "13px" }}>{msg}</div>;
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#666666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "8px 12px", color: "#111111", fontSize: "12px", outline: "none" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#666666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "8px 12px", color: "#111111", fontSize: "12px", outline: "none" }}>
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
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Bebas+Neue&display=swap');`}</style>
      <div style={{ width: "380px", background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "20px", padding: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ffffff", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 100 100" width="22" height="22">
              <ellipse cx="50" cy="38" rx="28" ry="26" fill="#FFD600" />
              <circle cx="50" cy="38" r="11" fill="#00C9CC" />
              <rect x="43" y="63" width="14" height="18" rx="4" fill="white" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2.5px", color: "#111111" }}>WE ARE EYEDIA</div>
            <div style={{ fontSize: "9px", color: "#999999", letterSpacing: "1px", textTransform: "uppercase" }}>Workflow OS</div>
          </div>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "6px" }}>Welcome back</div>
        <div style={{ fontSize: "12px", color: "#666666", marginBottom: "28px" }}>Sign in to access your dashboard</div>
        {error && <div style={{ background: "#ff6b6b15", border: "1px solid #ff6b6b30", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#ff6b6b", marginBottom: "16px" }}>{error}</div>}
        <div style={{ marginBottom: "14px" }}>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@eyedia.com" />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
        </div>
        <button onClick={login} disabled={loading} style={{
          width: "100%", padding: "12px", background: loading ? "#e8e8e8" : "#FFD600", border: "none",
          borderRadius: "10px", color: loading ? "#666666" : "#000", fontSize: "13px", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s"
        }}>{loading ? "Signing in..." : "Sign In →"}</button>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────
function OverviewView({ bizFilter, bizColor, profile, clientMembers }) {
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allClientMembers, setAllClientMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getRole(profile, clientMembers);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let projQuery = supabase.from("clients").select("*").eq("business", bizFilter);
      if (role === "manager") {
        const { data: mp } = await supabase.from("client_members").select("client_id").eq("profile_id", profile.id).ilike("project_role", "%manager%");
        const ids = (mp || []).map(r => r.client_id);
        if (ids.length) projQuery = projQuery.in("id", ids); else { setClients([]); setLoading(false); return; }
      }
      const [{ data: emps }, { data: projs }, { data: cm }, { data: t }] = await Promise.all([
        supabase.from("profiles").select("*").eq("business", bizFilter),
        projQuery,
        supabase.from("client_members").select("*, clients(name)"),
        supabase.from("tasks").select("*").eq("business", bizFilter),
      ]);
      setEmployees(emps || []);
      setClients(projs || []);
      setAllClientMembers(cm || []);
      setTasks(t || []);
      setLoading(false);
    }
    load();
  }, [bizFilter]);

  // Calculate live status and progress for each client from tasks
  function getClientStats(clientId) {
    const clientTasks = tasks.filter(t => t.client_id === clientId);
    if (clientTasks.length === 0) return { status: "on-track", progress: 0 };
    const done = clientTasks.filter(t => t.status === "done").length;
    const progress = Math.round((done / clientTasks.length) * 100);
    const today = new Date();
    let status = "on-track";
    if (done === clientTasks.length) {
      status = "completed";
    } else {
      for (const t of clientTasks) {
        if (t.status === "done") continue;
        if (!t.deadline) continue;
        const daysLeft = Math.ceil((new Date(t.deadline) - today) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) { status = "critical"; break; }
        if (daysLeft <= 3 && status !== "critical") status = "critical";
        else if (daysLeft <= 7 && status === "on-track") status = "at-risk";
      }
    }
    return { status, progress };
  }

  // Enrich clients with live stats
  const enrichedClients = clients.map(c => ({ ...c, ...getClientStats(c.id) }));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Team Members", value: employees.length, sub: `in ${bizFilter}`, color: bizColor, icon: "◈" },
          { label: "Active Clients", value: enrichedClients.filter(p => p.status !== "completed").length, sub: `${enrichedClients.filter(p => p.status === "completed").length} completed`, color: "#4ade80", icon: "◻" },
          { label: "Critical", value: enrichedClients.filter(p => p.status === "critical").length, sub: "need attention", color: "#ff6b6b", icon: "⚠" },
          { label: "On Track", value: enrichedClients.filter(p => p.status === "on-track").length, sub: "running smoothly", color: "#888", icon: "✦" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "14px", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "10px", color: "#666666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: s.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "1px" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#888888", marginTop: "4px" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#666666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "16px" }}>Team</div>
          {employees.length === 0 ? <Empty msg="No team members yet" /> : employees.map(emp => {
            const empAssignments = allClientMembers.filter(m => m.profile_id === emp.id);
            return (
              <div key={emp.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${bizColor}20`, color: bizColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>
                  {emp.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#111111" }}>{emp.full_name}</div>
                  <div style={{ fontSize: "10px", color: "#888888", marginBottom: "4px" }}>{emp.role}</div>
                  {empAssignments.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {empAssignments.map(a => {
                        const isManager = a.project_role?.toLowerCase().includes("manager");
                        return (
                          <span key={a.id} style={{
                            fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "8px",
                            background: isManager ? "#00C9CC15" : "#88888815",
                            color: isManager ? "#00C9CC" : "#888888",
                            border: `1px solid ${isManager ? "#00C9CC25" : "#88888825"}`,
                          }}>
                            {a.clients?.name} · {a.project_role}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#666666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "16px" }}>
            {role === "manager" ? "Your Clients" : "All Clients"}
          </div>
          {enrichedClients.length === 0 ? <Empty msg="No clients yet" /> : enrichedClients.map(p => {
            const barColor = p.status === "critical" ? "#ff6b6b" : p.status === "at-risk" ? "#00C9CC" : p.status === "completed" ? "#4ade80" : bizColor;
            const clientTasks = tasks.filter(t => t.client_id === p.id);
            const doneTasks = clientTasks.filter(t => t.status === "done").length;
            return (
              <div key={p.id} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#111111" }}>{p.name}</div>
                    <div style={{ fontSize: "10px", color: "#888888" }}>{doneTasks}/{clientTasks.length} tasks done</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Badge status={p.status} />
                    <span style={{ fontSize: "12px", color: barColor, fontWeight: 700 }}>{p.progress}%</span>
                  </div>
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
function TasksView({ bizFilter, profile, clientMembers }) {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [linkInputs, setLinkInputs] = useState({});
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "", client_id: "", deadline: "", status: "pending" });
  const role = getRole(profile, clientMembers);
  const canAdd = role === "owner" || role === "manager";

  async function load() {
    setLoading(true);
    let projIds = null;
    if (role === "manager") {
      const { data: mp } = await supabase.from("client_members").select("client_id").eq("profile_id", profile.id).ilike("project_role", "%manager%");
      projIds = (mp || []).map(r => r.client_id);
    }
    let taskQuery = supabase.from("tasks").select("*, profiles(full_name), clients(name)").eq("business", bizFilter);
    if (role === "employee") taskQuery = taskQuery.eq("assigned_to", profile.id);
    else if (role === "manager") {
      if (projIds && projIds.length) taskQuery = taskQuery.in("client_id", projIds);
      else { setTasks([]); setClients([]); setEmployees([]); setLoading(false); return; }
    }

    let projQuery = supabase.from("clients").select("id, name").eq("business", bizFilter);
    if (role === "manager" && projIds && projIds.length) projQuery = projQuery.in("id", projIds);

    const [{ data: t }, { data: p }, { data: e }] = await Promise.all([
      taskQuery,
      projQuery,
      supabase.from("profiles").select("id, full_name, is_owner").eq("business", bizFilter),
    ]);
    setTasks(t || []);
    setClients(p || []);
    setEmployees((e || []).filter(p => !p.is_owner));
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  function autoStatus(task) {
    if (task.status === "done" || task.status === "submitted") return task.status;
    if (!task.deadline) return task.status;
    const today = new Date();
    const deadline = new Date(task.deadline);
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return "overdue";
    if (daysLeft <= 3) return "critical";
    if (daysLeft <= 7) return "at-risk";
    return task.status === "in-progress" ? "in-progress" : "on-track";
  }

  async function addTask() {
    if (!form.title || !form.client_id) return;
    await supabase.from("tasks").insert([{ ...form, business: bizFilter }]);
    setShowAdd(false);
    setForm({ title: "", description: "", assigned_to: "", client_id: "", deadline: "", status: "pending" });
    load();
  }

  async function updateStatus(id, status) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    load();
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    load();
  }

  async function submitLink(id, link) {
    if (!link) return;
    const { error } = await supabase.from("tasks").update({ delivery_link: link, status: "submitted" }).eq("id", id);
    if (error) {
      alert("\u274c Could not save link: " + error.message);
      return;
    }
    load();
  }

  async function approveTask(id) {
    await supabase.from("tasks").update({ status: "done" }).eq("id", id);
    load();
  }

  async function rejectTask(id) {
    const reason = window.prompt("Reason for rejection (optional):");
    const { error } = await supabase.from("tasks").update({ status: "rejected", delivery_link: null, rejection_note: reason || "Rejected by manager" }).eq("id", id);
    if (error) { alert("❌ " + error.message); return; }
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
        <div style={{ background: "#ffffff", border: "1px solid #FFD60030", borderRadius: "14px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#FFD600", fontWeight: 700, marginBottom: "14px" }}>New Task</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <Input label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Task title" />
            <Input label="Deadline" value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} type="date" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <Select label="Assign To" value={form.assigned_to} onChange={v => setForm({ ...form, assigned_to: v })}
              options={[{ value: "", label: "Select employee" }, ...employees.map(e => ({ value: e.id, label: e.full_name }))]} />
            <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v })}
              options={[{ value: "", label: "Select client" }, ...clients.map(p => ({ value: p.id, label: p.name }))]} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <Input label="Description (optional)" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Brief description..." />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addTask} style={{ padding: "8px 18px", background: "#FFD600", border: "none", borderRadius: "8px", color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Save Task</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "8px", color: "#666666", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <Empty msg={canAdd ? "No tasks yet. Add your first task above!" : "No tasks assigned to you yet."} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tasks.map((task) => (
            <div key={task.id} style={{ background: "#ffffff", border: "1px solid #eeeeee", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: "11px", color: "#888888", marginTop: "3px" }}>{task.description}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <Badge status={autoStatus(task)} />
                  {canAdd && (
                    <button onClick={() => deleteTask(task.id)} style={{ padding: "4px 8px", background: "transparent", border: "1px solid #ff444430", borderRadius: "6px", color: "#ff6b6b", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#666666" }}>👤 {task.profiles?.full_name || "—"}</div>
                <div style={{ fontSize: "11px", color: "#666666" }}>📁 {task.clients?.name || "—"}</div>
                <div style={{ fontSize: "11px", color: "#666666" }}>📅 {task.deadline || "—"}</div>
              </div>

              {canAdd && !["submitted", "rejected", "done"].includes(task.status) && (
                <div style={{ marginBottom: "12px" }}>
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                    style={{ background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "6px 12px", color: "#444444", fontSize: "11px", cursor: "pointer", outline: "none", width: "100%" }}>
                    {["pending", "in-progress", "overdue"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                {/* If a delivery link exists — always show it regardless of status */}
                {task.delivery_link ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <a href={task.delivery_link} target="_blank" rel="noreferrer"
                      style={{ fontSize: "12px", color: task.status === "done" ? "#4ade80" : "#a855f7", fontWeight: 600, textDecoration: "none" }}>
                      {task.status === "done" ? "🔗 View Delivery" : "🔗 Review Delivery"}
                    </a>
                    {/* Approve/Reject — show to owner/manager if not yet done */}
                    {canAdd && task.status !== "done" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => approveTask(task.id)} style={{ flex: 1, padding: "8px", background: "#4ade8015", border: "1px solid #4ade8030", borderRadius: "8px", color: "#4ade80", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>✅ Approve</button>
                        <button onClick={() => rejectTask(task.id)} style={{ flex: 1, padding: "8px", background: "#ff444415", border: "1px solid #ff444430", borderRadius: "8px", color: "#ff6b6b", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>❌ Reject</button>
                      </div>
                    )}
                    {/* Assignee can resubmit if rejected */}
                    {task.status === "rejected" && task.assigned_to === profile.id && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ fontSize: "11px", color: "#ff6b6b" }}>❌ {task.rejection_note || "Rejected — please resubmit"}</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input value={linkInputs[task.id] || ""} onChange={e => setLinkInputs(p => ({ ...p, [task.id]: e.target.value }))}
                            placeholder="New link..." style={{ flex: 1, background: "#f8f8f8", border: "1px solid #ff444430", borderRadius: "8px", padding: "8px 12px", color: "#111111", fontSize: "12px", outline: "none" }} />
                          <button onClick={() => { submitLink(task.id, linkInputs[task.id]); setLinkInputs(p => ({ ...p, [task.id]: "" })); }}
                            style={{ padding: "8px 14px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "8px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>↩ Resubmit</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : task.status === "rejected" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "11px", color: "#ff6b6b", fontWeight: 600 }}>❌ Rejected: {task.rejection_note || "Please resubmit"}</div>
                    {task.assigned_to === profile.id && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input value={linkInputs[task.id] || ""} onChange={e => setLinkInputs(p => ({ ...p, [task.id]: e.target.value }))}
                          placeholder="New link..." style={{ flex: 1, background: "#f8f8f8", border: "1px solid #ff444430", borderRadius: "8px", padding: "8px 12px", color: "#111111", fontSize: "12px", outline: "none" }} />
                        <button onClick={() => { submitLink(task.id, linkInputs[task.id]); setLinkInputs(p => ({ ...p, [task.id]: "" })); }}
                          style={{ padding: "8px 14px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "8px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>↩ Resubmit</button>
                      </div>
                    )}
                  </div>
                ) : task.assigned_to === profile.id ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input value={linkInputs[task.id] || ""} onChange={e => setLinkInputs(p => ({ ...p, [task.id]: e.target.value }))}
                      placeholder="Drop delivery link here..." style={{ flex: 1, background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "8px 12px", color: "#111111", fontSize: "12px", outline: "none" }} />
                    <button onClick={() => { submitLink(task.id, linkInputs[task.id]); setLinkInputs(p => ({ ...p, [task.id]: "" })); }}
                      style={{ padding: "8px 14px", background: "#4ade8015", border: "1px solid #4ade8030", borderRadius: "8px", color: "#4ade80", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>✓ Submit</button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Clients View ────────────────────────────────────────
function ClientsView({ bizFilter, bizColor, profile, clientMembers }) {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getRole(profile, clientMembers);

  async function load() {
    setLoading(true);
    let query = supabase.from("clients").select("*").eq("business", bizFilter);
    if (role === "manager") {
      const { data: mp } = await supabase.from("client_members").select("client_id").eq("profile_id", profile.id).ilike("project_role", "%manager%");
      const ids = (mp || []).map(r => r.client_id);
      if (ids.length) query = query.in("id", ids); else { setClients([]); setLoading(false); return; }
    }
    const [{ data: c }, { data: t }] = await Promise.all([
      query,
      supabase.from("tasks").select("*").eq("business", bizFilter),
    ]);
    setClients(c || []);
    setTasks(t || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  function getClientStats(clientId) {
    const clientTasks = tasks.filter(t => t.client_id === clientId);
    if (clientTasks.length === 0) return { status: "on-track", progress: 0, done: 0, total: 0 };
    const done = clientTasks.filter(t => t.status === "done").length;
    const progress = Math.round((done / clientTasks.length) * 100);
    const today = new Date();
    let status = "on-track";
    if (done === clientTasks.length) {
      status = "completed";
    } else {
      for (const t of clientTasks) {
        if (t.status === "done") continue;
        if (!t.deadline) continue;
        const daysLeft = Math.ceil((new Date(t.deadline) - today) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) { status = "critical"; break; }
        if (daysLeft <= 3 && status !== "critical") status = "critical";
        else if (daysLeft <= 7 && status === "on-track") status = "at-risk";
      }
    }
    return { status, progress, done, total: clientTasks.length };
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {clients.length === 0 ? <Empty msg="No clients yet." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {clients.map(p => {
            const { status, progress, done, total } = getClientStats(p.id);
            const barColor = status === "critical" ? "#ff6b6b" : status === "at-risk" ? "#00C9CC" : status === "completed" ? "#4ade80" : bizColor;
            return (
              <div key={p.id} style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "14px", padding: "20px", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#888888"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ flex: 1, marginRight: "10px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "3px" }}>{p.name}</div>
                    <div style={{ fontSize: "10px", color: "#888888" }}>{done}/{total} tasks done</div>
                  </div>
                  <Badge status={status} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#666666" }}>Progress</span>
                  <span style={{ fontSize: "12px", color: barColor, fontWeight: 700 }}>{progress}%</span>
                </div>
                <ProgressBar value={progress} color={barColor} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Deliverables View ────────────────────────────────────
function DeliverablesView({ bizFilter, profile, clientMembers }) {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", client_id: "", profile_id: "", due_date: "" });
  const role = getRole(profile, clientMembers);
  const canAdd = role === "owner" || role === "manager";

  async function load() {
    setLoading(true);
    let query = supabase.from("deliverables").select("*, profiles(full_name), clients(name)").eq("business", bizFilter);
    let clientQuery = supabase.from("clients").select("id, name").eq("business", bizFilter);
    if (role === "manager") {
      const { data: mp } = await supabase.from("client_members").select("client_id").eq("profile_id", profile.id).ilike("project_role", "%manager%");
      const ids = (mp || []).map(r => r.client_id);
      if (ids.length) { query = query.in("client_id", ids); clientQuery = clientQuery.in("id", ids); }
      else { setItems([]); setLoading(false); return; }
    }
    const [{ data: d }, { data: c }, { data: e }] = await Promise.all([
      query,
      clientQuery,
      supabase.from("profiles").select("id, full_name").eq("business", bizFilter),
    ]);
    setItems(d || []);
    setClients(c || []);
    setEmployees(e || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  async function toggle(id, delivered) {
    await supabase.from("deliverables").update({ delivered: !delivered, delivered_at: !delivered ? new Date().toISOString() : null }).eq("id", id);
    load();
  }

  async function addDeliverable() {
    if (!form.name || !form.client_id) return;
    const { error } = await supabase.from("deliverables").insert([{
      name: form.name,
      client_id: parseInt(form.client_id),
      profile_id: form.profile_id || null,
      due_date: form.due_date || null,
      business: bizFilter,
      delivered: false,
    }]);
    if (error) { alert("❌ " + error.message); return; }
    setShowAdd(false);
    setForm({ name: "", client_id: "", profile_id: "", due_date: "" });
    load();
  }

  async function deleteDeliverable(id) {
    if (!window.confirm("Delete this deliverable?")) return;
    await supabase.from("deliverables").delete().eq("id", id);
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {canAdd && (
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "8px 18px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "10px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>+ Add Deliverable</button>
        </div>
      )}

      {showAdd && (
        <div style={{ background: "#ffffff", border: "1px solid #FFD60030", borderRadius: "14px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#FFD600", fontWeight: 700, marginBottom: "14px" }}>New Deliverable</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <Input label="Deliverable Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Final video edit" />
            <Input label="Due Date" value={form.due_date} onChange={v => setForm({ ...form, due_date: v })} type="date" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v })}
              options={[{ value: "", label: "Select client" }, ...clients.map(c => ({ value: c.id, label: c.name }))]} />
            <Select label="Assigned To" value={form.profile_id} onChange={v => setForm({ ...form, profile_id: v })}
              options={[{ value: "", label: "Select person (optional)" }, ...employees.map(e => ({ value: e.id, label: e.full_name }))]} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addDeliverable} style={{ padding: "8px 18px", background: "#FFD600", border: "none", borderRadius: "8px", color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "8px", color: "#666666", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? <Empty msg="No deliverables yet. Add your first one above!" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map(d => (
            <div key={d.id} style={{ background: "#ffffff", border: `1px solid ${d.delivered ? "#4ade8025" : "#e8e8e8"}`, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: d.delivered ? "#4ade8015" : "#ff6b6b15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                  {d.delivered ? "✓" : "⏳"}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{d.name}</div>
                  <div style={{ fontSize: "11px", color: "#888888", marginTop: "2px" }}>
                    {d.clients?.name || "—"} · {d.profiles?.full_name || "—"} · Due {d.due_date || "—"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: d.delivered ? "#4ade80" : "#ff6b6b", textTransform: "uppercase" }}>
                  {d.delivered ? "Delivered" : "Pending"}
                </span>
                <button onClick={() => toggle(d.id, d.delivered)} style={{ padding: "5px 12px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "7px", color: "#666666", fontSize: "11px", cursor: "pointer" }}>
                  {d.delivered ? "Mark Pending" : "Mark Delivered"}
                </button>
                {canAdd && (
                  <button onClick={() => deleteDeliverable(d.id)} style={{ padding: "5px 8px", background: "transparent", border: "1px solid #ff444430", borderRadius: "6px", color: "#ff6b6b", fontSize: "11px", cursor: "pointer" }}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
        <span style={{ fontSize: "12px", color: "#444444" }}>Claude AI monitors your team and surfaces issues here in real time</span>
      </div>
      {alerts.length === 0
        ? <div style={{ textAlign: "center", padding: "60px", color: "#999999", fontSize: "13px" }}>🎉 All clear — no pending follow-ups!</div>
        : alerts.map(f => (
          <div key={f.id} style={{ borderLeft: `3px solid ${f.alert_type === "critical" ? "#ff6b6b" : "#00C9CC"}`, background: "#ffffff", borderRadius: "0 12px 12px 0", padding: "16px 18px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: f.alert_type === "critical" ? "#ff6b6b" : "#00C9CC" }}>{f.profiles?.full_name || "Team Member"}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: f.alert_type === "critical" ? "#ff6b6b" : "#00C9CC", textTransform: "uppercase" }}>{f.alert_type}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#888888" }}>{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
            <p style={{ fontSize: "13px", color: "#444444", marginBottom: "12px", lineHeight: "1.6" }}>{f.message}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {f.sent_whatsapp
                ? <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>✓ WhatsApp sent</span>
                : <button onClick={() => markSent(f.id)} style={{ padding: "7px 16px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "8px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>📲 Mark as Sent</button>
              }
              <button onClick={() => dismiss(f.id)} style={{ padding: "7px 16px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "8px", color: "#666666", fontSize: "12px", cursor: "pointer" }}>Dismiss</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}


// ─── Admin View (Owner only) ──────────────────────────────
function AdminView({ bizFilter, bizColor }) {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [clientMembers, setClientMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Client form
  const [editClient, setEditClient] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientStatus, setClientStatus] = useState("on-track");
  const [clientDeadline, setClientDeadline] = useState("");

  // Employee form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newBiz, setNewBiz] = useState("digital");
  const [newPass, setNewPass] = useState("");

  // Assignment form
  const [assignClient, setAssignClient] = useState("");
  const [assignProfile, setAssignProfile] = useState("");
  const [assignRole, setAssignRole] = useState("");

  useEffect(() => { loadAll(); }, [bizFilter]);

  async function loadAll() {
    setLoading(true);
    const [{ data: c }, { data: t }, { data: cm }] = await Promise.all([
      supabase.from("clients").select("*").eq("business", bizFilter).order("name"),
      supabase.from("profiles").select("*").eq("business", bizFilter).order("full_name"),
      supabase.from("client_members").select("*, clients(name), profiles(full_name)"),
    ]);
    setClients(c || []);
    setTeam(t || []);
    setClientMembers(cm || []);
    setLoading(false);
  }

  function flash(m) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  // ── Clients ──
  async function saveClient() {
    if (!clientName) return;
    if (editClient) {
      await supabase.from("clients").update({ name: clientName, status: clientStatus, deadline: clientDeadline || "2026-12-31" }).eq("id", editClient);
      flash("✅ Client updated!");
    } else {
      await supabase.from("clients").insert({ name: clientName, business: bizFilter, status: clientStatus, deadline: clientDeadline || "2026-12-31" });
      flash("✅ Client added!");
    }
    setEditClient(null); setClientName(""); setClientStatus("on-track"); setClientDeadline("");
    loadAll();
  }

  async function deleteClient(id) {
    if (!window.confirm("Delete this client? All tasks and members will be removed.")) return;
    await supabase.from("clients").delete().eq("id", id);
    flash("🗑️ Client deleted"); loadAll();
  }

  function startEditClient(c) {
    setEditClient(c.id); setClientName(c.name); setClientStatus(c.status); setClientDeadline(c.deadline || "");
    setTab("clients");
  }

  // ── Team ──
  async function deleteEmployee(id) {
    if (!window.confirm("Remove this team member?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    flash("🗑️ Team member removed"); loadAll();
  }

  // ── Assignments ──
  async function assign() {
    if (!assignClient || !assignProfile || !assignRole) return;
    const { error } = await supabase.from("client_members").upsert({ client_id: parseInt(assignClient), profile_id: assignProfile, project_role: assignRole }, { onConflict: "client_id,profile_id" });
    if (error) flash("❌ " + error.message);
    else { flash("✅ Assigned!"); setAssignClient(""); setAssignProfile(""); setAssignRole(""); loadAll(); }
  }

  async function removeAssignment(id) {
    await supabase.from("client_members").delete().eq("id", id);
    flash("🗑️ Assignment removed"); loadAll();
  }

  const tabStyle = (t) => ({
    padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "12px", fontWeight: 600, transition: "all 0.15s",
    background: tab === t ? `${bizColor}20` : "transparent",
    color: tab === t ? bizColor : "#555555",
  });

  const inputStyle = { width: "100%", background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "8px 12px", color: "#111111", fontSize: "12px", outline: "none" };
  const labelStyle = { fontSize: "10px", color: "#444444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px", display: "block" };
  const btnStyle = { padding: "9px 20px", background: bizColor, color: "#000", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" };
  const dangerBtn = { padding: "5px 10px", background: "transparent", border: "1px solid #ff444430", borderRadius: "6px", color: "#ff6b6b", fontSize: "11px", cursor: "pointer" };
  const editBtn = { padding: "5px 10px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "6px", color: "#444444", fontSize: "11px", cursor: "pointer" };
  const cardStyle = { background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "16px 20px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" };

  return (
    <div style={{ maxWidth: "800px" }}>
      {msg && <div style={{ background: "#4ade8015", border: "1px solid #4ade8030", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: "#4ade80" }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "#ffffff", padding: "4px", borderRadius: "10px", border: "1px solid #eeeeee", marginBottom: "24px", width: "fit-content" }}>
        {["clients", "team", "assignments"].map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === "clients" ? "📁 Clients" : t === "team" ? "👥 Team" : "🔗 Assign"}
          </button>
        ))}
      </div>

      {/* ── CLIENTS TAB ── */}
      {tab === "clients" && (
        <div>
          <div style={{ background: "#ffffff", border: `1px solid ${bizColor}20`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: bizColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
              {editClient ? "✏️ Edit Client" : "➕ Add New Client"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>Client Name</label>
                <input style={inputStyle} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Nike Lebanon" />
              </div>
              <div>
                <label style={labelStyle}>Deadline</label>
                <input type="date" style={inputStyle} value={clientDeadline} onChange={e => setClientDeadline(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={clientStatus} onChange={e => setClientStatus(e.target.value)}>
                  <option value="on-track">On Track</option>
                  <option value="at-risk">At Risk</option>
                  <option value="critical">Critical</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={btnStyle} onClick={saveClient}>{editClient ? "Update Client" : "Add Client"}</button>
              {editClient && <button style={{ ...btnStyle, background: "transparent", border: "1px solid #e8e8e8", color: "#444444" }} onClick={() => { setEditClient(null); setClientName(""); }}>Cancel</button>}
            </div>
          </div>

          {loading ? <Spinner /> : clients.map(c => (
            <div key={c.id} style={cardStyle}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{c.name}</div>
                <div style={{ fontSize: "11px", color: "#666666", marginTop: "3px" }}>Deadline: {c.deadline} · Status: {c.status}</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={editBtn} onClick={() => startEditClient(c)}>✏️ Edit</button>
                <button style={dangerBtn} onClick={() => deleteClient(c.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TEAM TAB ── */}
      {tab === "team" && (
        <div>
          <div style={{ background: "#ffffff", border: `1px solid ${bizColor}20`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: bizColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>➕ Add Team Member</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sarah Khoury" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="sarah@eyedia.com" />
              </div>
              <div>
                <label style={labelStyle}>Job Title</label>
                <input style={inputStyle} value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g. Graphic Designer" />
              </div>
              <div>
                <label style={labelStyle}>Business</label>
                <select style={inputStyle} value={newBiz} onChange={e => setNewBiz(e.target.value)}>
                  <option value="digital">Eyedia Digital</option>
                  <option value="production">Eyedia Production</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="TempPass123!" />
              </div>
            </div>
            <button style={btnStyle} onClick={async () => {
              if (!newName || !newEmail || !newRole) return flash("❌ Please fill all fields");
              const pass = newPass || "TempPass123!";
              const res = await fetch("https://nbojegbpyzfhfeqoiebn.supabase.co/functions/v1/create-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ib2plZ2JweXpmaGZlcW9pZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTQ2NjQsImV4cCI6MjA4ODU3MDY2NH0.TtHMGuKqpSpE8sPaSLVhdXi5yKTJEaWsMx7cdqTGpek",
                  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ib2plZ2JweXpmaGZlcW9pZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTQ2NjQsImV4cCI6MjA4ODU3MDY2NH0.TtHMGuKqpSpE8sPaSLVhdXi5yKTJEaWsMx7cdqTGpek"
                },
                body: JSON.stringify({ email: newEmail, password: pass, full_name: newName, role: newRole, business: newBiz })
              });
              let data;
              try { data = await res.json(); } catch(e) { flash("❌ Response error: " + res.status + " " + res.statusText); return; }
              if (data.error) flash("❌ " + data.error);
              else if (!res.ok) flash("❌ HTTP " + res.status + ": " + JSON.stringify(data));
              else { flash("✅ " + newName + " added! Password: " + pass); setNewName(""); setNewEmail(""); setNewRole(""); setNewPass(""); loadAll(); }
            }}>Add Team Member</button>
          </div>
          {loading ? <Spinner /> : team.map(p => (
            <div key={p.id} style={cardStyle}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{p.full_name}</div>
                <div style={{ fontSize: "11px", color: "#666666", marginTop: "3px" }}>{p.role} · {p.business}</div>
                <div style={{ fontSize: "11px", color: "#999999", marginTop: "2px" }}>{clientMembers.filter(m => m.profile_id === p.id).map(m => m.clients?.name).join(", ") || "No clients assigned"}</div>
              </div>
              <button style={dangerBtn} onClick={() => deleteEmployee(p.id)}>🗑️ Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* ── ASSIGNMENTS TAB ── */}
      {tab === "assignments" && (
        <div>
          <div style={{ background: "#ffffff", border: `1px solid ${bizColor}20`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: bizColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>🔗 Assign Team Member to Client</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>Client</label>
                <select style={inputStyle} value={assignClient} onChange={e => setAssignClient(e.target.value)}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Team Member</label>
                <select style={inputStyle} value={assignProfile} onChange={e => setAssignProfile(e.target.value)}>
                  <option value="">Select person...</option>
                  {team.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Role on this Client</label>
                <input style={inputStyle} value={assignRole} onChange={e => setAssignRole(e.target.value)} placeholder="e.g. Account Manager" />
              </div>
            </div>
            <button style={btnStyle} onClick={assign}>Assign</button>
          </div>

          <div style={{ fontSize: "11px", color: "#555555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Current Assignments</div>
          {loading ? <Spinner /> : clientMembers.filter(m => clients.find(c => c.id === m.client_id)).map(m => (
            <div key={m.id} style={cardStyle}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{m.profiles?.full_name}</div>
                <div style={{ fontSize: "11px", color: "#666666", marginTop: "3px" }}>{m.clients?.name} · <span style={{ color: bizColor }}>{m.project_role}</span></div>
              </div>
              <button style={dangerBtn} onClick={() => removeAssignment(m.id)}>🗑️ Remove</button>
            </div>
          ))}
        </div>
      )}
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
  const [clientMembers, setClientMembers] = useState([]);

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
    const { data: members } = await supabase.from("client_members").select("*");
    if (members) setClientMembers(members);
  }

  const bizColor = activeBiz === "digital" ? "#FFD600" : "#00C9CC";
  const bizName = activeBiz === "digital" ? "Eyedia Digital" : "Eyedia Production";
  const role = getRole(profile, clientMembers);

  const navItems = [
    { id: "overview", label: "Overview", icon: "⬡" },
    { id: "tasks", label: role === "employee" ? "My Tasks" : "Tasks", icon: "◈" },
    { id: "clients", label: "Clients", icon: "◻" },
    { id: "deliverables", label: "Deliverables", icon: "◷" },
    ...(role === "owner" ? [{ id: "followups", label: "Follow-ups", icon: "⚡", alert: alertCount }] : []),
    ...(role === "owner" ? [{ id: "admin", label: "Admin", icon: "⚙" }] : []),
  ];

  if (!authChecked || (user && !profile)) return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666666", fontFamily: "sans-serif" }}>
      Loading...
    </div>
  );
  if (!user) return <AuthScreen onLogin={(u) => { setUser(u); loadProfile(u.id); }} />;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f5f5f5", minHeight: "100vh", color: "#111111" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #cccccc; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.25s ease forwards; }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .desktop-topbar-right { display: none !important; }
          .main-content { padding: 16px !important; padding-bottom: 80px !important; }
          .biz-toggle button { padding: 6px 10px !important; font-size: 11px !important; }
        }
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-top-right { display: none !important; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ borderBottom: "1px solid #e8e8e8", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "54px", position: "sticky", top: 0, background: "#f5f5f5", zIndex: 100 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <img src="/logo.jpg" alt="Eyedia" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "2px", color: "#111111", lineHeight: 1 }}>WE ARE EYEDIA</div>
            <div style={{ fontSize: "8px", color: "#666666", letterSpacing: "1px", textTransform: "uppercase" }}>Workflow OS</div>
          </div>
        </div>

        {/* Business Toggle */}
        {(role === "owner" || profile?.business === "both") && (
          <div className="biz-toggle" style={{ display: "flex", gap: "3px", background: "#ffffff", padding: "3px", borderRadius: "9px", border: "1px solid #eeeeee" }}>
            {[{ id: "digital", label: "Digital", color: "#FFD600" }, { id: "production", label: "Production", color: "#00C9CC" }].map(b => (
              <button key={b.id} onClick={() => { setActiveBiz(b.id); setActiveView("overview"); }} style={{
                padding: "5px 12px", borderRadius: "6px", border: "1px solid transparent", cursor: "pointer",
                fontSize: "11px", fontWeight: 600, transition: "all 0.2s",
                background: activeBiz === b.id ? `${b.color}20` : "transparent",
                color: activeBiz === b.id ? b.color : "#555555",
                borderColor: activeBiz === b.id ? `${b.color}30` : "transparent",
              }}>{b.label}</button>
            ))}
          </div>
        )}

        {/* Desktop right */}
        <div className="desktop-topbar-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "6px", height: "6px", background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "10px", color: "#666666" }}>Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#666666", background: "#ffffff", padding: "4px 10px", borderRadius: "8px", border: "1px solid #eeeeee" }}>
            {profile?.full_name || user.email}
            {profile && <RolePill profile={profile} clientMembers={clientMembers} />}
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "7px", color: "#666666", fontSize: "10px", cursor: "pointer" }}>Sign out</button>
        </div>

        {/* Mobile right */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="mobile-top-right">
          <div style={{ width: "6px", height: "6px", background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #e8e8e8", borderRadius: "7px", color: "#555555", fontSize: "10px", cursor: "pointer" }}>Out</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", height: "calc(100vh - 54px)" }}>

        {/* Desktop Sidebar */}
        <div className="desktop-sidebar" style={{ width: "190px", borderRight: "1px solid #e8e8e8", padding: "16px 10px", flexShrink: 0, display: "flex", flexDirection: "column", background: "#ffffff" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: activeView === item.id ? `${bizColor}12` : "transparent",
              color: activeView === item.id ? bizColor : "#666666",
              fontSize: "12px", fontWeight: activeView === item.id ? 700 : 500,
              marginBottom: "2px", transition: "all 0.15s", textAlign: "left",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>{item.icon}</span>{item.label}</span>
              {item.alert > 0 && <span style={{ background: "#ff6b6b", color: "white", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "10px" }}>{item.alert}</span>}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div style={{ height: "1px", background: "#e8e8e8", marginBottom: "12px" }} />
            <div style={{ padding: "10px", background: `${bizColor}08`, border: `1px solid ${bizColor}15`, borderRadius: "9px" }}>
              <div style={{ fontSize: "9px", color: bizColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Active</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#111111" }}>{bizName}</div>
              <div style={{ fontSize: "10px", color: "#888888", marginTop: "2px" }}>{role === "owner" ? "Owner" : role === "manager" ? "Manager" : profile?.role}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content" style={{ flex: 1, overflow: "auto", padding: "20px" }} key={activeBiz + activeView}>
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <div style={{ width: "3px", height: "16px", background: bizColor, borderRadius: "2px" }} />
                  <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "2px", color: "#111111" }}>
                    {navItems.find(n => n.id === activeView)?.label.toUpperCase()}
                  </h1>
                </div>
                <p style={{ fontSize: "10px", color: "#666666", paddingLeft: "11px" }}>{bizName}</p>
              </div>
            </div>
            {activeView === "overview" && <OverviewView bizFilter={activeBiz} bizColor={bizColor} profile={profile} clientMembers={clientMembers} />}
            {activeView === "tasks" && <TasksView bizFilter={activeBiz} profile={profile} clientMembers={clientMembers} />}
            {activeView === "clients" && <ClientsView bizFilter={activeBiz} bizColor={bizColor} profile={profile} clientMembers={clientMembers} />}
            {activeView === "deliverables" && <DeliverablesView bizFilter={activeBiz} profile={profile} clientMembers={clientMembers} />}
            {activeView === "followups" && <FollowUpsView bizFilter={activeBiz} />}
            {activeView === "admin" && <AdminView bizFilter={activeBiz} bizColor={bizColor} />}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "64px",
        background: "#ffffff", borderTop: "1px solid #e8e8e8",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "3px", border: "none", background: "transparent", cursor: "pointer",
            padding: "8px 4px", position: "relative",
          }}>
            {item.alert > 0 && (
              <span style={{ position: "absolute", top: "4px", right: "calc(50% - 14px)", background: "#ff6b6b", color: "white", fontSize: "8px", fontWeight: 800, padding: "1px 5px", borderRadius: "8px", minWidth: "14px", textAlign: "center" }}>{item.alert}</span>
            )}
            <span style={{ fontSize: "18px", lineHeight: 1, filter: activeView === item.id ? "none" : "grayscale(1) opacity(0.35)" }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: "9px", fontWeight: activeView === item.id ? 700 : 400,
              color: activeView === item.id ? bizColor : "#555555",
              letterSpacing: "0.3px", textTransform: "uppercase",
            }}>{item.label}</span>
            {activeView === item.id && (
              <div style={{ position: "absolute", bottom: 0, width: "24px", height: "2px", background: bizColor, borderRadius: "2px 2px 0 0" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
