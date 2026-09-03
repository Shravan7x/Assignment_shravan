const statusConfig = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700' },
  submitted: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-700' },
  pending_approval: { label: 'Pending Approval', bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700' }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
