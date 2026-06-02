import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { Alert, Btn, Card, Input } from "../../components/ui";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await post("/auth/login", form);
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      login(res.token, res.user);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card cls="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Ayurvedic Health</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>
        <Alert msg={err} type="error" />
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Btn type="submit" disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700">
            {loading ? "Signing in..." : "Sign In"}
          </Btn>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{" "}
          <Link to="/register" className="text-green-600 font-medium hover:underline">
            Register
          </Link>
        </p>
        {/* <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <strong>Demo:</strong> admin@ayurveda.com / admin123
        </div> */}
      </Card>
    </div>
  );
}
