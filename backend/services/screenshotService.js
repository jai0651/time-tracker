import { prisma } from '../prisma/prismaClient.js';

class ScreenshotService {
  
  // Create a new screenshot record
  async createScreenshot(screenshotData) {
    try {
      const screenshot = await prisma.screenshot.create({
        data: {
          activityId: screenshotData.activityId,
          employeeId: screenshotData.employeeId,
          imageUrl: screenshotData.imageUrl,
          thumbnailUrl: screenshotData.thumbnailUrl,
          fileName: screenshotData.fileName,
          fileSize: screenshotData.fileSize,
          mimeType: screenshotData.mimeType,
          width: screenshotData.width,
          height: screenshotData.height,
          hasPermissions: screenshotData.hasPermissions,
          permissionError: screenshotData.permissionError,
          capturedAt: screenshotData.capturedAt,
          uploadedAt: screenshotData.uploadedAt
        },
        include: {
          activity: {
            select: {
              id: true,
              start: true,
              end: true,
              description: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      return screenshot;
    } catch (error) {
      console.error('Error creating screenshot:', error);
      throw error;
    }
  }

  // Get screenshots for an activity
  async getScreenshotsByActivity(activityId, employeeId) {
    try {
      const screenshots = await prisma.screenshot.findMany({
        where: {
          activityId: activityId,
          employeeId: employeeId
        },
        orderBy: {
          capturedAt: 'desc'
        },
        include: {
          activity: {
            select: {
              id: true,
              start: true,
              end: true,
              description: true
            }
          }
        }
      });
      
      return screenshots;
    } catch (error) {
      console.error('Error fetching screenshots by activity:', error);
      throw error;
    }
  }

  // Get screenshots for an employee with filters
  async getScreenshotsByEmployee(employeeId, filters = {}) {
    try {
      const where = {
        employeeId: employeeId
      };

      // Add activity filter
      if (filters.activityId) {
        where.activityId = filters.activityId;
      }

      // Add date range filter
      if (filters.startDate || filters.endDate) {
        where.capturedAt = {};
        if (filters.startDate) {
          where.capturedAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.capturedAt.lte = new Date(filters.endDate);
        }
      }

      // Add permission filter
      if (filters.hasPermissions !== undefined) {
        where.hasPermissions = filters.hasPermissions;
      }

      const screenshots = await prisma.screenshot.findMany({
        where,
        orderBy: {
          capturedAt: 'desc'
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
        include: {
          activity: {
            select: {
              id: true,
              start: true,
              end: true,
              description: true,
              shift: {
                select: {
                  project: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  task: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      const totalCount = await prisma.screenshot.count({ where });

      return {
        screenshots,
        pagination: {
          total: totalCount,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: totalCount > (filters.offset || 0) + screenshots.length
        }
      };
    } catch (error) {
      console.error('Error fetching screenshots by employee:', error);
      throw error;
    }
  }

  // Get screenshot statistics
  async getScreenshotStats(employeeId, filters = {}) {
    try {
      const where = {
        employeeId: employeeId
      };

      if (filters.startDate || filters.endDate) {
        where.capturedAt = {};
        if (filters.startDate) {
          where.capturedAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.capturedAt.lte = new Date(filters.endDate);
        }
      }

      const [
        totalScreenshots,
        screenshotsWithPermissions,
        totalFileSize,
        averageFileSize
      ] = await Promise.all([
        prisma.screenshot.count({ where }),
        prisma.screenshot.count({
          where: {
            ...where,
            hasPermissions: true
          }
        }),
        prisma.screenshot.aggregate({
          where,
          _sum: { fileSize: true }
        }),
        prisma.screenshot.aggregate({
          where,
          _avg: { fileSize: true }
        })
      ]);

      return {
        totalScreenshots,
        screenshotsWithPermissions,
        screenshotsWithoutPermissions: totalScreenshots - screenshotsWithPermissions,
        totalFileSize: totalFileSize._sum.fileSize || 0,
        averageFileSize: averageFileSize._avg.fileSize || 0,
        permissionRate: totalScreenshots > 0 ? (screenshotsWithPermissions / totalScreenshots) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching screenshot stats:', error);
      throw error;
    }
  }

  // Admin: Get all screenshots (for admin users)
  async getAllScreenshots(filters = {}) {
    try {
      const where = {};

      // Add employee filter
      if (filters.employeeId) {
        where.employeeId = filters.employeeId;
      }

      // Add activity filter
      if (filters.activityId) {
        where.activityId = filters.activityId;
      }

      // Add date range filter
      if (filters.startDate || filters.endDate) {
        where.capturedAt = {};
        if (filters.startDate) {
          where.capturedAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.capturedAt.lte = new Date(filters.endDate);
        }
      }

      // Add permission filter
      if (filters.hasPermissions !== undefined) {
        where.hasPermissions = filters.hasPermissions;
      }

      // Build orderBy clause
      let orderBy = {};
      const sortBy = filters.sortBy || 'capturedAt';
      const sortOrder = filters.sortOrder || 'desc';
      
      if (sortBy === 'employeeName') {
        orderBy = {
          employee: {
            name: sortOrder
          }
        };
      } else if (sortBy === 'fileName') {
        orderBy = {
          fileName: sortOrder
        };
      } else if (sortBy === 'fileSize') {
        orderBy = {
          fileSize: sortOrder
        };
      } else {
        orderBy = {
          capturedAt: sortOrder
        };
      }

      // Add file size filter
      if (filters.minFileSize) {
        where.fileSize = {
          gte: parseInt(filters.minFileSize) * 1024 // Convert KB to bytes
        };
      }

      const screenshots = await prisma.screenshot.findMany({
        where,
        orderBy,
        take: filters.limit || 50,
        skip: filters.offset || 0,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          activity: {
            select: {
              id: true,
              start: true,
              end: true,
              description: true,
              shift: {
                select: {
                  project: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  task: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      const totalCount = await prisma.screenshot.count({ where });

      return {
        screenshots,
        pagination: {
          total: totalCount,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: totalCount > (filters.offset || 0) + screenshots.length
        }
      };
    } catch (error) {
      console.error('Error fetching all screenshots:', error);
      throw error;
    }
  }

  // Admin: Get screenshot statistics for all employees
  async getAllScreenshotStats(filters = {}) {
    try {
      const where = {};

      // Add employee filter
      if (filters.employeeId) {
        where.employeeId = filters.employeeId;
      }

      // Add date range filter
      if (filters.startDate || filters.endDate) {
        where.capturedAt = {};
        if (filters.startDate) {
          where.capturedAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.capturedAt.lte = new Date(filters.endDate);
        }
      }

      const [
        totalScreenshots,
        screenshotsWithPermissions,
        totalFileSize,
        averageFileSize,
        employeeStats
      ] = await Promise.all([
        prisma.screenshot.count({ where }),
        prisma.screenshot.count({
          where: {
            ...where,
            hasPermissions: true
          }
        }),
        prisma.screenshot.aggregate({
          where,
          _sum: { fileSize: true }
        }),
        prisma.screenshot.aggregate({
          where,
          _avg: { fileSize: true }
        }),
        prisma.screenshot.groupBy({
          by: ['employeeId'],
          where,
          _count: {
            id: true
          },
          _sum: {
            fileSize: true
          }
        })
      ]);

      // Get employee details for stats
      const employeeDetails = await Promise.all(
        employeeStats.map(async (stat) => {
          const employee = await prisma.employee.findUnique({
            where: { id: stat.employeeId },
            select: { id: true, name: true, email: true }
          });
          return {
            employeeId: stat.employeeId,
            employeeName: employee?.name || 'Unknown',
            employeeEmail: employee?.email || 'Unknown',
            screenshotCount: stat._count.id,
            totalFileSize: stat._sum.fileSize || 0
          };
        })
      );

      return {
        totalScreenshots,
        screenshotsWithPermissions,
        screenshotsWithoutPermissions: totalScreenshots - screenshotsWithPermissions,
        totalFileSize: totalFileSize._sum.fileSize || 0,
        averageFileSize: averageFileSize._avg.fileSize || 0,
        permissionRate: totalScreenshots > 0 ? (screenshotsWithPermissions / totalScreenshots) * 100 : 0,
        employeeStats: employeeDetails
      };
    } catch (error) {
      console.error('Error fetching all screenshot stats:', error);
      throw error;
    }
  }

  // Delete a screenshot
  async deleteScreenshot(screenshotId, employeeId) {
    try {
      const screenshot = await prisma.screenshot.findFirst({
        where: {
          id: screenshotId,
          employeeId: employeeId
        }
      });

      if (!screenshot) {
        throw new Error('Screenshot not found or access denied');
      }

      await prisma.screenshot.delete({
        where: {
          id: screenshotId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      throw error;
    }
  }

  // Update screenshot metadata
  async updateScreenshot(screenshotId, employeeId, updateData) {
    try {
      const screenshot = await prisma.screenshot.findFirst({
        where: {
          id: screenshotId,
          employeeId: employeeId
        }
      });

      if (!screenshot) {
        throw new Error('Screenshot not found or access denied');
      }

      const updatedScreenshot = await prisma.screenshot.update({
        where: {
          id: screenshotId
        },
        data: updateData,
        include: {
          activity: {
            select: {
              id: true,
              start: true,
              end: true,
              description: true
            }
          }
        }
      });

      return updatedScreenshot;
    } catch (error) {
      console.error('Error updating screenshot:', error);
      throw error;
    }
  }

  // Link screenshots to an activity (batch update)
  async linkScreenshotsToActivity(screenshotIds, activityId, employeeId) {
    try {
      const result = await prisma.screenshot.updateMany({
        where: {
          id: { in: screenshotIds },
          employeeId: employeeId,
          activityId: null // Only link unlinked screenshots
        },
        data: {
          activityId: activityId
        }
      });

      return result;
    } catch (error) {
      console.error('Error linking screenshots to activity:', error);
      throw error;
    }
  }

  // Get orphaned screenshots (not linked to any activity)
  async getOrphanedScreenshots(employeeId, filters = {}) {
    try {
      const where = {
        employeeId: employeeId,
        activityId: null
      };

      if (filters.startDate || filters.endDate) {
        where.capturedAt = {};
        if (filters.startDate) {
          where.capturedAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.capturedAt.lte = new Date(filters.endDate);
        }
      }

      const screenshots = await prisma.screenshot.findMany({
        where,
        orderBy: {
          capturedAt: 'desc'
        },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      const totalCount = await prisma.screenshot.count({ where });

      return {
        screenshots,
        pagination: {
          total: totalCount,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: totalCount > (filters.offset || 0) + screenshots.length
        }
      };
    } catch (error) {
      console.error('Error fetching orphaned screenshots:', error);
      throw error;
    }
  }
}

export default new ScreenshotService(); 