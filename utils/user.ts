export const getUserInitials = (fullName?: string | null) => {
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return 'U';
  }
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getUserDisplayName = (user?: any, fallbackName: string = 'Học Nguyễn'): string => {
  if (!user) return fallbackName;
  if (typeof user === 'string') {
    if (user.includes('@')) {
      const prefix = user.split('@')[0];
      if (prefix === 'admin' || prefix === 'dev' || prefix === 'developer') return fallbackName;
      return prefix.split(/[._-]/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    return user === 'Developer' || user === 'dev_user' ? fallbackName : user;
  }

  const rawName = user.displayName || user.fullName || user.name;
  if (rawName && typeof rawName === 'string' && !rawName.includes('@') && rawName !== 'Developer' && rawName !== 'dev_user') {
    return rawName;
  }

  if (user.email && typeof user.email === 'string' && user.email.includes('@')) {
    const prefix = user.email.split('@')[0];
    if (prefix === 'admin' || prefix === 'dev' || prefix === 'developer') return fallbackName;
    return prefix.split(/[._-]/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  return fallbackName;
};
