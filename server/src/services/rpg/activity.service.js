const prisma = require('../../db/prisma');
const DateService = require('../utils/date.service');

const CANONICAL_XP_TYPES = [
  'TASK_COMPLETED',
  'PROJECT_COMPLETED',
  'CHALLENGE_CLAIMED',
  'ACHIEVEMENT_UNLOCKED',
  'XP_GAINED'
];

class ActivityService {
  /**
   * Formats an ActivityLog record into a polished human-readable event.
   */
  static _formatActivity(log) {
    let description = 'Activity logged';

    switch (log.type) {
      case 'TASK_COMPLETED': {
        const title = log.task?.title || log.metadata?.taskTitle || 'Task';
        description = `Completed task: ${title}`;
        break;
      }
      case 'TASK_CREATED': {
        const title = log.task?.title || log.metadata?.taskTitle || 'Task';
        description = `Created task: ${title}`;
        break;
      }
      case 'TASK_DELETED': {
        description = 'Deleted a task';
        break;
      }
      case 'PROJECT_CREATED': {
        const name = log.project?.name || log.metadata?.questName || 'Quest';
        description = `Embarked on Quest: ${name}`;
        break;
      }
      case 'PROJECT_COMPLETED': {
        const name = log.project?.name || log.metadata?.questName || 'Quest';
        description = `Completed Quest: ${name}`;
        break;
      }
      case 'CHALLENGE_CLAIMED': {
        const challengeType = log.metadata?.challengeType || 'Daily';
        description = `Claimed ${challengeType} Challenge reward`;
        break;
      }
      case 'ACHIEVEMENT_UNLOCKED': {
        const achName = log.metadata?.achievementName || 'Achievement';
        description = `Unlocked Achievement: ${achName}`;
        break;
      }
      case 'LEVEL_UP': {
        const newLvl = log.metadata?.newLevel || '';
        description = `Reached Level ${newLvl}`;
        break;
      }
      case 'ITEM_PURCHASED': {
        const itemName = log.item?.name || log.metadata?.itemName || 'Item';
        description = `Purchased item: ${itemName}`;
        break;
      }
      case 'ITEM_EQUIPPED': {
        const itemName = log.item?.name || log.metadata?.itemName || 'Item';
        description = `Equipped item: ${itemName}`;
        break;
      }
      case 'STREAK_STARTED': {
        description = 'Started a new activity streak';
        break;
      }
      case 'STREAK_INCREASED': {
        const streak = log.metadata?.currentStreak || '';
        description = `Maintained streak: ${streak} days strong`;
        break;
      }
      case 'STREAK_BROKEN': {
        description = 'Activity streak was broken';
        break;
      }
      case 'STREAK_RECOVERED': {
        description = 'Recovered broken streak';
        break;
      }
      case 'XP_GAINED': {
        const source = log.metadata?.source;
        if (source === 'TASK_COMPLETED') {
          description = log.task?.title ? `Earned ${log.xpChange} XP from task: ${log.task.title}` : 'Earned XP from task completion';
        } else if (source === 'PROJECT_COMPLETED') {
          description = log.project?.name ? `Earned ${log.xpChange} XP from quest: ${log.project.name}` : 'Earned XP from quest completion';
        } else if (source === 'CHALLENGE_CLAIMED') {
          description = `Earned ${log.xpChange} XP from challenge reward`;
        } else if (source === 'ACHIEVEMENT_UNLOCKED') {
          description = `Earned ${log.xpChange} XP from achievement unlock`;
        } else {
          description = log.metadata?.reason || 'Earned experience points';
        }
        break;
      }
      default:
        description = log.type.replace(/_/g, ' ').toLowerCase();
        break;
    }

    const result = {
      id: log.id,
      type: log.type,
      description,
      xp: log.xpChange || (log.type === 'TASK_COMPLETED' ? log.metadata?.xpEarned : 0) || 0,
      coins: log.coinChange || (log.type === 'TASK_COMPLETED' ? log.metadata?.coinsEarned : 0) || 0,
      metadata: log.metadata || null,
      createdAt: log.createdAt
    };

    if (log.task) {
      result.task = {
        id: log.task.id,
        title: log.task.title,
        primaryAttribute: log.task.primaryAttribute,
        difficulty: log.task.difficulty
      };
    }

    if (log.project) {
      result.project = {
        id: log.project.id,
        name: log.project.name,
        category: log.project.category,
        difficulty: log.project.difficulty
      };
    }

    return result;
  }

