export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
    >
      <defs>
        <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="40%" stopColor="#22d3ee" />
          <stop offset="75%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      <circle
        cx="512"
        cy="512"
        r="300"
        fill="none"
        stroke="url(#ring)"
        strokeWidth="80"
        strokeLinecap="round"
        strokeDasharray="880 520"
        style={{
          animation: "spin 6s linear infinite",
          transformOrigin: "center",
        }}
      />

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </svg>
  );
}