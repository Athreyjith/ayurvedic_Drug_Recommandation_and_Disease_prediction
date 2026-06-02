export const severityColor = (severity) =>
  ({ Mild: "green", Moderate: "yellow", Severe: "red" }[severity] || "gray");

export const appointmentStatusColor = (status) =>
  ({ Pending: "yellow", Approved: "green", Rejected: "red", Completed: "blue" }[status] || "gray");

export const rankBarColor = (index) =>
  index === 0 ? "bg-green-500" : index === 1 ? "bg-yellow-500" : "bg-gray-400";

export const rankBadgeColor = (index) =>
  index === 0 ? "bg-green-500" : index === 1 ? "bg-yellow-500" : "bg-gray-400";
