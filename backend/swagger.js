import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Tracker MVP API',
      version: '1.0.0',
      description: 'Complete API for time tracking system with employee management, project tracking, screenshot capture, and analytics',
      contact: {
        name: 'API Support',
        email: 'support@timetracker.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'emp-1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            teamId: { type: 'string', example: 'team-1' },
            sharedSettingsId: { type: 'string', example: 'settings-1', nullable: true },
            organizationId: { type: 'string', example: 'org-1' },
            invited: { type: 'string', format: 'date-time' },
            deactivated: { type: 'string', format: 'date-time', nullable: true },
            sharedSettings: { $ref: '#/components/schemas/SharedSettings', nullable: true },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' }
            },
            tasks: {
              type: 'array',
              items: { $ref: '#/components/schemas/Task' }
            },
            shifts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Shift' }
            },
            activities: {
              type: 'array',
              items: { $ref: '#/components/schemas/Activity' }
            },
            screenshots: {
              type: 'array',
              items: { $ref: '#/components/schemas/Screenshot' }
            }
          },
          required: ['name', 'teamId', 'organizationId']
        },
        SharedSettings: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'settings-1' },
            name: { type: 'string', example: 'Default Office Settings' },
            type: { type: 'string', enum: ['personal', 'office'], example: 'office' },
            settings: {
              type: 'object',
              properties: {
                screenshotInterval: { type: 'number', example: 300000 },
                blurOnInactive: { type: 'boolean', example: true },
                trackKeyboard: { type: 'boolean', example: false },
                trackMouse: { type: 'boolean', example: true },
                idleTimeout: { type: 'number', example: 300000 }
              },
              required: ['screenshotInterval', 'blurOnInactive']
            },
            organizationId: { type: 'string', example: 'org-1' },
            default: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            employees: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' }
            }
          },
          required: ['name', 'type', 'settings', 'organizationId']
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'proj-1' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Redesign the company website', nullable: true },
            teams: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['team-1', 'team-2']
            },
            billable: { type: 'boolean', example: true },
            statuses: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['todo', 'in-progress', 'done']
            },
            priorities: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['low', 'medium', 'high']
            },
            organizationId: { type: 'string', example: 'org-1' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employees: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' }
            },
            tasks: {
              type: 'array',
              items: { $ref: '#/components/schemas/Task' }
            },
            shifts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Shift' }
            }
          },
          required: ['name', 'organizationId']
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'task-1' },
            name: { type: 'string', example: 'Design Homepage' },
            projectId: { type: 'string', example: 'proj-1' },
            description: { type: 'string', example: 'Create new homepage design', nullable: true },
            status: { type: 'string', example: 'pending', enum: ['pending', 'in-progress', 'completed'], nullable: true },
            priority: { type: 'string', example: 'medium', enum: ['low', 'medium', 'high'], nullable: true },
            billable: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            project: { $ref: '#/components/schemas/Project' },
            employees: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' }
            },
            shifts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Shift' }
            }
          },
          required: ['name', 'projectId']
        },
        Shift: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'shift-1' },
            employeeId: { type: 'string', example: 'emp-1' },
            teamId: { type: 'string', example: 'team-1' },
            taskId: { type: 'string', example: 'task-1', nullable: true },
            projectId: { type: 'string', example: 'proj-1', nullable: true },
            token: { type: 'string', example: 'token-123', nullable: true },
            type: { type: 'string', example: 'work', nullable: true },
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time', nullable: true },
            duration: { type: 'integer', example: 28800000, nullable: true },
            timezoneOffset: { type: 'integer', example: -300 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employee: { $ref: '#/components/schemas/Employee' },
            task: { $ref: '#/components/schemas/Task', nullable: true },
            project: { $ref: '#/components/schemas/Project', nullable: true },
            activities: {
              type: 'array',
              items: { $ref: '#/components/schemas/Activity' }
            }
          },
          required: ['employeeId', 'teamId', 'start', 'timezoneOffset']
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'activity-1' },
            shiftId: { type: 'string', example: 'shift-1' },
            employeeId: { type: 'string', example: 'emp-1' },
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time', nullable: true },
            duration: { type: 'integer', example: 1800000 },
            description: { type: 'string', example: 'Working on task' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            shift: { $ref: '#/components/schemas/Shift' },
            employee: { $ref: '#/components/schemas/Employee' },
            project: { $ref: '#/components/schemas/Project' },
            task: { $ref: '#/components/schemas/Task' }
          },
          required: ['shiftId', 'employeeId', 'start']
        },
        Screenshot: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'screenshot-1' },
            activityId: { type: 'string', example: 'activity-1', nullable: true },
            employeeId: { type: 'string', example: 'emp-1' },
            imageUrl: { type: 'string', example: 'data:image/jpeg;base64,/9j/4AAQ...' },
            thumbnailUrl: { type: 'string', example: 'data:image/jpeg;base64,/9j/4AAQ...', nullable: true },
            fileName: { type: 'string', example: 'screenshot_2024-01-15_10-30-00.jpg' },
            fileSize: { type: 'integer', example: 245760 },
            mimeType: { type: 'string', example: 'image/jpeg' },
            width: { type: 'integer', example: 1920 },
            height: { type: 'integer', example: 1080 },
            hasPermissions: { type: 'boolean', example: true },
            permissionError: { type: 'string', example: 'Screen recording permission denied', nullable: true },
            capturedAt: { type: 'string', format: 'date-time' },
            uploadedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            activity: { $ref: '#/components/schemas/Activity', nullable: true },
            employee: { $ref: '#/components/schemas/Employee' }
          },
          required: ['employeeId', 'imageUrl', 'fileName', 'fileSize', 'mimeType']
        },
        Analytics: {
          type: 'object',
          properties: {
            totalHours: { type: 'number', example: 156.5 },
            totalScreenshots: { type: 'integer', example: 1250 },
            averageSessionLength: { type: 'number', example: 4.2 },
            topProjects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  projectId: { type: 'string' },
                  projectName: { type: 'string' },
                  totalHours: { type: 'number' },
                  percentage: { type: 'number' }
                }
              }
            },
            dailyBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date' },
                  hours: { type: 'number' },
                  screenshots: { type: 'integer' }
                }
              }
            }
          }
        },
        DownloadInfo: {
          type: 'object',
          properties: {
            fileName: { type: 'string', example: 'Time Tracker-1.0.0-arm64.dmg' },
            fileSize: { type: 'integer', example: 94845421 },
            fileSizeFormatted: { type: 'string', example: '90.45 MB' },
            version: { type: 'string', example: '1.0.0' },
            platform: { type: 'string', example: 'macOS (ARM64)' },
            lastModified: { type: 'string', format: 'date-time' },
            downloadUrl: { type: 'string', example: '/api/v1/downloads/desktop-app' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            details: {
              type: 'array',
              items: { type: 'string' },
              example: ['Field validation error']
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Success message' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      '/employee': {
        post: {
          tags: ['Employees'],
          summary: 'Create a new employee',
          description: 'Create a new employee with optional shared settings assignment',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                    teamId: { type: 'string', example: 'team-1' },
                    sharedSettingsId: { type: 'string', example: 'settings-1', nullable: true }
                  },
                  required: ['name', 'teamId']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Employee created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Employee' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            409: {
              description: 'Email already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Employees'],
          summary: 'List employees',
          description: 'Get a list of employees with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'organizationId',
              in: 'query',
              description: 'Filter by organization ID',
              schema: { type: 'string' }
            },
            {
              name: 'teamId',
              in: 'query',
              description: 'Filter by team ID',
              schema: { type: 'string' }
            },
            {
              name: 'employeeId',
              in: 'query',
              description: 'Filter by employee ID',
              schema: { type: 'string' }
            },
            {
              name: 'deactivated',
              in: 'query',
              description: 'Filter by deactivation status',
              schema: { type: 'boolean' }
            }
          ],
          responses: {
            200: {
              description: 'List of employees',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Employee' }
                  }
                }
              }
            }
          }
        }
      },
      '/employee/{id}': {
        put: {
          tags: ['Employees'],
          summary: 'Update employee',
          description: 'Update an existing employee',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Employee ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    teamId: { type: 'string' },
                    sharedSettingsId: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Employee updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Employee' }
                }
              }
            },
            404: {
              description: 'Employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Employees'],
          summary: 'Get employee by ID',
          description: 'Get a specific employee by their ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Employee ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Employee details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Employee' }
                }
              }
            },
            404: {
              description: 'Employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/employee/deactivate/{id}': {
        post: {
          tags: ['Employees'],
          summary: 'Deactivate employee',
          description: 'Deactivate an employee (soft delete)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Employee ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Employee deactivated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Employee' }
                }
              }
            },
            400: {
              description: 'Cannot deactivate employee with active associations',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            404: {
              description: 'Employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/shared-settings': {
        post: {
          tags: ['Shared Settings'],
          summary: 'Create shared settings',
          description: 'Create a new shared settings configuration',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Default Office Settings' },
                    type: { type: 'string', enum: ['personal', 'office'], example: 'office' },
                    settings: {
                      type: 'object',
                      properties: {
                        screenshotInterval: { type: 'number', example: 300000 },
                        blurOnInactive: { type: 'boolean', example: true }
                      },
                      required: ['screenshotInterval', 'blurOnInactive']
                    },
                    organizationId: { type: 'string', example: 'org-1' },
                    default: { type: 'boolean', example: false }
                  },
                  required: ['name', 'type', 'settings', 'organizationId']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Shared settings created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SharedSettings' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Shared Settings'],
          summary: 'List shared settings',
          description: 'Get a list of shared settings with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'organizationId',
              in: 'query',
              description: 'Filter by organization ID',
              schema: { type: 'string' }
            },
            {
              name: 'type',
              in: 'query',
              description: 'Filter by type',
              schema: { type: 'string', enum: ['personal', 'office'] }
            },
            {
              name: 'default',
              in: 'query',
              description: 'Filter by default status',
              schema: { type: 'boolean' }
            }
          ],
          responses: {
            200: {
              description: 'List of shared settings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SharedSettings' }
                  }
                }
              }
            }
          }
        }
      },
      '/shared-settings/{id}': {
        get: {
          tags: ['Shared Settings'],
          summary: 'Get shared settings by ID',
          description: 'Get a specific shared settings by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Shared settings ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Shared settings details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SharedSettings' }
                }
              }
            },
            404: {
              description: 'Shared settings not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Shared Settings'],
          summary: 'Update shared settings',
          description: 'Update an existing shared settings',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Shared settings ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['personal', 'office'] },
                    settings: { type: 'object' },
                    default: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Shared settings updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SharedSettings' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            404: {
              description: 'Shared settings not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Shared Settings'],
          summary: 'Delete shared settings',
          description: 'Delete a shared settings configuration',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Shared settings ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Shared settings deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Message' }
                }
              }
            },
            400: {
              description: 'Cannot delete default settings',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            404: {
              description: 'Shared settings not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/shared-settings/{id}/set-default': {
        post: {
          tags: ['Shared Settings'],
          summary: 'Set as default',
          description: 'Set a shared settings as the default for the organization',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Shared settings ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Default settings updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SharedSettings' }
                }
              }
            },
            404: {
              description: 'Shared settings not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/project': {
        post: {
          tags: ['Projects'],
          summary: 'Create a new project',
          description: 'Create a new project with team assignments',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Website Redesign' },
                    description: { type: 'string', example: 'Redesign the company website' },
                    teams: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['team-1', 'team-2']
                    },
                    billable: { type: 'boolean', example: true },
                    statuses: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['todo', 'in-progress', 'done']
                    },
                    priorities: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['low', 'medium', 'high']
                    },
                    organizationId: { type: 'string', example: 'org-1' }
                  },
                  required: ['name', 'organizationId']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Project created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Projects'],
          summary: 'List projects',
          description: 'Get a list of projects with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'organizationId',
              in: 'query',
              description: 'Filter by organization ID',
              schema: { type: 'string' }
            },
            {
              name: 'teamId',
              in: 'query',
              description: 'Filter by team ID',
              schema: { type: 'string' }
            },
            {
              name: 'employeeId',
              in: 'query',
              description: 'Filter by employee ID',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'List of projects',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          }
        }
      },
      '/project/{id}': {
        get: {
          tags: ['Projects'],
          summary: 'Get project by ID',
          description: 'Get a specific project by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Project ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Project details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' }
                }
              }
            },
            404: {
              description: 'Project not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Projects'],
          summary: 'Update project',
          description: 'Update an existing project',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Project ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    teams: { 
                      type: 'array', 
                      items: { type: 'string' }
                    },
                    billable: { type: 'boolean' },
                    statuses: { 
                      type: 'array', 
                      items: { type: 'string' }
                    },
                    priorities: { 
                      type: 'array', 
                      items: { type: 'string' }
                    },
                    employees: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Project updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' }
                }
              }
            },
            404: {
              description: 'Project not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Projects'],
          summary: 'Delete project',
          description: 'Delete a project (only if no tasks exist)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Project ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Project deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Message' }
                }
              }
            },
            400: {
              description: 'Cannot delete project with active tasks',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            404: {
              description: 'Project not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/task': {
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          description: 'Create a new task within a project',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Design Homepage' },
                    projectId: { type: 'string', example: 'proj-1' },
                    description: { type: 'string', example: 'Create new homepage design' },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], example: 'pending' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
                    billable: { type: 'boolean', example: true }
                  },
                  required: ['name', 'projectId']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Task created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Tasks'],
          summary: 'List tasks',
          description: 'Get a list of tasks with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'projectId',
              in: 'query',
              description: 'Filter by project ID',
              schema: { type: 'string' }
            },
            {
              name: 'employeeId',
              in: 'query',
              description: 'Filter by employee ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'List of tasks',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        }
      },
      '/task/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get task by ID',
          description: 'Get a specific task by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Task ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Task details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            404: {
              description: 'Task not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update task',
          description: 'Update an existing task',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Task ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    billable: { type: 'boolean' },
                    employees: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Task updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            404: {
              description: 'Task not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete task',
          description: 'Delete a task',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Task ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Task deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Message' }
                }
              }
            },
            404: {
              description: 'Task not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/shift': {
        post: {
          tags: ['Shifts'],
          summary: 'Start a new shift',
          description: 'Start a new work shift for an employee',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    employeeId: { type: 'string', example: 'emp-1' },
                    teamId: { type: 'string', example: 'team-1' },
                    token: { type: 'string', example: 'token-123' },
                    type: { type: 'string', example: 'work' },
                    timezoneOffset: { type: 'integer', example: -300 }
                  },
                  required: ['employeeId', 'teamId', 'timezoneOffset']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Shift started successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Shift' }
                }
              }
            },
            400: {
              description: 'Employee already has an active shift',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Shifts'],
          summary: 'List shifts',
          description: 'Get a list of shifts with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'employeeId',
              in: 'query',
              description: 'Filter by employee ID',
              schema: { type: 'string' }
            },
            {
              name: 'start',
              in: 'query',
              description: 'Filter by start time (timestamp)',
              schema: { type: 'integer' }
            },
            {
              name: 'end',
              in: 'query',
              description: 'Filter by end time (timestamp)',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'List of shifts',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Shift' }
                  }
                }
              }
            }
          }
        }
      },
      '/shift/{id}': {
        put: {
          tags: ['Shifts'],
          summary: 'End a shift',
          description: 'End an active shift',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Shift ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    end: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Shift ended successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Shift' }
                }
              }
            },
            404: {
              description: 'Shift not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Shifts'],
          summary: 'Get shift by ID',
          description: 'Get a specific shift by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Shift ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Shift details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Shift' }
                }
              }
            },
            404: {
              description: 'Shift not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/activity': {
        get: {
          tags: ['Activities'],
          summary: 'List activities',
          description: 'Get a list of activities with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'shiftId',
              in: 'query',
              description: 'Filter by shift ID',
              schema: { type: 'string' }
            },
            {
              name: 'employeeId',
              in: 'query',
              description: 'Filter by employee ID',
              schema: { type: 'string' }
            },
            {
              name: 'start',
              in: 'query',
              description: 'Filter by start time (timestamp)',
              schema: { type: 'integer' }
            },
            {
              name: 'end',
              in: 'query',
              description: 'Filter by end time (timestamp)',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'List of activities',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Activity' }
                  }
                }
              }
            }
          }
        }
      },
      '/activity/{id}': {
        get: {
          tags: ['Activities'],
          summary: 'Get activity by ID',
          description: 'Get a specific activity by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Activity ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Activity details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Activity' }
                }
              }
            },
            404: {
              description: 'Activity not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      // Authentication endpoints
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login employee',
          description: 'Authenticate employee with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                    password: { type: 'string', example: 'password123' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/auth/validate-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Validate activation token',
          description: 'Validate an activation token and return employee email',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'activation-token-123' }
                  },
                  required: ['token']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Token is valid',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', example: 'john.doe@example.com' },
                      message: { type: 'string', example: 'Token is valid' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid or expired token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/auth/activate': {
        post: {
          tags: ['Authentication'],
          summary: 'Activate account',
          description: 'Activate employee account with token, password, and name',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'activation-token-123' },
                    password: { type: 'string', example: 'newpassword123' },
                    name: { type: 'string', example: 'John Doe' }
                  },
                  required: ['token', 'password', 'name']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Account activated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      message: { type: 'string', example: 'Account activated successfully' },
                      employee: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'emp-1' },
                          email: { type: 'string', example: 'john.doe@example.com' },
                          name: { type: 'string', example: 'John Doe' }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid or expired token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh token',
          description: 'Refresh JWT token using refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: { type: 'string', example: 'refresh-token-123' }
                  },
                  required: ['refreshToken']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid refresh token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      // Screenshot endpoints
      '/screenshots': {
        post: {
          tags: ['Screenshots'],
          summary: 'Upload screenshot',
          description: 'Upload a single screenshot with metadata',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activityId: { type: 'string', example: 'activity-1', nullable: true },
                    imageUrl: { type: 'string', example: 'data:image/jpeg;base64,/9j/4AAQ...' },
                    thumbnailUrl: { type: 'string', example: 'data:image/jpeg;base64,/9j/4AAQ...', nullable: true },
                    fileName: { type: 'string', example: 'screenshot_2024-01-15_10-30-00.jpg' },
                    fileSize: { type: 'integer', example: 245760 },
                    mimeType: { type: 'string', example: 'image/jpeg' },
                    width: { type: 'integer', example: 1920 },
                    height: { type: 'integer', example: 1080 },
                    hasPermissions: { type: 'boolean', example: true },
                    permissionError: { type: 'string', example: 'Screen recording permission denied', nullable: true },
                    capturedAt: { type: 'string', format: 'date-time' },
                    uploadedAt: { type: 'string', format: 'date-time' }
                  },
                  required: ['imageUrl', 'fileName', 'fileSize', 'mimeType']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Screenshot uploaded successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Screenshot' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/screenshots/batch': {
        post: {
          tags: ['Screenshots'],
          summary: 'Upload multiple screenshots',
          description: 'Upload multiple screenshots in a single request',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    screenshots: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          activityId: { type: 'string', nullable: true },
                          imageUrl: { type: 'string' },
                          fileName: { type: 'string' },
                          fileSize: { type: 'integer' },
                          mimeType: { type: 'string' },
                          width: { type: 'integer' },
                          height: { type: 'integer' },
                          hasPermissions: { type: 'boolean' },
                          permissionError: { type: 'string', nullable: true },
                          capturedAt: { type: 'string', format: 'date-time' }
                        },
                        required: ['imageUrl', 'fileName', 'fileSize', 'mimeType']
                      }
                    }
                  },
                  required: ['screenshots']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Screenshots uploaded successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      created: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Screenshot' }
                      },
                      failed: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            index: { type: 'integer' },
                            error: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/screenshots/my': {
        get: {
          tags: ['Screenshots'],
          summary: 'Get my screenshots',
          description: 'Get current employee\'s screenshots with optional filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Filter by start date',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'Filter by end date',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'hasPermissions',
              in: 'query',
              description: 'Filter by permission status',
              schema: { type: 'boolean' }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of screenshots to return',
              schema: { type: 'integer', default: 20 }
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of screenshots to skip',
              schema: { type: 'integer', default: 0 }
            }
          ],
          responses: {
            200: {
              description: 'List of screenshots',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      screenshots: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Screenshot' }
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/screenshots/stats': {
        get: {
          tags: ['Screenshots'],
          summary: 'Get screenshot statistics',
          description: 'Get screenshot statistics for current employee',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Filter by start date',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'Filter by end date',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            200: {
              description: 'Screenshot statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalScreenshots: { type: 'integer' },
                      totalFileSize: { type: 'integer' },
                      averageFileSize: { type: 'number' },
                      screenshotsWithPermissions: { type: 'integer' },
                      screenshotsWithoutPermissions: { type: 'integer' },
                      dailyBreakdown: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date' },
                            count: { type: 'integer' },
                            totalSize: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/screenshots/activity/{activityId}': {
        get: {
          tags: ['Screenshots'],
          summary: 'Get screenshots by activity',
          description: 'Get all screenshots for a specific activity',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'activityId',
              in: 'path',
              required: true,
              description: 'Activity ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'List of screenshots for activity',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Screenshot' }
                  }
                }
              }
            },
            404: {
              description: 'Activity not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/screenshots/{screenshotId}': {
        put: {
          tags: ['Screenshots'],
          summary: 'Update screenshot',
          description: 'Update screenshot metadata',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'screenshotId',
              in: 'path',
              required: true,
              description: 'Screenshot ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activityId: { type: 'string', nullable: true },
                    hasPermissions: { type: 'boolean' },
                    permissionError: { type: 'string', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Screenshot updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Screenshot' }
                }
              }
            },
            404: {
              description: 'Screenshot not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Screenshots'],
          summary: 'Delete screenshot',
          description: 'Delete a screenshot',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'screenshotId',
              in: 'path',
              required: true,
              description: 'Screenshot ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Screenshot deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Message' }
                }
              }
            },
            404: {
              description: 'Screenshot not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/screenshots/activity/{activityId}/link': {
        post: {
          tags: ['Screenshots'],
          summary: 'Link screenshots to activity',
          description: 'Link multiple screenshots to a specific activity',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'activityId',
              in: 'path',
              required: true,
              description: 'Activity ID',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    screenshotIds: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['screenshot-1', 'screenshot-2']
                    }
                  },
                  required: ['screenshotIds']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Screenshots linked successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Screenshots linked successfully' },
                      linkedCount: { type: 'integer', example: 2 }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Activity not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      // Analytics endpoints
      '/analytics/time-tracking': {
        get: {
          tags: ['Analytics'],
          summary: 'Get time tracking analytics',
          description: 'Get comprehensive time tracking analytics with filters',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date for analytics',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date for analytics',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'employeeId',
              in: 'query',
              description: 'Filter by employee ID',
              schema: { type: 'string' }
            },
            {
              name: 'projectId',
              in: 'query',
              description: 'Filter by project ID',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Time tracking analytics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Analytics' }
                }
              }
            }
          }
        }
      },
      '/analytics/employee-summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Get employee summary',
          description: 'Get time summary for specific employee',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'employeeId',
              in: 'query',
              description: 'Employee ID',
              schema: { type: 'string' }
            },
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            200: {
              description: 'Employee time summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      employeeId: { type: 'string' },
                      employeeName: { type: 'string' },
                      totalHours: { type: 'number' },
                      totalSessions: { type: 'integer' },
                      averageSessionLength: { type: 'number' },
                      projectBreakdown: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            projectId: { type: 'string' },
                            projectName: { type: 'string' },
                            hours: { type: 'number' },
                            percentage: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/analytics/project-summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Get project summary',
          description: 'Get time summary for specific project',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'projectId',
              in: 'query',
              description: 'Project ID',
              schema: { type: 'string' }
            },
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            200: {
              description: 'Project time summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      projectId: { type: 'string' },
                      projectName: { type: 'string' },
                      totalHours: { type: 'number' },
                      totalSessions: { type: 'integer' },
                      employeeBreakdown: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            employeeId: { type: 'string' },
                            employeeName: { type: 'string' },
                            hours: { type: 'number' },
                            percentage: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/analytics/daily-summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Get daily summary',
          description: 'Get daily time tracking summary',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              description: 'Start date',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'End date',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            200: {
              description: 'Daily time summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      dailyBreakdown: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date' },
                            totalHours: { type: 'number' },
                            totalSessions: { type: 'integer' },
                            totalScreenshots: { type: 'integer' },
                            activeEmployees: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Download endpoints
      '/downloads/desktop-app': {
        get: {
          tags: ['Downloads'],
          summary: 'Download desktop app',
          description: 'Download the latest version of the desktop application',
          responses: {
            200: {
              description: 'Desktop app file',
              content: {
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            },
            404: {
              description: 'Desktop app not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/downloads/desktop-app/info': {
        get: {
          tags: ['Downloads'],
          summary: 'Get desktop app info',
          description: 'Get information about the latest desktop app version',
          responses: {
            200: {
              description: 'Desktop app information',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DownloadInfo' }
                }
              }
            },
            404: {
              description: 'Desktop app not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

export const specs = swaggerJsdoc(options); 