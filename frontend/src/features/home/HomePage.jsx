import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Btn, Card } from "../../components/ui";

const FEATURES = [
  { icon: "🔬", title: "Disease Prediction", desc: "Predict diseases from symptoms using Naive Bayes ML", path: "/predict", color: "bg-blue-50" },
  { icon: "💊", title: "Drug Recommendation", desc: "Get Ayurvedic medicine recommendations", path: "/drug", color: "bg-green-50" },
  // { icon: "📋", title: "Disease Recommendation", desc: "Top 3 probable diseases from your symptoms", path: "/recommend", color: "bg-purple-50" },
  { icon: "🤖", title: "AI Health Assistant", desc: "Chat with AI for Ayurvedic guidance", path: "/chat", color: "bg-yellow-50" },
  { icon: "👨‍⚕️", title: "Doctor Consultation", desc: "Book appointments and message doctors", path: "/doctor", color: "bg-pink-50" },
  { icon: "⭐", title: "Feedback", desc: "Share your experience and suggestions", path: "/feedback", color: "bg-orange-50" },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name || "Guest"} 🌿</h1>
        <p className="text-green-100 text-sm">Your Ayurvedic Health Companion — Ancient Wisdom, Modern Technology</p>
        <div className="flex gap-3 mt-4">
          <Btn onClick={() => navigate("/predict")} cls="bg-white text-green-700 hover:bg-green-50 text-xs">
            Predict Disease
          </Btn>
          <Btn onClick={() => navigate("/drug")} cls="bg-green-700 text-white hover:bg-green-800 border border-green-500 text-xs">
            Get Medicine
          </Btn>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <button
            key={f.path}
            onClick={() => navigate(f.path)}
            className={`${f.color} rounded-xl p-5 text-left hover:shadow-md transition-all border border-transparent hover:border-green-200`}
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-gray-500 text-xs">{f.desc}</p>
          </button>
        ))}
      </div>
      <Card>
        <h3 className="font-semibold text-gray-700 mb-3">About This System</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          This Ayurvedic Health Assistant combines traditional Ayurvedic medicine knowledge with modern machine
          learning to provide personalized health recommendations. Using Naive Bayes classification trained on real
          datasets, the system predicts diseases and also recommends appropriate Ayurvedic treatments.
        </p>
      </Card>
    </div>
  );
}
