/**
 * 获取澳大利亚悉尼的夏令时状态
 * @param {Date} date - 任意日期对象
 * @returns {Object} { isDST, daysToChange, transitionDate, reminderLevel }
 */
export function getDSTStatus(date) {
  const year = date.getFullYear();

  // 辅助函数：获取某月第一个周日
  function getFirstSundayOfMonth(y, month) {
    const d = new Date(Date.UTC(y, month - 1, 1));
    const dayOfWeek = d.getUTCDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    d.setUTCDate(d.getUTCDate() + daysUntilSunday);
    return d;
  }

  const aprFirstSunday = getFirstSundayOfMonth(year, 4);
  const octFirstSunday = getFirstSundayOfMonth(year, 10);

  let isDST, nextTransition;

  // 判断当前是否处于夏令时，并确定下一次切换日期
  if (date >= octFirstSunday || date < aprFirstSunday) {
    isDST = true;
    // 如果当前日期在10月第一个周日之后，下一次切换是明年4月
    // 如果在1月1日到4月第一个周日之间，下一次切换是今年4月
    if (date >= octFirstSunday) {
      nextTransition = getFirstSundayOfMonth(year + 1, 4);
    } else {
      nextTransition = aprFirstSunday;
    }
  } else {
    isDST = false;
    nextTransition = octFirstSunday;
  }

  // 计算距离下次切换的天数（负值按理不会出现，兜底为0）
  const diffTime = nextTransition.getTime() - date.getTime();
  let daysToChange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (daysToChange < 0) daysToChange = 0;

  // 提醒级别
  let reminderLevel = 'none'; // none | today | week | normal
  if (daysToChange === 0) {
    reminderLevel = 'today';
  } else if (daysToChange <= 7) {
    reminderLevel = 'week';
  } else {
    reminderLevel = 'normal';
  }

  return {
    isDST,
    daysToChange,
    transitionDate: nextTransition,
    reminderLevel
  };
}

// 顺便把获取悉尼日期字符串的函数放进来
export function getSydneyDateStr() {
  return new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getSydneyHour() {
  return new Date().toLocaleString("en-US", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    hour12: false
  });
}
