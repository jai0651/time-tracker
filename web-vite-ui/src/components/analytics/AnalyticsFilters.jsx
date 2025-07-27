import React from 'react';
import { Button, Text, Heading, Flex } from '@radix-ui/themes';

const AnalyticsFilters = ({ 
  filters, 
  onFilterChange, 
  onDateRangeChange, 
  onClearFilters,
  dateRange,
  projects,
  tasks,
  employees,
  analytics
}) => {
  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow">
      <Heading size="4" className="mb-4">Filters</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Date Range Quick Select */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Date Range</Text>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>

        {/* Custom Date Range */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Start Date</Text>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <Text size="2" className="block mb-2 font-medium">End Date</Text>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Employee Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Employee</Text>
          <select
            value={filters.employeeId}
            onChange={(e) => onFilterChange('employeeId', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Employees</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Project</Text>
          <select
            value={filters.projectId}
            onChange={(e) => onFilterChange('projectId', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Task</Text>
          <select
            value={filters.taskId}
            onChange={(e) => onFilterChange('taskId', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Tasks</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Status</Text>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Billable Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Billable</Text>
          <select
            value={filters.billable}
            onChange={(e) => onFilterChange('billable', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All</option>
            <option value="true">Billable</option>
            <option value="false">Non-Billable</option>
          </select>
        </div>

        {/* Group By */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Group By</Text>
          <select
            value={filters.groupBy}
            onChange={(e) => onFilterChange('groupBy', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">No Grouping</option>
            <option value="employee">Employee</option>
            <option value="project">Project</option>
            <option value="task">Task</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      <Flex gap="3" justify="between" align="center">
        <Button 
          onClick={onClearFilters}
          variant="outline"
        >
          Clear Filters
        </Button>
        
        <Text size="2" color="gray">
          {analytics?.pagination?.total || 0} total activities
        </Text>
      </Flex>
    </div>
  );
};

export default AnalyticsFilters; 