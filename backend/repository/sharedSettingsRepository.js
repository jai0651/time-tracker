import { prisma } from '../prisma/prismaClient.js';

export const sharedSettingsRepository = {
  // Create a new shared settings
  async create(data) {
    try {
      const sharedSettings = await prisma.sharedSettings.create({
        data: {
          id: data.id || undefined, // Let Prisma generate if not provided
          name: data.name,
          type: data.type,
          settings: data.settings,
          organizationId: data.organizationId,
          default: data.default || false
        }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error creating shared settings:', error);
      throw error;
    }
  },

  // Get shared settings by ID
  async getById(id) {
    try {
      const sharedSettings = await prisma.sharedSettings.findUnique({
        where: { id },
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error fetching shared settings:', error);
      throw error;
    }
  },

  // List shared settings with optional filtering
  async list(params = {}) {
    try {
      const where = {};
      
      if (params.organizationId) {
        where.organizationId = params.organizationId;
      }
      
      if (params.type) {
        where.type = params.type;
      }
      
      if (params.default !== undefined) {
        where.default = params.default;
      }

      const sharedSettings = await prisma.sharedSettings.findMany({
        where,
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error fetching shared settings:', error);
      throw error;
    }
  },

  // Update shared settings
  async update(id, data) {
    try {
      const sharedSettings = await prisma.sharedSettings.update({
        where: { id },
        data: {
          name: data.name,
          type: data.type,
          settings: data.settings,
          default: data.default
        },
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error updating shared settings:', error);
      throw error;
    }
  },

  // Delete shared settings
  async delete(id) {
    try {
      // First, unassign this settings from all employees
      await prisma.employee.updateMany({
        where: { sharedSettingsId: id },
        data: { sharedSettingsId: null }
      });

      // Then delete the settings
      const sharedSettings = await prisma.sharedSettings.delete({
        where: { id }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error deleting shared settings:', error);
      throw error;
    }
  },

  // Get default settings for an organization
  async getDefaultForOrganization(organizationId) {
    try {
      const sharedSettings = await prisma.sharedSettings.findFirst({
        where: {
          organizationId,
          default: true
        }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error fetching default shared settings:', error);
      throw error;
    }
  },

  // Set default settings for an organization
  async setDefaultForOrganization(organizationId, settingsId) {
    try {
      // First, unset all existing defaults for this organization
      await prisma.sharedSettings.updateMany({
        where: {
          organizationId,
          default: true
        },
        data: {
          default: false
        }
      });

      // Then set the new default
      const sharedSettings = await prisma.sharedSettings.update({
        where: { id: settingsId },
        data: { default: true }
      });
      return sharedSettings;
    } catch (error) {
      console.error('Error setting default shared settings:', error);
      throw error;
    }
  },

  // Validate settings JSON schema
  validateSettings(settings) {
    // Basic validation - you can extend this based on your requirements
    const requiredFields = ['screenshotInterval', 'blurOnInactive'];
    const missingFields = requiredFields.filter(field => !(field in settings));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required settings fields: ${missingFields.join(', ')}`);
    }

    // Validate screenshotInterval (should be a positive number)
    if (typeof settings.screenshotInterval !== 'number' || settings.screenshotInterval <= 0) {
      throw new Error('screenshotInterval must be a positive number');
    }

    // Validate blurOnInactive (should be a boolean)
    if (typeof settings.blurOnInactive !== 'boolean') {
      throw new Error('blurOnInactive must be a boolean');
    }

    return true;
  }
}; 