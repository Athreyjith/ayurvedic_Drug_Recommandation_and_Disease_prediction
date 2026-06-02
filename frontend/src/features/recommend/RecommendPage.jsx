import { useState } from "react";
import { post } from "../../api";
import { useSymptoms } from "../../hooks/useSymptoms";
import { rankBadgeColor, rankBarColor } from "../../utils/statusColors";
import { Alert, Btn, Card, Select } from "../../components/ui";

export default function RecommendPage() {
  const symptoms = useSymptoms();
  const [form, setForm] = useState({ symptom1: "", symptom2: "", symptom3: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const recommend = async () => {
    if (!form.symptom1 || !form.symptom2 || !form.symptom3) {
      setErr("Select all 3 symptoms");
      return;
    }
    setLoading(true);
    setErr("");
    setResult(null);
    const res = await post("/recommend/disease", form);
    setLoading(false);
    if (res.error) setErr(res.error);
    else setResult(res);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Disease Recommendation</h2>
        <p className="text-gray-500 text-sm mt-1">Get top 3 probable diseases based on symptoms</p>
      </div>
      <Card>
        <Alert msg={err} type="error" />
        <div className="space-y-4">
          <Select
            label="Symptom 1"
            options={symptoms}
            value={form.symptom1}
            onChange={(e) => setForm({ ...form, symptom1: e.target.value })}
          />
          <Select
            label="Symptom 2"
            options={symptoms.filter((s) => s !== form.symptom1)}
            value={form.symptom2}
            onChange={(e) => setForm({ ...form, symptom2: e.target.value })}
          />
          <Select
            label="Symptom 3"
            options={symptoms.filter((s) => s !== form.symptom1 && s !== form.symptom2)}
            value={form.symptom3}
            onChange={(e) => setForm({ ...form, symptom3: e.target.value })}
          />
          <Btn onClick={recommend} disabled={loading} cls="w-full bg-purple-600 text-white hover:bg-purple-700">
            {loading ? "Analyzing..." : "📋 Get Disease Recommendations"}
          </Btn>
        </div>
      </Card>
      {result && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Top 3 Probable Diseases</h3>
          {result.recommendations?.map((r, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${rankBadgeColor(i)}`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800">{r.disease}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{r.confidence}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full">
                <div
                  className={`h-3 rounded-full ${rankBarColor(i)}`}
                  style={{ width: `${Math.max(r.confidence, 5)}%` }}
                />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
