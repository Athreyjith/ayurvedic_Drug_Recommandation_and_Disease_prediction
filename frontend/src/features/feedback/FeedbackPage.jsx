import { useState } from "react";
import { post } from "../../api";
import { FEEDBACK_TYPES } from "../../utils/constants";
import { Alert, Btn, Card, Select } from "../../components/ui";

export default function FeedbackPage() {
  const [form, setForm] = useState({ type: "General", message: "", rating: 5 });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.message.trim()) {
      setErr("Please enter your feedback");
      return;
    }
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await post("/feedback", form);
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      setMsg("Thank you for your feedback!");
      setForm({ type: "General", message: "", rating: 5 });
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Feedback</h2>
        <p className="text-gray-500 text-sm mt-1">Share your experience, report issues, or suggest improvements</p>
      </div>
      <Card>
        <Alert msg={msg} />
        <Alert msg={err} type="error" />
        <div className="space-y-4">
          <Select
            label="Feedback Type"
            options={FEEDBACK_TYPES}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, rating: r })}
                  className={`text-2xl ${r <= form.rating ? "text-yellow-400" : "text-gray-200"} hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback *</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Share your thoughts..."
            />
          </div>
          <Btn onClick={submit} disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700">
            {loading ? "Submitting..." : "Submit Feedback"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
