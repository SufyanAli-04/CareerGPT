export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const getScoreColor = (score: number): string => {
  if (score >= 75) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Fair';
  return 'Needs Work';
};

export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? str.slice(0, maxLength) + '...' : str;

export const extractInitials = (name: string): string =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const parseJsonSafe = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T;
  } catch {
    return fallback;
  }
};
