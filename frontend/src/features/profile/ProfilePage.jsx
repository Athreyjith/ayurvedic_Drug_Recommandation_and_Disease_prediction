import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, put } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { GENDERS } from "../../utils/constants";
import { Alert, Badge, Btn, Card, Input, Select } from "../../components/ui";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", age: "", gender: "Other", password: "" });
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get("/auth/profile").then((p) => {
      setProfile(p);
      setForm({ name: p?.name || "", age: p?.age || "", gender: p?.gender || "Other", password: "" });
    });
  }, []);

  const save = async () => {
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await put("/auth/profile", form);
    setLoading(false);
    if (res.error) setErr(res.error);
    else setMsg("Profile updated!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-5 max-w-md">
      <h2 className="text-xl font-bold text-gray-800">Profile</h2>
      <Card>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-xl">
            {profile?.name?.[0] || "U"}
          </div>
          <div>
            <div className="font-bold text-gray-800">{profile?.name}</div>
            <div className="text-sm text-gray-500">{profile?.email}</div>
            <Badge text={profile?.role || "user"} color="green" />
          </div>
        </div>
        <Alert msg={msg} />
        <Alert msg={err} type="error" />
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
          <Input
            label="New Password (optional)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Leave blank to keep current"
          />
          <Btn onClick={save} disabled={loading} cls="w-full bg-green-600 text-white hover:bg-green-700">
            {loading ? "Saving..." : "Save Changes"}
          </Btn>
        </div>
        <hr className="my-4" />
        <Btn onClick={handleLogout} cls="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
          Logout
        </Btn>
      </Card>
    </div>
  );
}
