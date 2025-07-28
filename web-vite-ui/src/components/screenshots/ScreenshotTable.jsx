import React from 'react';
import { Text, Heading, Flex, Badge } from '@radix-ui/themes';

const ScreenshotTable = ({ screenshots, analytics, onPagination, filters, formatFileSize, onScreenshotClick }) => {
  if (!screenshots) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Heading size="4" className="mb-4">Screenshots</Heading>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Preview</th>
              <th className="text-left p-2">Employee</th>
              <th className="text-left p-2">File Name</th>
              <th className="text-left p-2">Captured At</th>
              <th className="text-left p-2">File Size</th>
              <th className="text-left p-2">Dimensions</th>
              <th className="text-left p-2">Permissions</th>
              <th className="text-left p-2">Activity</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {screenshots.map((screenshot) => (
              <tr key={screenshot.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <div className="w-16 h-12 border rounded overflow-hidden hover:border-blue-400 transition-colors">
                    <img
                      src={screenshot.imageUrl}
                      alt="Screenshot preview"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onScreenshotClick(screenshot)}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM2Qjc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div>
                    <Text size="2" weight="bold">{screenshot.employee?.name}</Text>
                    <Text size="1" color="gray">{screenshot.employee?.email}</Text>
                  </div>
                </td>
                <td className="p-2">
                  <Text size="2">{screenshot.fileName}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">{formatDate(screenshot.capturedAt)}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">{formatFileSize(screenshot.fileSize)}</Text>
                </td>
                <td className="p-2">
                  <Text size="2">{screenshot.width} × {screenshot.height}</Text>
                </td>
                <td className="p-2">
                  <Badge color={screenshot.hasPermissions ? "green" : "red"}>
                    {screenshot.hasPermissions ? '✅ Granted' : '❌ Denied'}
                  </Badge>
                  {screenshot.permissionError && (
                    <Text size="1" color="red" className="block mt-1">
                      {screenshot.permissionError}
                    </Text>
                  )}
                </td>
                <td className="p-2">
                  {screenshot.activity ? (
                    <div>
                      <Text size="2">{screenshot.activity.description || 'Work Activity'}</Text>
                      {screenshot.activity.shift?.project && (
                        <Text size="1" color="gray">
                          {screenshot.activity.shift.project.name}
                        </Text>
                      )}
                    </div>
                  ) : (
                    <Text size="2" color="gray">No Activity</Text>
                  )}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => onScreenshotClick(screenshot)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </button>
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

export default ScreenshotTable; 