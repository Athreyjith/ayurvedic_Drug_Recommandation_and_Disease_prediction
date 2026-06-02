import { useState } from "react";
import { post } from "../../api";
import { useSymptoms } from "../../hooks/useSymptoms";
import { Alert, Btn, Card, Select } from "../../components/ui";

export default function PredictPage() {
  const symptoms = useSymptoms();
  const [form, setForm] = useState({ symptom1: "", symptom2: "", symptom3: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const predict = async () => {
    if (!form.symptom1 || !form.symptom2 || !form.symptom3) {
      setErr("Please select all 3 symptoms");
      return;
    }
    setLoading(true);
    setErr("");
    setResult(null);
    const res = await post("/predict/disease", form);
    setLoading(false);
    if (res.error) setErr(res.error);
    else setResult(res);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Disease Prediction</h2>
        <p className="text-gray-500 text-sm mt-1">Select 3 symptoms to predict possible disease using Naive Bayes ML</p>
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
          <Btn onClick={predict} disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700">
            {loading ? "Predicting..." : "Predict Disease"}
          </Btn>
        </div>
      </Card>
      {result && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Prediction Results</h3>
          <div className="bg-green-50 rounded-xl p-4 mb-4 text-center">
            <div className="text-3xl mb-1">🏥</div>
            <div className="text-xl font-bold text-green-800">{result.predicted}</div>
            <div className="text-sm text-green-600 mt-1">
              Confidence: <strong>{result.confidence}%</strong>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 mb-2">Top 3 Predictions:</p>
            {result.top3?.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-sm text-gray-600 w-4">{i + 1}.</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.disease}</span>
                    <span className="text-gray-500">{r.confidence}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${r.confidence}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            ⚠️ This is for informational purposes only. Please consult a healthcare professional.
          </p>
        </Card>
      )}
    </div>
  );
}
