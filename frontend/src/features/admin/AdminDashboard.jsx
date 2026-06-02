import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put, del } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { appointmentStatusColor, severityColor } from "../../utils/statusColors";
import { Badge, Btn, Card } from "../../components/ui";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [adminTab, setAdminTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [messages, setMessages] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [reply, setReply] = useState({ userId: null, msg: "" });

  useEffect(() => {
    get("/admin/stats").then((r) => !r.error && setStats(r));
    if (adminTab === "users") get("/admin/users").then((r) => Array.isArray(r) && setUsers(r));
    if (adminTab === "appointments") get("/admin/appointments").then((r) => Array.isArray(r) && setAppointments(r));
    if (adminTab === "feedback") get("/admin/feedback").then((r) => Array.isArray(r) && setFeedback(r));
    if (adminTab === "messages") get("/admin/messages").then((r) => Array.isArray(r) && setMessages(r));
    if (adminTab === "drugs") get("/admin/drugs").then((r) => Array.isArray(r) && setDrugs(r));
    if (adminTab === "diseases") get("/admin/diseases").then((r) => Array.isArray(r) && setDiseases(r));
  }, [adminTab]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await del(`/admin/users/${id}`);
    setUsers((u) => u.filter((x) => x.id !== id));
  };

  const updateAppt = async (id, status) => {
    const note = noteDrafts[id] || "";
    await put(`/admin/appointments/${id}`, { status, note });
    setAppointments((a) => a.map((x) =>
      x.id === id ? { ...x, status, admin_note: note } : x
    ));
    setNoteDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  const sendReply = async () => {
    if (!reply.msg.trim()) return;
    await post("/admin/messages/reply", { user_id: reply.userId, message: reply.msg });
    setReply({ userId: null, msg: "" });
    get("/admin/messages").then((r) => Array.isArray(r) && setMessages(r));
  };

  const statCards = [
    { label: "Total Users", value: stats.total_users || 0, icon: "👥", color: "bg-blue-50 text-blue-700" },
    { label: "Predictions", value: stats.total_predictions || 0, icon: "🔬", color: "bg-purple-50 text-purple-700" },
    { label: "Appointments", value: stats.total_appointments || 0, icon: "📅", color: "bg-green-50 text-green-700" },
    { label: "Pending", value: stats.pending_appointments || 0, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
    { label: "Feedback", value: stats.total_feedback || 0, icon: "⭐", color: "bg-pink-50 text-pink-700" },
  ];
  const tabs = ["dashboard", "users", "appointments", "messages", "feedback", "drugs", "diseases"];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Welcome, {user?.name}</p>
        </div>
        <Btn onClick={handleLogout} cls="bg-red-50 text-red-600 hover:bg-red-100 text-xs">
          Logout
        </Btn>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Btn
            key={t}
            onClick={() => setAdminTab(t)}
            cls={`capitalize text-xs ${adminTab === t ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t}
          </Btn>
        ))}
      </div>

      {adminTab === "dashboard" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((s, i) => (
            <Card key={i} cls={`${s.color} border-0 text-center`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-medium opacity-80">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {adminTab === "users" && (
        <Card>
          <h3 className="font-semibold mb-3">User Management ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  {["Name", "Email", "Age", "Gender", "Role", "Joined", ""].map((h) => (
                    <th key={h} className="py-2 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{u.name}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-2 pr-4">{u.age}</td>
                    <td className="py-2 pr-4">{u.gender}</td>
                    <td className="py-2 pr-4">
                      <Badge text={u.role} color={u.role === "admin" ? "red" : "green"} />
                    </td>
                    <td className="py-2 pr-4 text-gray-400">{u.created_at?.split("T")[0]}</td>
                    <td className="py-2">
                      <Btn
                        onClick={() => deleteUser(u.id)}
                        cls="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                      >
                        Delete
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {adminTab === "appointments" && (
        <Card>
          <h3 className="font-semibold mb-3">Appointments</h3>
          <div className="space-y-3">
            {appointments.map((a, i) => (
              <div key={i} className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      {a.user_name} — {a.disease}
                    </div>
                    <div className="text-xs text-gray-500">
                      {a.preferred_date} | Age: {a.age} | {a.gender}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{a.notes}</div>
                  </div>
                  <Badge text={a.status} color={appointmentStatusColor(a.status)} />
                </div>
                {a.status === "Pending" && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                      <textarea
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        rows={3}
                        value={noteDrafts[a.id] || ""}
                        onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))}
                        placeholder="Add a response for the user..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Btn
                        onClick={() => updateAppt(a.id, "Approved")}
                        cls="bg-green-600 text-white hover:bg-green-700 text-xs"
                      >
                        Approve
                      </Btn>
                      <Btn
                        onClick={() => updateAppt(a.id, "Rejected")}
                        cls="bg-red-50 text-red-600 hover:bg-red-100 text-xs"
                      >
                        Reject
                      </Btn>
                    </div>
                  </div>
                )}
                {a.admin_note && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
                    <span className="font-semibold">Admin response:</span> {a.admin_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )} 

       {adminTab === "messages" && (
        <Card>
          <h3 className="font-semibold mb-3">Messages</h3>
          {messages.map((m, i) => (
            <div key={i} className="border-b py-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{m.user_name}</span>
                <Badge text={m.sender} color={m.sender === "doctor" ? "blue" : "green"} />
              </div>
              <p className="text-gray-700 text-sm">{m.message}</p>
              {m.sender === "user" && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 border rounded px-2 py-1 text-xs"
                    placeholder="Reply..."
                    value={reply.userId === m.user_id ? reply.msg : ""}
                    onChange={(e) => setReply({ userId: m.user_id, msg: e.target.value })}
                  />
                  <Btn onClick={sendReply} cls="bg-green-600 text-white text-xs">
                    Send
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {adminTab === "feedback" && (
        <Card>
          <h3 className="font-semibold mb-3">Feedback</h3>
          {feedback.map((f, i) => (
            <div key={i} className="border-b py-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{f.user_name}</span>
                <Badge text={f.type} />
              </div>
              <p className="text-gray-700 text-sm mt-1">{f.message}</p>
              <div className="text-yellow-400 text-xs mt-1">{"★".repeat(f.rating || 0)}</div>
            </div>
          ))}
        </Card>
      )}

      {adminTab === "drugs" && (
        <Card>
          <h3 className="font-semibold mb-3">Drug Database ({drugs.length} records)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  {["Disease", "Drug", "Dosage", "Severity", "Precautions"].map((h) => (
                    <th key={h} className="py-2 pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drugs.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-3 font-medium">{d.disease}</td>
                    <td className="py-2 pr-3 text-green-700">{d.drug}</td>
                    <td className="py-2 pr-3 text-gray-600">{d.dosage}</td>
                    <td className="py-2 pr-3">
                      <Badge text={d.severity} color={severityColor(d.severity)} />
                    </td>
                    <td className="py-2 pr-3 text-gray-500">{d.precautions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {adminTab === "diseases" && (
        <Card>
          <h3 className="font-semibold mb-3">Disease Dataset ({diseases.length} records)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  {["Disease", "Symptom 1", "Symptom 2", "Symptom 3"].map((h) => (
                    <th key={h} className="py-2 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diseases.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{d.disease}</td>
                    <td className="py-2 pr-4 text-gray-600">{d.symptom1?.replace(/_/g, " ")}</td>
                    <td className="py-2 pr-4 text-gray-600">{d.symptom2?.replace(/_/g, " ")}</td>
                    <td className="py-2 pr-4 text-gray-600">{d.symptom3?.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
