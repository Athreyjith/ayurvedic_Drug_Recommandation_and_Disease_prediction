export default function Alert({ msg, type = "success" }) {
  if (!msg) return null;
  const c =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";
  return <div className={`border rounded-lg px-4 py-2 text-sm mb-3 ${c}`}>{msg}</div>;
}
