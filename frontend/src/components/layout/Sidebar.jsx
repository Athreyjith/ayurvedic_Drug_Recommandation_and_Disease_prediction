import { NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { id: "home", path: "/", label: "Home", icon: "home", end: true },
  { id: "predict", path: "/predict", label: "Disease Prediction", icon: "predict" },
  { id: "drug", path: "/drug", label: "Drug Recommendation", icon: "drug" },
  // { id: "recommend", path: "/recommend", label: "Disease Recommend", icon: "recommend" },
  { id: "chat", path: "/chat", label: "AI Assistant", icon: "chat" },
  { id: "doctor", path: "/doctor", label: "Doctor Consult", icon: "doctor" },
  { id: "feedback", path: "/feedback", label: "Feedback", icon: "feedback" },
  { id: "profile", path: "/profile", label: "Profile", icon: "profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [...NAV_ITEMS];
  if (user?.role === "admin" || user?.role === "doctor") {
    navItems.push({ id: "admin", path: "/admin", label: "Admin Panel", icon: "dashboard" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-tight">Ayurvedic</div>
            <div className="text-xs text-gray-500">Health Assistant</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((n) => (
          <NavLink
            key={n.id}
            to={n.path}
            end={n.end}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon name={n.icon} cls="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium text-gray-700 truncate">{user?.name}</div>
          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
        >
          <Icon name="logout" cls="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
