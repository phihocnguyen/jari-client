export const getUserInitials = (fullName?: string | null) => {
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return 'U';
  }
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

