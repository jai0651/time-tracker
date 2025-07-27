import express from 'express';
import { sharedSettingsRepository } from '../repository/sharedSettingsRepository.js';

const router = express.Router();

// Helper function to validate request body
const validateBody = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !(field in body));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// POST /shared-settings - Create a new shared settings
router.post('/', async (req, res) => {
  try {
    const { name, type, settings, organizationId, default: isDefault } = req.body;

    // Validate required fields
    validateBody(req.body, ['name', 'type', 'settings', 'organizationId']);

    // Validate type
    if (!['personal', 'office'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be either "personal" or "office"'
      });
    }

    // Validate settings JSON schema
    try {
      sharedSettingsRepository.validateSettings(settings);
    } catch (validationError) {
      return res.status(400).json({
        error: `Settings validation failed: ${validationError.message}`
      });
    }

    // If this is being set as default, unset other defaults for this organization
    if (isDefault) {
      await sharedSettingsRepository.setDefaultForOrganization(organizationId, null);
    }

    const sharedSettings = await sharedSettingsRepository.create({
      name,
      type,
      settings,
      organizationId,
      default: isDefault || false
    });

    res.status(201).json(sharedSettings);
  } catch (error) {
    console.error('Error creating shared settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to create shared settings'
    });
  }
});

// GET /shared-settings - List shared settings with optional filtering
router.get('/', async (req, res) => {
  try {
    const { organizationId, type, default: isDefault } = req.query;
    
    const params = {};
    if (organizationId) params.organizationId = organizationId;
    if (type) params.type = type;
    if (isDefault !== undefined) params.default = isDefault === 'true';

    const sharedSettings = await sharedSettingsRepository.list(params);
    res.json(sharedSettings);
  } catch (error) {
    console.error('Error fetching shared settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch shared settings'
    });
  }
});

// GET /shared-settings/:id - Get shared settings by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sharedSettings = await sharedSettingsRepository.getById(id);
    if (!sharedSettings) {
      return res.status(404).json({
        error: 'Shared settings not found'
      });
    }

    res.json(sharedSettings);
  } catch (error) {
    console.error('Error fetching shared settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch shared settings'
    });
  }
});

// PUT /shared-settings/:id - Update shared settings
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, settings, default: isDefault } = req.body;

    // Check if shared settings exists
    const existingSettings = await sharedSettingsRepository.getById(id);
    if (!existingSettings) {
      return res.status(404).json({
        error: 'Shared settings not found'
      });
    }

    // Validate type if provided
    if (type && !['personal', 'office'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be either "personal" or "office"'
      });
    }

    // Validate settings JSON schema if provided
    if (settings) {
      try {
        sharedSettingsRepository.validateSettings(settings);
      } catch (validationError) {
        return res.status(400).json({
          error: `Settings validation failed: ${validationError.message}`
        });
      }
    }

    // If this is being set as default, unset other defaults for this organization
    if (isDefault) {
      await sharedSettingsRepository.setDefaultForOrganization(existingSettings.organizationId, id);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (settings !== undefined) updateData.settings = settings;
    if (isDefault !== undefined) updateData.default = isDefault;

    const sharedSettings = await sharedSettingsRepository.update(id, updateData);
    res.json(sharedSettings);
  } catch (error) {
    console.error('Error updating shared settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to update shared settings'
    });
  }
});

// DELETE /shared-settings/:id - Delete shared settings
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if shared settings exists
    const existingSettings = await sharedSettingsRepository.getById(id);
    if (!existingSettings) {
      return res.status(404).json({
        error: 'Shared settings not found'
      });
    }

    // Check if this is the default settings
    if (existingSettings.default) {
      return res.status(400).json({
        error: 'Cannot delete default shared settings. Set another settings as default first.'
      });
    }

    await sharedSettingsRepository.delete(id);
    res.json({
      message: 'Shared settings deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shared settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete shared settings'
    });
  }
});

// POST /shared-settings/:id/set-default - Set as default for organization
router.post('/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if shared settings exists
    const existingSettings = await sharedSettingsRepository.getById(id);
    if (!existingSettings) {
      return res.status(404).json({
        error: 'Shared settings not found'
      });
    }

    const sharedSettings = await sharedSettingsRepository.setDefaultForOrganization(
      existingSettings.organizationId, 
      id
    );

    res.json(sharedSettings);
  } catch (error) {
    console.error('Error setting default shared settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to set default shared settings'
    });
  }
});

export default router; 