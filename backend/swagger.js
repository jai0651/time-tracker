import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insightful Time Tracking API',
      version: '1.0.0',
      description: 'API for managing employees, projects, tasks, shifts, activities, and shared settings in a time tracking system',
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
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            teamId: { type: 'string', example: 'team-1' },
            sharedSettingsId: { type: 'string', example: 'settings-1' },
            organizationId: { type: 'string', example: 'org-1' },
            invited: { type: 'string', format: 'date-time' },
            deactivated: { type: 'string', format: 'date-time', nullable: true },
            sharedSettings: { $ref: '#/components/schemas/SharedSettings' },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' }
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
            id: { type: 'integer', example: 1 },
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
            organizationId: { type: 'string', example: 'org-1' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employees: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' }
            }
          },
          required: ['name', 'organizationId']
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Design Homepage' },
            projectId: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Create new homepage design' },
            status: { type: 'string', example: 'pending', enum: ['pending', 'in-progress', 'completed'] },
            priority: { type: 'string', example: 'medium', enum: ['low', 'medium', 'high'] },
            billable: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            project: { $ref: '#/components/schemas/Project' },
            employees: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' }
            }
          },
          required: ['name', 'projectId']
        },
        Shift: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'shift-1' },
            employeeId: { type: 'integer', example: 1 },
            teamId: { type: 'string', example: 'team-1' },
            token: { type: 'string', example: 'token-123' },
            type: { type: 'string', example: 'work' },
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time', nullable: true },
            duration: { type: 'integer', example: 28800000 },
            timezoneOffset: { type: 'integer', example: -300 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employee: { $ref: '#/components/schemas/Employee' },
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
            employeeId: { type: 'integer', example: 1 },
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
                    sharedSettingsId: { type: 'string', example: 'settings-1' }
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
                      items: { type: 'integer' }
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
              schema: { type: 'integer' }
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
                    projectId: { type: 'integer', example: 1 },
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
                      items: { type: 'integer' }
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
              schema: { type: 'integer' }
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
                    employeeId: { type: 'integer', example: 1 },
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
              schema: { type: 'integer' }
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
              schema: { type: 'integer' }
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
      }
    }
  },
  apis: []
};

export const specs = swaggerJsdoc(options); 