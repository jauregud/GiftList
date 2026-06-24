export function MemphisHero() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* Top-left cluster */}
      <circle cx="40" cy="60" r="28" fill="#C62828" opacity="0.15" />
      <circle cx="80" cy="30" r="14" fill="#E8A838" opacity="0.2" />
      <rect x="100" y="80" width="22" height="22" rx="3" fill="#2E7D52" opacity="0.15" transform="rotate(20 111 91)" />

      {/* Top-right cluster */}
      <circle cx="calc(100% - 60px)" cy="50" r="32" fill="#2E7D52" opacity="0.12" />
      <circle cx="calc(100% - 100px)" cy="20" r="16" fill="#C62828" opacity="0.18" />
      <polygon points="0,30 26,0 52,30" fill="#E8A838" opacity="0.2" transform="translate(calc(100% - 140px), 60)" />

      {/* Bottom-left */}
      <circle cx="30" cy="calc(100% - 40px)" r="20" fill="#E8A838" opacity="0.18" />
      <rect x="60" y="calc(100% - 60px)" width="18" height="18" rx="2" fill="#C62828" opacity="0.15" transform="rotate(-15 69 calc(100% - 51px))" />

      {/* Bottom-right */}
      <circle cx="calc(100% - 40px)" cy="calc(100% - 50px)" r="24" fill="#C62828" opacity="0.12" />
      <circle cx="calc(100% - 80px)" cy="calc(100% - 20px)" r="12" fill="#2E7D52" opacity="0.2" />

      {/* Center floating shapes */}
      <circle cx="50%" cy="30" r="10" fill="#E8A838" opacity="0.15" />
      <circle cx="30%" cy="80%" r="8" fill="#C62828" opacity="0.12" />
      <circle cx="70%" cy="85%" r="10" fill="#2E7D52" opacity="0.12" />

      {/* Stars / snowflakes */}
      <text x="20%" y="20%" fontSize="24" fill="#C62828" opacity="0.12">✦</text>
      <text x="75%" y="30%" fontSize="18" fill="#E8A838" opacity="0.18">✦</text>
      <text x="15%" y="70%" fontSize="20" fill="#2E7D52" opacity="0.14">✦</text>
      <text x="80%" y="75%" fontSize="22" fill="#C62828" opacity="0.12">✦</text>
    </svg>
  );
}

export function MemphisCardDot({
  color = "#C62828",
  size = 8,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: color, opacity: 0.7 }}
    />
  );
}

export const PRIORITY_COLORS: Record<number, { bg: string; text: string; label: string; icon: string }> = {
  1: { bg: "bg-primary/10", text: "text-primary", label: "Must Have", icon: "★★★" },
  2: { bg: "bg-accent/15", text: "text-amber-700", label: "Would Love", icon: "★★☆" },
  3: { bg: "bg-secondary/10", text: "text-secondary", label: "Nice to Have", icon: "★☆☆" },
};
