export default function Card({ children, cls = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${cls}`}>
      {children}
    </div>
  );
}
