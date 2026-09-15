'use client';

// ─── Avatar Component ─────────────────────────────────────────────
interface AvatarProps {
  name?:    string;
  src?:     string;
  size?:    number;
  color?:   string;
  className?: string;
}

const COLORS = [
  '#006241', '#00754A', '#1E3932', '#2b5148',
  '#c82014', '#fbbc05', '#2563eb', '#7e22ce',
  '#0891b2', '#059669', '#d97706', '#be123c',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name = '', src, size = 32, color, className = '' }: AvatarProps) {
  const bg = color ?? getColor(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={className}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      title={name}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '0',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
