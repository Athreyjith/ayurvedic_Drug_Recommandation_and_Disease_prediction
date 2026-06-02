export default function Btn({ children, onClick, cls = "", type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${cls}`}
    >
      {children}
    </button>
  );
}
