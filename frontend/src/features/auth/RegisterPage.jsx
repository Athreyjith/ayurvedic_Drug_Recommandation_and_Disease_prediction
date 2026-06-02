import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { GENDERS } from "../../utils/constants";
import { Alert, Btn, Card, Input, Select } from "../../components/ui";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", gender: "Other" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await post("/auth/register", form);
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
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
        </div>
        <Alert msg={err} type="error" />
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age"
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
          </div>
          <Btn type="submit" disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700">
            {loading ? "Creating..." : "Create Account"}
          </Btn>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}
