class DateService {
  /**
   * Validates whether a timezone identifier is a recognized IANA timezone.
   *
   * @param {string} tz
   * @returns {boolean}
   */
  static isValidTimezone(tz) {
    if (!tz || typeof tz !== 'string') return false;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extracts and validates user timezone, defaulting to 'UTC'.
   *
   * @param {string|Object} userOrTimezone
   * @returns {string} Valid IANA timezone string
   */
  static getUserTimezone(userOrTimezone) {
    if (!userOrTimezone) return 'UTC';
    const tz = typeof userOrTimezone === 'string' ? userOrTimezone : userOrTimezone.timezone;
    if (this.isValidTimezone(tz)) {
      return tz;
    }
    return 'UTC';
  }

  /**
   * Returns current date string in user's timezone formatted as YYYY-MM-DD.
   *
   * @param {string|Object} userOrTimezone
   * @param {Date} [date=new Date()]
   * @returns {string} e.g. "2026-09-12"
   */
  static getDailyPeriodKey(userOrTimezone, date = new Date()) {
    const tz = this.getUserTimezone(userOrTimezone);
    const d = date instanceof Date ? date : new Date(date);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  }

  /**
   * Alias for getDailyPeriodKey for convenient readability.
   */
  static getUserToday(userOrTimezone, date = new Date()) {
    return this.getDailyPeriodKey(userOrTimezone, date);
  }

  /**
   * Returns the exact UTC Date corresponding to 00:00:00.000 in the user's timezone.
   *
   * @param {string|Object} userOrTimezone
   * @param {Date} [date=new Date()]
   * @returns {Date}
   */
  static getStartOfUserDay(userOrTimezone, date = new Date()) {
    const tz = this.getUserTimezone(userOrTimezone);
    const dateStr = this.getDailyPeriodKey(tz, date);
    const [year, month, day] = dateStr.split('-').map(Number);

    const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).formatToParts(d);

    const partMap = {};
    for (const p of parts) {
      partMap[p.type] = Number(p.value);
    }

    const hour = partMap.hour === 24 ? 0 : (partMap.hour || 0);
    const localTimeMillis = Date.UTC(
      partMap.year,
      partMap.month - 1,
      partMap.day,
      hour,
      partMap.minute || 0,
      partMap.second || 0
    );
    const targetMillis = Date.UTC(year, month - 1, day, 0, 0, 0);
    const diff = localTimeMillis - targetMillis;

    return new Date(d.getTime() - diff);
  }

  /**
   * Returns the exact UTC Date corresponding to 23:59:59.999 in the user's timezone.
   *
   * @param {string|Object} userOrTimezone
   * @param {Date} [date=new Date()]
   * @returns {Date}
   */
  static getEndOfUserDay(userOrTimezone, date = new Date()) {
    const start = this.getStartOfUserDay(userOrTimezone, date);
    return new Date(start.getTime() + (24 * 3600 * 1000) - 1);
  }

  /**
   * Returns the exact UTC Date corresponding to Monday 00:00:00.000 in the user's timezone.
   *
   * @param {string|Object} userOrTimezone
   * @param {Date} [date=new Date()]
   * @returns {Date}
   */
  static getStartOfUserWeek(userOrTimezone, date = new Date()) {
    const tz = this.getUserTimezone(userOrTimezone);
    const startOfDay = this.getStartOfUserDay(tz, date);

    // Get day of week in user's timezone (Sunday = 0, Monday = 1, ..., Saturday = 6)
    const dayOfWeekStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short'
    }).format(startOfDay);

    const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const day = dayMap[dayOfWeekStr] ?? 1;
    const diffDays = day === 0 ? 6 : day - 1; // Days since Monday

    return new Date(startOfDay.getTime() - (diffDays * 24 * 3600 * 1000));
  }

  /**
   * Returns the weekly period key formatted as W-YYYY-MM-DD based on Monday of the week.
   *
   * @param {string|Object} userOrTimezone
   * @param {Date} [date=new Date()]
   * @returns {string} e.g. "W-2026-09-07"
   */
  static getWeeklyPeriodKey(userOrTimezone, date = new Date()) {
    const tz = this.getUserTimezone(userOrTimezone);
    const startOfWeek = this.getStartOfUserWeek(tz, date);
    const mondayDateStr = this.getDailyPeriodKey(tz, startOfWeek);
    return `W-${mondayDateStr}`;
  }

  /**
   * Checks if two dates fall on the same calendar day in the user's timezone.
   *
   * @param {Date} dateA
   * @param {Date} dateB
   * @param {string|Object} userOrTimezone
   * @returns {boolean}
   */
  static isSameUserDay(dateA, dateB, userOrTimezone) {
    if (!dateA || !dateB) return false;
    const keyA = this.getDailyPeriodKey(userOrTimezone, dateA);
    const keyB = this.getDailyPeriodKey(userOrTimezone, dateB);
    return keyA === keyB;
  }

  /**
   * Checks if currDate is exactly 1 calendar day after prevDate in user's timezone.
   *
   * @param {Date} prevDate
   * @param {Date} currDate
   * @param {string|Object} userOrTimezone
   * @returns {boolean}
   */
  static isConsecutiveUserDay(prevDate, currDate, userOrTimezone) {
    if (!prevDate || !currDate) return false;
    const tz = this.getUserTimezone(userOrTimezone);
    const prevKey = this.getDailyPeriodKey(tz, prevDate);
    const currKey = this.getDailyPeriodKey(tz, currDate);

    const [py, pm, pd] = prevKey.split('-').map(Number);
    const [cy, cm, cd] = currKey.split('-').map(Number);

    const prevUtc = Date.UTC(py, pm - 1, pd);
    const currUtc = Date.UTC(cy, cm - 1, cd);

    const diffDays = Math.round((currUtc - prevUtc) / (24 * 3600 * 1000));
    return diffDays === 1;
  }

  /**
   * Returns the hour of the day (0-23) in the user's timezone.
   *
   * @param {Date} date
   * @param {string|Object} userOrTimezone
   * @returns {number}
   */
  static getUserHour(date = new Date(), userOrTimezone = 'UTC') {
    const tz = this.getUserTimezone(userOrTimezone);
    const d = date instanceof Date ? date : new Date(date);
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false
    }).format(d);
    const hour = parseInt(hourStr, 10);
    return hour === 24 ? 0 : hour;
  }
}

module.exports = DateService;
