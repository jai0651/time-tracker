import React from 'react';
import { Text, Heading, Flex, Badge } from '@radix-ui/themes';

const AnalyticsTable = ({ activities, analytics, onPagination, filters, formatDuration }) => {
  if (!activities) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Heading size="4" className="mb-4">Activities</Heading>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Employee</th>
              <th className="text-left p-2">Project</th>
              <th className="text-left p-2">Task</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">End</th>
              <th className="text-left p-2">Duration</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <Text size="2">{activity.employee?.name}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">{activity.shift?.project?.name || 'No Project'}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">{activity.shift?.task?.name || 'No Task'}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">{new Date(activity.start).toLocaleString()}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">
                    {activity.end ? new Date(activity.end).toLocaleString() : 'Active'}
                  </Text>
                </td>
                <td className="p-2">
                  <Text size="2">{formatDuration(activity.duration)}</Text>
                </td>
                <td className="p-2">
                  <Badge color={activity.end ? 'green' : 'orange'}>
                    {activity.end ? 'Completed' : 'Active'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {analytics?.pagination && (
        <Flex justify="between" align="center" className="mt-4">
          <button
            onClick={() => onPagination('prev')}
            disabled={filters.offset === 0}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <Text size="2" color="gray">
            Showing {filters.offset + 1} - {Math.min(filters.offset + filters.limit, analytics.pagination.total)} of {analytics.pagination.total}
          </Text>
          
          <button
            onClick={() => onPagination('next')}
            disabled={!analytics.pagination.hasMore}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </Flex>
      )}
    </div>
  );
};

export default AnalyticsTable; 