import { useState, useEffect } from "react";
import { get, post } from "../../api";
import { useSymptoms } from "../../hooks/useSymptoms";
import { DISEASES, GENDERS_WITH_ANY, SEVERITY_LEVELS } from "../../utils/constants";
import { severityColor } from "../../utils/statusColors";
import { Alert, Badge, Btn, Card, Input, Select } from "../../components/ui";

export default function DrugPage() {
  const symptoms = useSymptoms();
  const [form, setForm] = useState({
    symptom1: "",
    symptom2: "",
    symptom3: "",
    disease: "",
    age: "30",
    gender: "Any",
    severity: "Mild",
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [diseases, setDiseases] = useState(DISEASES);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [predicted, setPredicted] = useState("");

  useEffect(() => {
    get("/recommend/history").then((r) => Array.isArray(r) && setHistory(r));
    get("/diseases").then((r) => Array.isArray(r) && setDiseases(r));
  }, []);

  const autoPredict = async () => {
    if (!form.symptom1 || !form.symptom2 || !form.symptom3) {
      setErr("Select 3 symptoms first");
      return;
    }
    setLoading(true);
    setErr("");
    const res = await post("/predict/disease", {
      symptom1: form.symptom1,
      symptom2: form.symptom2,
      symptom3: form.symptom3,
    });
    setLoading(false);
    if (res.predicted) {
      setPredicted(res.predicted);
      setForm((f) => ({ ...f, disease: res.predicted }));
    }
  };

  const recommend = async () => {
    if (!form.disease) {
      setErr("Please select or predict a disease");
      return;
    }
    setLoading(true);
    setErr("");
    setResult(null);
    const res = await post("/recommend/drug", {
      disease: form.disease,
      age: form.age,
      gender: form.gender,
      severity: form.severity,
    });
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      setResult(res);
      get("/recommend/history").then((r) => Array.isArray(r) && setHistory(r));
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Drug Recommendation</h2>
        <p className="text-gray-500 text-sm mt-1">Get Ayurvedic medicine recommendations based on disease and symptoms</p>
      </div>
      <Card>
        {/* <Alert msg={err} type="error" />
        <p className="text-sm font-medium text-gray-600 mb-3">Step 1: Select symptoms to auto-predict disease</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Select
            options={symptoms}
            value={form.symptom1}
            onChange={(e) => setForm({ ...form, symptom1: e.target.value })}
            label="Symptom 1"
          />
          <Select
            options={symptoms.filter((s) => s !== form.symptom1)}
            value={form.symptom2}
            onChange={(e) => setForm({ ...form, symptom2: e.target.value })}
            label="Symptom 2"
          />
          <Select
            options={symptoms.filter((s) => s !== form.symptom1 && s !== form.symptom2)}
            value={form.symptom3}
            onChange={(e) => setForm({ ...form, symptom3: e.target.value })}
            label="Symptom 3"
          />
        </div>
        <Btn onClick={autoPredict} disabled={loading} cls="bg-blue-600 text-white hover:bg-blue-700 mb-4 text-xs">
          🔬 Auto-Predict Disease
        </Btn>
        {predicted && (
          <div className="bg-blue-50 rounded-lg p-2 mb-3 text-sm text-blue-700">
            Predicted: <strong>{predicted}</strong>
          </div>
        )} */}
        <hr className="my-4" />
        <p className="text-sm font-medium text-gray-600 mb-3">Enter details for recommendation</p>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Disease"
            options={diseases}
            value={form.disease}
            onChange={(e) => setForm({ ...form, disease: e.target.value })}
          />
          <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <Select
            label="Gender"
            options={GENDERS_WITH_ANY}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />
          <Select
            label="Severity"
            options={SEVERITY_LEVELS}
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          />
        </div>
        <Btn onClick={recommend} disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700 mt-4">
          {loading ? "Finding medicines..." : "💊 Get Recommendations"}
        </Btn>
      </Card>

      {result && result.recommendations?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">
            Top Recommended Medicines for <span className="text-green-600">{result.disease}</span>
          </h3>
          <div className="space-y-4">
            {result.recommendations.map((r, i) => (
              <div key={i} className="border border-green-100 rounded-xl p-4 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs text-green-600 font-medium">#{i + 1} Recommended</span>
                    <h4 className="font-bold text-gray-800">{r.drug}</h4>
                  </div>
                  <div className="text-right">
                    <Badge text={r.severity} color={severityColor(r.severity)} />
                    <div className="text-xs text-gray-500 mt-1">Confidence: {r.confidence}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Dosage: </span>
                    <span className="text-gray-700">{r.dosage}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Precautions: </span>
                    <span className="text-gray-700">{r.precautions}</span>
                  </div>
                  <div>
                    <span className="font-medium text-red-500">⚠️ Contraindications: </span>
                    <span className="text-gray-700">{r.contraindications}</span>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ⚠️ Consult a certified Ayurvedic practitioner before starting any treatment.
          </p>
        </Card>
      )}

      {/* {history.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-3">Recommendation History</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-medium">{h.disease}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-green-700">{h.recommended_drug}</span>
                </div>
                <span className="text-xs text-gray-400">{h.created_at?.split("T")[0]}</span>
              </div>
            ))}
          </div>
        </Card>
      )} */}
    </div>
  );
}
