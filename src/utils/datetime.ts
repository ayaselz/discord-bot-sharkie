export interface DSTStatus {
  isDST: boolean;
  daysToChange: number;
  transitionDate: Date;
  reminderLevel: "none" | "today" | "week" | "normal";
}

export function getDSTStatus(date: Date): DSTStatus {
  const year = date.getFullYear();

  function getFirstSundayOfMonth(y: number, month: number): Date {
    const d = new Date(Date.UTC(y, month - 1, 1));
    const dayOfWeek = d.getUTCDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    d.setUTCDate(d.getUTCDate() + daysUntilSunday);
    return d;
  }

  const aprFirstSunday = getFirstSundayOfMonth(year, 4);
  const octFirstSunday = getFirstSundayOfMonth(year, 10);

  let isDST: boolean;
  let nextTransition: Date;

  if (date >= octFirstSunday || date < aprFirstSunday) {
    isDST = true;
    if (date >= octFirstSunday) {
      nextTransition = getFirstSundayOfMonth(year + 1, 4);
    } else {
      nextTransition = aprFirstSunday;
    }
  } else {
    isDST = false;
    nextTransition = octFirstSunday;
  }

  const diffTime = nextTransition.getTime() - date.getTime();
  let daysToChange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (daysToChange < 0) daysToChange = 0;

  let reminderLevel: "none" | "today" | "week" | "normal" = "normal";
  if (daysToChange === 0) {
    reminderLevel = "today";
  } else if (daysToChange <= 7) {
    reminderLevel = "week";
  }

  return {
    isDST,
    daysToChange,
    transitionDate: nextTransition,
    reminderLevel
  };
}

export function getSydneyDateStr(): string {
  return new Date().toLocaleDateString("zh-CN", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function getSydneyHour(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    hour12: false
  });
}
