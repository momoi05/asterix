// Casque ailé gaulois, dessiné en SVG pour éviter toute image externe
export default function Helmet({ className = '', size = 72 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.7}
      viewBox="0 0 120 84"
      aria-hidden="true"
    >
      <g stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round">
        <path
          d="M34 50 C14 46 4 28 6 8 C14 20 22 26 30 28 C24 20 22 12 24 4 C32 16 38 28 40 42 Z"
          fill="#fff"
        />
        <path
          d="M34 50 C14 46 4 28 6 8 C14 20 22 26 30 28 C24 20 22 12 24 4 C32 16 38 28 40 42 Z"
          fill="#fff"
          transform="translate(120 0) scale(-1 1)"
        />
        <path d="M28 66 A32 32 0 0 1 92 66 Z" fill="var(--gold)" />
        <path d="M44 44 A18 18 0 0 1 60 36" fill="none" stroke="#fff6cc" strokeWidth="4" strokeLinecap="round" />
        <rect x="22" y="62" width="76" height="12" rx="4" fill="var(--gold-dark)" />
      </g>
    </svg>
  );
}