  /**
   * Retrieves paginated activity feed for the authenticated user.
   */
  static async getActivityFeed(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          task: {
            select: { id: true, title: true, primaryAttribute: true, difficulty: true }
          },
          project: {
            select: { id: true, name: true, category: true, difficulty: true }
          },
          item: {
            select: { id: true, name: true, type: true }
          }
        }
      })
    ]);

    return {
      activities: logs.map(this._formatActivity),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Fetches top N most recent activities for dashboards and feeds.
   */
  static async getRecentActivities(userId, limit = 10) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const logs = await prisma.activityLog.findMany({
      where: { userId },
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        task: {
          select: { id: true, title: true, primaryAttribute: true, difficulty: true }
        },
        project: {
          select: { id: true, name: true, category: true, difficulty: true }
        },
        item: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    return logs.map(this._formatActivity);
  }

  /**
   * Calculates aggregated player history statistics.
   */
  static async getActivityStats(userId, period = 'all') {
    const where = { userId };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });
    const tz = user?.timezone || 'UTC';
    const now = new Date();

    if (period === 'today') {
      where.createdAt = { gte: DateService.getStartOfUserDay(tz, now) };
    } else if (period === 'week') {
      where.createdAt = { gte: DateService.getStartOfUserWeek(tz, now) };
    } else if (period === 'month') {
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      where.createdAt = { gte: startOfMonth };
    }

    const [aggregations, xpAggregation, typeCounts] = await Promise.all([
      prisma.activityLog.aggregate({
        where,
        _sum: {
          coinChange: true
        },
        _count: {
          id: true
        }
      }),
      prisma.activityLog.aggregate({
        where: {
          ...where,
          type: { in: CANONICAL_XP_TYPES },
          xpChange: { gt: 0 }
        },
        _sum: {
          xpChange: true
        }
      }),
      prisma.activityLog.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true
        },
        _sum: {
          xpChange: true,
          coinChange: true
        }
      })
    ]);

    const breakdown = {};
    for (const item of typeCounts) {
      breakdown[item.type] = {
        count: item._count.id,
        xp: item._sum.xpChange || 0,
        coins: item._sum.coinChange || 0
      };
    }

    return {
      period,
      totalActivities: aggregations._count.id || 0,
      totalXP: xpAggregation._sum.xpChange || 0,
      totalCoins: aggregations._sum.coinChange || 0,
      tasksCompleted: breakdown.TASK_COMPLETED?.count || 0,
      questsCompleted: breakdown.PROJECT_COMPLETED?.count || 0,
      challengesClaimed: breakdown.CHALLENGE_CLAIMED?.count || 0,
      achievementsUnlocked: breakdown.ACHIEVEMENT_UNLOCKED?.count || 0,
      breakdown
    };
  }

  /**
   * Generates time-series data for the Stats dashboard charts.
   */
  static async getActivityAnalytics(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });
    const tz = user?.timezone || 'UTC';
    
    const now = new Date();
    const today = DateService.getStartOfUserDay(tz, now);
    
    // Fetch logs from 40 days ago to cover all charts
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 3600 * 1000);
    
    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        type: { in: CANONICAL_XP_TYPES },
        xpChange: { gt: 0 },
        createdAt: { gte: fortyDaysAgo }
      },
      select: {
        createdAt: true,
        xpChange: true
      }
    });

    const xpPerDay = {};
    for (const log of logs) {
      const dateKey = DateService.getDailyPeriodKey(tz, log.createdAt);
      xpPerDay[dateKey] = (xpPerDay[dateKey] || 0) + log.xpChange;
    }

    // 1. Progression Trajectory (Last 12 days)
    const xpTrajectory = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
      const key = DateService.getDailyPeriodKey(tz, d);
      const monthStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short' }).format(d);
      const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, day: 'numeric' }).format(d);
      
      xpTrajectory.push({
        day: `${monthStr} ${dayStr}`,
        xp: xpPerDay[key] || 0
      });
    }

    // 2. Activity Density (Last 28 days)
    const activityDensity = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
      const key = DateService.getDailyPeriodKey(tz, d);
      activityDensity.push(xpPerDay[key] || 0);
    }

    // 3. Operational Matrix (Current month)
    const month = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'numeric' }).format(today), 10);
    const year = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric' }).format(today), 10);
    const currentMonthLabel = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'long', year: 'numeric' }).format(today);
    
    let startOfMonthDate = today;
    while (true) {
        const d = new Date(startOfMonthDate.getTime() - 24 * 3600 * 1000);
        const m = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'numeric' }).format(d), 10);
        if (m !== month) break;
        startOfMonthDate = d;
    }
    
    let daysInMonth = 0;
    let iter = startOfMonthDate;
    while (true) {
        const m = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'numeric' }).format(iter), 10);
        if (m !== month) break;
        daysInMonth++;
        iter = new Date(iter.getTime() + 24 * 3600 * 1000);
    }
    
    const firstDayOfWeekStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(startOfMonthDate);
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const firstWeekday = dayMap[firstDayOfWeekStr] ?? 0;
    
    const operationalMatrix = [];
    let currentWeek = [];
    
    for (let i = 0; i < firstWeekday; i++) {
        currentWeek.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(startOfMonthDate.getTime() + (day - 1) * 24 * 3600 * 1000);
        const key = DateService.getDailyPeriodKey(tz, d);
        const isActive = (xpPerDay[key] || 0) > 0;
        
        currentWeek.push(isActive ? 1 : 0);
        
        if (currentWeek.length === 7) {
            operationalMatrix.push(currentWeek);
            currentWeek = [];
        }
    }
    
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        operationalMatrix.push(currentWeek);
    }

    // 4. Peak Velocity (max XP in a single day within this period)
    const peakVelocity = Object.values(xpPerDay).reduce((max, val) => Math.max(max, val), 0);

    return {
        xpTrajectory,
        activityDensity,
        operationalMatrix,
        currentMonthLabel,
        peakVelocity
    };
  }
}

module.exports = ActivityService;
