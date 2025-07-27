# Insightful API Implementation

This document outlines the implementation of the Insightful API spec for the time-tracking system.

## Overview

The API has been updated to conform exactly to the Insightful API specification, with the following endpoints implemented:

## 1. Employee API

### POST /employee
- **Purpose**: Create a new employee
- **Body**: `{ name: string; email?: string; teamId: string; sharedSettingsId?: string }`
- **Response**: `201` with full `Employee` JSON body
- **Validation**: Required fields, email uniqueness, unknown property rejection

### PUT /employee/:id
- **Purpose**: Update employee information
- **Body**: `{ name?, email?, teamId?, sharedSettingsId?, projects? }`
- **Response**: `200` with updated `Employee`
- **Validation**: Project ID validation, unknown property rejection

### POST /employee/deactivate/:id
- **Purpose**: Deactivate an employee
- **Response**: `200 { message: "Employee deactivated" }`
- **Business Logic**: Checks for active projects/tasks before deactivation

## 2. Project API

### POST /project
- **Purpose**: Create a new project
- **Body**: `{ name: string; description?: string; employees?: string[]; teams?: string[]; billable?: boolean; statuses?: string[]; priorities?: string[] }`
- **Response**: `201` with `Project` including assigned employees
- **Validation**: Employee ID validation, project name uniqueness per organization

### GET /project
- **Purpose**: List projects with filtering
- **Query Parameters**: `organizationId`, `teamId`, `limit`, `offset`
- **Response**: `200` with array of `Project` objects

### GET /project/:id
- **Purpose**: Get specific project
- **Response**: `200` with `Project` or `404`

### PUT /project/:id
- **Purpose**: Update project
- **Body**: Same as POST (all fields optional)
- **Response**: `200` with updated `Project`

### DELETE /project/:id
- **Purpose**: Delete project
- **Response**: `200 { message: "Project deleted" }`
- **Business Logic**: Prevents deletion if project has active tasks

## 3. Task API

### POST /task
- **Purpose**: Create a new task
- **Body**: `{ name: string; projectId: string; description?: string; employees?: string[]; status?: string; priority?: string; billable?: boolean }`
- **Response**: `201` with `Task` including project and employee details
- **Validation**: Project existence, employee ID validation

### GET /task
- **Purpose**: List tasks with filtering
- **Query Parameters**: `projectId`, `employeeId`, `limit`, `offset`
- **Response**: `200` with array of `Task` objects

### GET /task/:id
- **Purpose**: Get specific task
- **Response**: `200` with `Task` or `404`

### PUT /task/:id
- **Purpose**: Update task
- **Body**: Same as POST (all fields optional)
- **Response**: `200` with updated `Task`

### DELETE /task/:id
- **Purpose**: Delete task
- **Response**: `200 { message: "Task deleted" }`

## 4. Time-Tracking API

### Shifts

#### POST /shift
- **Purpose**: Start a new shift
- **Body**: `{ employeeId: string; teamId: string; token?: string; type?: string }`
- **Response**: `201` with `Shift` object
- **Business Logic**: 
  - Verifies employee is active (not deactivated)
  - Prevents multiple active shifts per employee
  - Records timezone offset from headers

#### PUT /shift/:id
- **Purpose**: End a shift
- **Body**: `{ end: number }` (milliseconds since epoch)
- **Response**: `200` with updated `Shift`
- **Business Logic**:
  - Prevents double-closing
  - Validates end time > start time
  - Computes and persists duration

#### GET /shift
- **Purpose**: List shifts with filtering
- **Query Parameters**: `employeeId`, `start`, `end`, `limit`, `offset`
- **Response**: `200` with array of `Shift` objects

#### GET /shift/:id
- **Purpose**: Get specific shift
- **Response**: `200` with `Shift` or `404`

### Activities

#### GET /activity
- **Purpose**: List activities with filtering
- **Query Parameters**: `shiftId`, `employeeId`, `start`, `end`, `limit`, `offset`
- **Response**: `200` with array of `Activity` objects

#### GET /activity/:id
- **Purpose**: Get specific activity
- **Response**: `200` with `Activity` or `404`

## Database Schema

### New Models

#### Employee
- `id`: Integer (auto-increment)
- `name`: String (required)
- `email`: String (optional, unique)
- `teamId`: String (required)
- `sharedSettingsId`: String (optional)
- `organizationId`: String (required)
- `invited`: DateTime (default: now)
- `deactivated`: DateTime (optional)
- Legacy fields for backward compatibility

#### Project
- `id`: Integer (auto-increment)
- `name`: String (required)
- `description`: String (optional)
- `teams`: String[] (array of team IDs)
- `billable`: Boolean (default: false)
- `statuses`: String[] (array of status options)
- `priorities`: String[] (array of priority options)
- `organizationId`: String (required)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Task
- `id`: Integer (auto-increment)
- `name`: String (required)
- `projectId`: Integer (foreign key)
- `description`: String (optional)
- `status`: String (default: 'pending')
- `priority`: String (default: 'medium')
- `billable`: Boolean (default: false)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Shift
- `id`: String (CUID)
- `employeeId`: Integer (foreign key)
- `teamId`: String (required)
- `token`: String (optional)
- `type`: String (optional)
- `start`: DateTime (default: now)
- `end`: DateTime (optional)
- `duration`: Integer (milliseconds, optional)
- `timezoneOffset`: Integer (minutes)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Activity
- `id`: String (CUID)
- `shiftId`: String (foreign key)
- `employeeId`: Integer (foreign key)
- `start`: DateTime (required)
- `end`: DateTime (optional)
- `duration`: Integer (milliseconds, optional)
- `description`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Validation & Error Handling

### Input Validation
- JSON Schema validation for all endpoints
- Required field validation
- Type validation (string, array, boolean, number)
- Unknown property rejection with `400` error

### Business Logic Validation
- Employee deactivation checks for active projects/tasks
- Project deletion checks for active tasks
- Shift creation prevents multiple active shifts
- Shift ending prevents double-closing
- Time validation (end > start)

### Error Responses
- `400 Bad Request`: Validation errors, business rule violations
- `404 Not Found`: Unknown IDs
- `409 Conflict`: Duplicate emails, project names
- `500 Internal Server Error`: Unhandled errors

## Pagination & Filtering

### Pagination
- `limit`: Number of records to return (default: 50)
- `offset`: Number of records to skip (default: 0)

### Filtering
- **Employees**: `organizationId`, `teamId`
- **Projects**: `organizationId`, `teamId`
- **Tasks**: `projectId`, `employeeId`
- **Shifts**: `employeeId`, `start`, `end`
- **Activities**: `shiftId`, `employeeId`, `start`, `end`

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Testing

Run the test script to verify API functionality:
```bash
node test-insightful-api.js
```

## Migration

The database migration handles:
- Adding new required columns with default values
- Creating new tables (Shift, Activity)
- Adding foreign key constraints
- Creating performance indexes
- Preserving existing data

## Backward Compatibility

- Legacy routes (`/employees`, `/projects`, `/tasks`) are maintained
- Legacy `TimeEntry` model is preserved
- Existing data is migrated with default values

## Next Steps

1. Add comprehensive unit tests for each endpoint
2. Implement rate limiting and security measures
3. Add API documentation (OpenAPI/Swagger)
4. Implement real-time notifications for shift events
5. Add bulk operations for efficiency 