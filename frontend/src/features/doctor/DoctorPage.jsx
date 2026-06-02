import { useState, useEffect } from "react";
import { get, post } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { GENDERS } from "../../utils/constants";
import { appointmentStatusColor } from "../../utils/statusColors";
import { Alert, Badge, Btn, Card, Input, Select } from "../../components/ui";

export default function DoctorPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("book");
  const [form, setForm] = useState({
    name: user?.name || "",
    age: "",
    gender: "Male",
    disease: "",
    preferred_date: "",
    notes: "",
  });
  const [msgForm, setMsgForm] = useState({ message: "", appointment_id: "" });
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    get("/appointments").then((r) => Array.isArray(r) && setAppointments(r));
    get("/appointments/messages").then((r) => Array.isArray(r) && setMessages(r));
  }, []);

  const book = async () => {
    if (!form.name || !form.disease || !form.preferred_date) {
      setErr("Fill all required fields");
      return;
    }
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await post("/appointments", form);
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      setMsg("Appointment request sent");
      get("/appointments").then((r) => Array.isArray(r) && setAppointments(r));
    }
  };

  const sendMsg = async () => {
    if (!msgForm.message.trim()) {
      setErr("Enter a message");
      return;
    }
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await post("/appointments/message", msgForm);
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      setMsg("Message sent!");
      setMsgForm({ message: "", appointment_id: "" });
      get("/appointments/messages").then((r) => Array.isArray(r) && setMessages(r));
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Ayurvedic Doctor Consultation</h2>
        <p className="text-gray-500 text-sm mt-1">Book appointments and communicate with doctors</p>
      </div>
      <div className="flex gap-2">
        {["book", "appointments", "message"].map((t) => (
          <Btn
            key={t}
            onClick={() => setTab(t)}
            cls={`capitalize ${tab === t ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t}
          </Btn>
        ))}
      </div>
      {tab === "book" && (
        <Card>
          <Alert msg={msg} />
          <Alert msg={err} type="error" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input
                label="Age *"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <Select
                label="Gender"
                options={GENDERS}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
              <Input
                label="Disease/Condition *"
                value={form.disease}
                onChange={(e) => setForm({ ...form, disease: e.target.value })}
              />
            </div>
            <Input
              label="Preferred Date *"
              type="date"
              value={form.preferred_date}
              onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional information..."
              />
            </div>
            <Btn onClick={book} disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700">
              {loading ? "Booking..." : "Book Appointment"}
            </Btn>
          </div>
        </Card>
      )}
      {tab === "appointments" && (
        <Card>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No appointments yet</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((a, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="font-medium">{a.disease}</div>
                      <div className="text-xs text-gray-500">{a.preferred_date}</div>
                    </div>
                    <Badge text={a.status} color={appointmentStatusColor(a.status)} />
                  </div>
                  <div className="text-sm text-gray-600">{a.notes}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {tab === "message" && (
        <Card>
          <Alert msg={msg} />
          <Alert msg={err} type="error" />
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Message history</h3>
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">No conversation yet.</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl ${m.sender === "doctor" ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-900"}`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {m.sender === "doctor" ? "Doctor" : "You"}
                        {m.appointment_id ? ` · Appointment #${m.appointment_id}` : ""}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{m.created_at?.split("T")[0]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Select
                label="Related Appointment (optional)"
                options={appointments.map((a) => a.id?.toString())}
                value={msgForm.appointment_id}
                onChange={(e) => setMsgForm({ ...msgForm, appointment_id: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message to Doctor</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  rows={4}
                  value={msgForm.message}
                  onChange={(e) => setMsgForm({ ...msgForm, message: e.target.value })}
                  placeholder="Describe your concern..."
                />
              </div>
              <Btn onClick={sendMsg} disabled={loading} cls="w-full bg-blue-600 text-white hover:bg-blue-700">
                {loading ? "Sending..." : "Send Message"}
              </Btn>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
