import { useState, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  owner:    { color: "#FFD600", label: "OWNER" },
  manager:  { color: "#00C9CC", label: "MANAGER" },
  employee: { color: "#888",    label: "EMPLOYEE" },
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

function RolePill({ profile, clientMembers }) {
  const role = getRole(profile, clientMembers || []);
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
function OverviewView({ bizFilter, bizColor, profile, clientMembers }) {
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getRole(profile, clientMembers);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let projQuery = supabase.from("clients").select("*").eq("business", bizFilter);
      if (role === "manager") {
        const { data: mp } = await supabase.from("client_members").select("client_id").eq("manager_id", profile.id);
        const ids = (mp || []).map(r => r.client_id);
        if (ids.length) projQuery = projQuery.in("id", ids); else { setClients([]); setLoading(false); return; }
      }
      const [{ data: emps }, { data: projs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("business", bizFilter),
        projQuery,
      ]);
      setEmployees(emps || []);
      setClients(projs || []);
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
          { label: "Active Clients", value: clients.length, sub: `${clients.filter(p => p.status === "completed").length} completed`, color: "#4ade80", icon: "◻" },
          { label: "Critical", value: clients.filter(p => p.status === "critical").length, sub: "need attention", color: "#ff6b6b", icon: "⚠" },
          { label: "On Track", value: clients.filter(p => p.status === "on-track").length, sub: "running smoothly", color: "#888", icon: "✦" },
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
            {role === "manager" ? "Your Clients" : "All Clients"}
          </div>
          {clients.length === 0 ? <Empty msg="No clients yet" /> : clients.map(p => {
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
function TasksView({ bizFilter, profile, clientMembers }) {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "", client_id: "", deadline: "", status: "pending" });
  const role = getRole(profile, clientMembers);
  const canAdd = role === "owner" || role === "manager";

  async function load() {
    setLoading(true);
    let projIds = null;
    if (role === "manager") {
      const { data: mp } = await supabase.from("client_members").select("client_id").eq("manager_id", profile.id);
      projIds = (mp || []).map(r => r.client_id);
    }
    let taskQuery = supabase.from("tasks").select("*, profiles(full_name), clients(name)").eq("business", bizFilter);
    if (role === "employee") taskQuery = taskQuery.eq("assigned_to", profile.id);
    else if (role === "manager" && projIds?.length) taskQuery = taskQuery.in("client_id", projIds);

    let projQuery = supabase.from("clients").select("id, name").eq("business", bizFilter);
    if (role === "manager" && projIds?.length) projQuery = projQuery.in("id", projIds);

    const [{ data: t }, { data: p }, { data: e }] = await Promise.all([
      taskQuery,
      projQuery,
      supabase.from("profiles").select("id, full_name").eq("business", bizFilter),
    ]);
    setTasks(t || []);
    setClients(p || []);
    setEmployees(e || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

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
            <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v })}
              options={[{ value: "", label: "Select client" }, ...clients.map(p => ({ value: p.id, label: p.name }))]} />
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
                {["Task", "Assigned To", "Client", "Deadline", "Status", "Update"].map(h => (
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
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#555" }}>{task.clients?.name || "—"}</td>
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

// ─── Clients View ────────────────────────────────────────
function ClientsView({ bizFilter, bizColor, profile, clientMembers }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", deadline: "", progress: 0, status: "on-track" });
  const role = getRole(profile, clientMembers);
  const canAdd = role === "owner" || role === "manager";

  async function load() {
    setLoading(true);
    let query = supabase.from("clients").select("*").eq("business", bizFilter);
    if (role === "manager") {
      const { data: mp } = await supabase.from("client_members").select("client_id").eq("manager_id", profile.id);
      const ids = (mp || []).map(r => r.client_id);
      if (ids.length) query = query.in("id", ids); else { setClients([]); setLoading(false); return; }
    }
    const { data } = await query;
    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [bizFilter]);

  async function addClient() {
    if (!form.name || !form.client) return;
    const { data } = await supabase.from("clients").insert([{ ...form, business: bizFilter }]).select().single();
    if (data && role === "manager") {
      await supabase.from("client_members").insert([{ manager_id: profile.id, client_id: data.id }]);
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
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "8px 18px", background: "#FFD60015", border: "1px solid #FFD60030", borderRadius: "10px", color: "#FFD600", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>+ Add Client</button>
        </div>
      )}
      {showAdd && (
        <div style={{ background: "#111", border: "1px solid #FFD60030", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#FFD600", fontWeight: 700, marginBottom: "14px" }}>New Client</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <Input label="Client Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Input label="Client" value={form.client} onChange={v => setForm({ ...form, client: v })} />
            <Input label="Deadline" value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} type="date" />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addClient} style={{ padding: "8px 18px", background: "#FFD600", border: "none", borderRadius: "8px", color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "8px", color: "#333", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      {clients.length === 0 ? <Empty msg="No clients yet." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {clients.map(p => {
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
function DeliverablesView({ bizFilter, profile, clientMembers }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getRole(profile, clientMembers);

  async function load() {
    setLoading(true);
    let query = supabase.from("deliverables").select("*, profiles(full_name)").eq("business", bizFilter);
    if (role === "manager") {
      const { data: mp } = await supabase.from("client_members").select("client_id").eq("manager_id", profile.id);
      const ids = (mp || []).map(r => r.client_id);
      if (ids.length) query = query.in("client_id", ids); else { setItems([]); setLoading(false); return; }
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
    // Load client memberships
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
  ];

  if (!authChecked) return <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontFamily: "sans-serif" }}>Loading...</div>;
  if (!user) return <AuthScreen onLogin={(u) => { setUser(u); loadProfile(u.id); }} />;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const navIcons = {
    overview:     "⬡",
    tasks:        "◈",
    clients:     "◻",
    deliverables: "◷",
    followups:    "⚡",
  };

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
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .desktop-topbar-right { display: none !important; }
          .main-content { padding: 16px !important; padding-bottom: 80px !important; }
          .biz-toggle button { padding: 6px 10px !important; font-size: 11px !important; }
        }
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-top-biz { display: none !important; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ borderBottom: "1px solid #111", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "54px", position: "sticky", top: 0, background: "#080808", zIndex: 100 }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <img src="/logo.jpg" alt="Eyedia" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "2px", color: "#fff", lineHeight: 1 }}>WE ARE EYEDIA</div>
            <div style={{ fontSize: "8px", color: "#333", letterSpacing: "1px", textTransform: "uppercase" }}>Workflow OS</div>
          </div>
        </div>

        {/* Business Toggle — shown in top bar always */}
        {(role === "owner" || profile?.business === "both") && (
          <div className="biz-toggle" style={{ display: "flex", gap: "3px", background: "#0d0d0d", padding: "3px", borderRadius: "9px", border: "1px solid #111" }}>
            {[{ id: "digital", label: "Digital", color: "#FFD600" }, { id: "production", label: "Production", color: "#00C9CC" }].map(b => (
              <button key={b.id} onClick={() => { setActiveBiz(b.id); setActiveView("overview"); }} style={{
                padding: "5px 12px", borderRadius: "6px", border: "1px solid transparent", cursor: "pointer",
                fontSize: "11px", fontWeight: 600, transition: "all 0.2s",
                background: activeBiz === b.id ? `${b.color}20` : "transparent",
                color: activeBiz === b.id ? b.color : "#444",
                borderColor: activeBiz === b.id ? `${b.color}30` : "transparent",
              }}>{b.label}</button>
            ))}
          </div>
        )}

        {/* Desktop right — user info + signout */}
        <div className="desktop-topbar-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "6px", height: "6px", background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "10px", color: "#333" }}>Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#333", background: "#0d0d0d", padding: "4px 10px", borderRadius: "8px", border: "1px solid #111" }}>
            {profile?.full_name || user.email}
            {profile && <RolePill profile={profile} clientMembers={clientMembers} />}
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "7px", color: "#333", fontSize: "10px", cursor: "pointer" }}>Sign out</button>
        </div>

        {/* Mobile right — just live dot + sign out */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="mobile-top-right">
          <div style={{ width: "6px", height: "6px", background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <button onClick={() => supabase.auth.signOut()} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: "7px", color: "#444", fontSize: "10px", cursor: "pointer" }}>Out</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", height: "calc(100vh - 54px)" }}>

        {/* Desktop Sidebar */}
        <div className="desktop-sidebar" style={{ width: "190px", borderRight: "1px solid #111", padding: "16px 10px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: activeView === item.id ? `${bizColor}12` : "transparent",
              color: activeView === item.id ? bizColor : "#333",
              fontSize: "12px", fontWeight: activeView === item.id ? 700 : 500,
              marginBottom: "2px", transition: "all 0.15s", textAlign: "left",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>{item.icon}</span>{item.label}</span>
              {item.alert > 0 && <span style={{ background: "#ff6b6b", color: "white", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "10px" }}>{item.alert}</span>}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div style={{ height: "1px", background: "#111", marginBottom: "12px" }} />
            <div style={{ padding: "10px", background: `${bizColor}08`, border: `1px solid ${bizColor}15`, borderRadius: "9px" }}>
              <div style={{ fontSize: "9px", color: bizColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Active</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ccc" }}>{bizName}</div>
              <div style={{ fontSize: "10px", color: "#2a2a2a", marginTop: "2px" }}>{role === "owner" ? "Owner" : role === "manager" ? "Manager" : profile?.role}</div>
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
                  <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "2px", color: "#fff" }}>
                    {navItems.find(n => n.id === activeView)?.label.toUpperCase()}
                  </h1>
                </div>
                <p style={{ fontSize: "10px", color: "#333", paddingLeft: "11px" }}>{bizName}</p>
              </div>
            </div>
            {activeView === "overview" && <OverviewView bizFilter={activeBiz} bizColor={bizColor} profile={profile} clientMembers={clientMembers} />}
            {activeView === "tasks" && <TasksView bizFilter={activeBiz} profile={profile} clientMembers={clientMembers} />}
            {activeView === "clients" && <ClientsView bizFilter={activeBiz} bizColor={bizColor} profile={profile} clientMembers={clientMembers} />}
            {activeView === "deliverables" && <DeliverablesView bizFilter={activeBiz} profile={profile} clientMembers={clientMembers} />}
            {activeView === "followups" && <FollowUpsView bizFilter={activeBiz} profile={profile} clientMembers={clientMembers} />}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "64px",
        background: "#0a0a0a", borderTop: "1px solid #161616",
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
              color: activeView === item.id ? bizColor : "#444",
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
