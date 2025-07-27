import { prisma } from '../prisma/prismaClient.js';

class AnalyticsService {
  
  // Build where clause for filtering
  buildWhereClause(filters, userRole, userId) {
    const where = {};

    // Employee filter
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    // Project filter
    if (filters.projectId) {
      where.shift = {
        projectId: filters.projectId
      };
    }

    // Task filter
    if (filters.taskId) {
      where.shift = {
        ...where.shift,
        taskId: filters.taskId
      };
    }

    // Team filter
    if (filters.teamId) {
      where.shift = {
        ...where.shift,
        teamId: filters.teamId
      };
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      const dateFilter = {};
      if (filters.startDate) {
        dateFilter.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateFilter.lte = new Date(filters.endDate);
      }
      where.start = dateFilter;
    }

    // Billable filter
    if (filters.billable !== undefined) {
      const isBillable = filters.billable === 'true';
      where.shift = {
        ...where.shift,
        project: {
          billable: isBillable
        }
      };
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'active') {
        where.end = null;
      } else if (filters.status === 'completed') {
        where.end = { not: null };
      }
    }

    // Access control
    // if (userRole !== 'admin') {
    //   where.employeeId = userId;
    // }

    return where;
  }

  // Build include clause
  buildIncludeClause(includeDetails = false) {
    const include = {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          teamId: true
        }
      },
      shift: {
        select: {
          id: true,
          start: true,
          end: true,
          teamId: true,
          project: {
            select: {
              id: true,
              name: true,
              billable: true
            }
          },
          task: {
            select: {
              id: true,
              name: true,
              billable: true
            }
          }
        }
      }
    };

    if (includeDetails === 'true') {
      include.shift.project.description = true;
      include.shift.task.description = true;
    }

    return include;
  }

  // Build order clause
  buildOrderClause(sortBy = 'start', sortOrder = 'desc') {
    const orderBy = {};
    
    if (sortBy === 'employee') {
      orderBy.employee = { name: sortOrder };
    } else if (sortBy === 'project') {
      orderBy.shift = { project: { name: sortOrder } };
    } else if (sortBy === 'task') {
      orderBy.shift = { task: { name: sortOrder } };
    } else if (sortBy === 'duration') {
      orderBy.duration = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    return orderBy;
  }

  // Get time tracking analytics
  async getTimeTrackingAnalytics(filters) {
    const where = this.buildWhereClause(filters);
    const include = this.buildIncludeClause(filters.includeDetails);
    const orderBy = this.buildOrderClause(filters.sortBy, filters.sortOrder);

    console.log('Analytics query params:', filters);
    console.log('Where clause:', JSON.stringify(where, null, 2));

    const activities = await prisma.activity.findMany({
      where,
      include,
      orderBy,
      take: parseInt(filters.limit),
      skip: parseInt(filters.offset)
    });

    console.log(`Found ${activities.length} activities`);

    const totalCount = await prisma.activity.count({ where });
    const summary = await this.calculateSummaryStats(where);

    let groupedData = null;
    if (filters.groupBy) {
      groupedData = this.groupActivitiesBy(activities, filters.groupBy);
    }

    return {
      activities,
      summary,
      groupedData,
      pagination: {
        total: totalCount,
        limit: parseInt(filters.limit),
        offset: parseInt(filters.offset),
        hasMore: totalCount > parseInt(filters.offset) + activities.length
      }
    };
  }

  // Calculate summary statistics
  async calculateSummaryStats(where) {
    const [
      totalActivities,
      totalDuration,
      billableDuration,
      activeActivities
    ] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.aggregate({
        where,
        _sum: { duration: true }
      }),
      prisma.activity.aggregate({
        where: {
          ...where,
          shift: {
            ...where.shift,
            project: {
              billable: true
            }
          }
        },
        _sum: { duration: true }
      }),
      prisma.activity.count({
        where: {
          ...where,
          end: null
        }
      })
    ]);

    return {
      totalActivities,
      totalDuration: totalDuration._sum.duration || 0,
      billableDuration: billableDuration._sum.duration || 0,
      activeActivities,
      averageDuration: totalActivities > 0 ? 
        (totalDuration._sum.duration || 0) / totalActivities : 0
    };
  }

  // Group activities by criteria
  groupActivitiesBy(activities, groupBy) {
    const grouped = {};

    activities.forEach(activity => {
      let key;
      
      switch (groupBy) {
        case 'employee':
          key = activity.employee.name;
          break;
        case 'project':
          key = activity.shift.project?.name || 'No Project';
          break;
        case 'task':
          key = activity.shift.task?.name || 'No Task';
          break;
        case 'day':
          key = activity.start.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(activity.start);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = activity.start.toISOString().slice(0, 7); // YYYY-MM
          break;
        default:
          key = 'other';
      }

      if (!grouped[key]) {
        grouped[key] = {
          key,
          activities: [],
          totalDuration: 0,
          activityCount: 0
        };
      }

      grouped[key].activities.push(activity);
      grouped[key].totalDuration += activity.duration || 0;
      grouped[key].activityCount += 1;
    });

    return Object.values(grouped);
  }

  // Get employee summary
  async getEmployeeSummary(filters, userRole, userId) {
    const where = {};
    
    if (filters.startDate || filters.endDate) {
      where.start = {};
      if (filters.startDate) where.start.gte = new Date(filters.startDate);
      if (filters.endDate) where.start.lte = new Date(filters.endDate);
    }

    if (userRole !== 'admin') {
      where.employeeId = userId;
    } else if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    const employeeSummary = await prisma.activity.groupBy({
      by: ['employeeId'],
      where,
      _sum: { duration: true },
      _count: { id: true }
    });

    const employeeDetails = await Promise.all(
      employeeSummary.map(async (summary) => {
        const employee = await prisma.employee.findUnique({
          where: { id: summary.employeeId },
          select: {
            id: true,
            name: true,
            email: true,
            teamId: true
          }
        });
        return { ...summary, employee };
      })
    );

    return { employeeSummary: employeeDetails };
  }

  // Get project summary
  async getProjectSummary(filters, userRole, userId) {
    const where = {};
    
    if (filters.startDate || filters.endDate) {
      where.start = {};
      if (filters.startDate) where.start.gte = new Date(filters.startDate);
      if (filters.endDate) where.start.lte = new Date(filters.endDate);
    }

    if (filters.projectId) {
      where.shift = { projectId: filters.projectId };
    }

    if (userRole !== 'admin') {
      where.employeeId = userId;
    }

    const projectSummary = await prisma.activity.groupBy({
      by: ['shiftId'],
      where,
      _sum: { duration: true },
      _count: { id: true }
    });

    const projectDetails = await Promise.all(
      projectSummary.map(async (summary) => {
        const shift = await prisma.shift.findUnique({
          where: { id: summary.shiftId },
          select: {
            project: {
              select: {
                id: true,
                name: true,
                billable: true
              }
            }
          }
        });
        return { ...summary, project: shift?.project };
      })
    );

    return { projectSummary: projectDetails };
  }

  // Get daily summary
  async getDailySummary(filters, userRole, userId) {
    const where = {};
    
    if (filters.startDate || filters.endDate) {
      where.start = {};
      if (filters.startDate) where.start.gte = new Date(filters.startDate);
      if (filters.endDate) where.start.lte = new Date(filters.endDate);
    }

    if (userRole !== 'admin') {
      where.employeeId = userId;
    } else if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    const activities = await prisma.activity.findMany({
      where,
      select: {
        start: true,
        duration: true,
        employeeId: true
      }
    });

    const dailySummary = activities.reduce((acc, activity) => {
      const date = activity.start.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalDuration: 0,
          activityCount: 0
        };
      }
      acc[date].totalDuration += activity.duration || 0;
      acc[date].activityCount += 1;
      return acc;
    }, {});

    return { dailySummary: Object.values(dailySummary) };
  }
}

export default new AnalyticsService(); 