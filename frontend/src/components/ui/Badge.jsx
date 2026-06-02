const COLORS = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ text, color = "green" }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[color] || COLORS.gray}`}>
      {text}
    </span>
  );
}
