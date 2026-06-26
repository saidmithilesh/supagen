export function getProfileInitials(name: string, email: string) {
  const fromName = name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2);

  if (fromName.length > 0) {
    return fromName.toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}
