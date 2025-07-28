import React from 'react';
import { Button, Text, Heading, Flex } from '@radix-ui/themes';

const ScreenshotFilters = ({ 
  filters, 
  onFilterChange, 
  onDateRangeChange, 
  onClearFilters,
  dateRange,
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
                {employee.name} ({employee.email})
              </option>
            ))}
          </select>
        </div>

        {/* Permission Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Permission Status</Text>
          <select
            value={filters.hasPermissions}
            onChange={(e) => onFilterChange('hasPermissions', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Screenshots</option>
            <option value="true">With Permissions</option>
            <option value="false">Without Permissions</option>
          </select>
        </div>

        {/* File Size Filter */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Min File Size (KB)</Text>
          <input
            type="number"
            value={filters.minFileSize || ''}
            onChange={(e) => onFilterChange('minFileSize', e.target.value)}
            placeholder="0"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Sort By */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Sort By</Text>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="capturedAt">Capture Date</option>
            <option value="fileSize">File Size</option>
            <option value="fileName">File Name</option>
            <option value="employeeName">Employee Name</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <Text size="2" className="block mb-2 font-medium">Sort Order</Text>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange('sortOrder', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
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
          {analytics?.pagination?.total || 0} total screenshots
        </Text>
      </Flex>
    </div>
  );
};

export default ScreenshotFilters; 