export function getDateFrom(dateRange: string): Date | null {
  const now = new Date();
  if (dateRange === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (dateRange === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (dateRange === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (dateRange === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null;
}
