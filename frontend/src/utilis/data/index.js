// utils/formatDate.js
export const formatPostDate = (createdAt) => {
  const now = new Date();
  const postDate = new Date(createdAt);

  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 5) return "Just Now"

  if (diffInSeconds < 60) return `${diffInSeconds}s`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;

  // fallback (full date)
  return postDate.toLocaleDateString();
};