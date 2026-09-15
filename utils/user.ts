export const getUserInitials = (fullName: string = 'HN') => {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};
