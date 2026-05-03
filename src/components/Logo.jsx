export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
    >
      <defs>
        {/* Ring gradient */}
        <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="40%" stopColor="#22d3ee" />
          <stop offset="75%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* 🔥 Inner glow */}
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow layer */}
      <circle cx="512" cy="512" r="260" fill="url(#glow)" />

      {/* Ring */}
      <circle
        cx="512"
        cy="512"
        r="300"
        fill="none"
        stroke="url(#ring)"
        strokeWidth="80"
        strokeLinecap="round"
        strokeDasharray="880 520"
      />
    </svg>
  );
}