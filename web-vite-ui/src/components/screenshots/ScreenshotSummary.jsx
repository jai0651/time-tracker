import React from 'react';
import { Text, Heading } from '@radix-ui/themes';

const ScreenshotSummary = ({ summary, formatFileSize }) => {
  if (!summary) return null;

  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow">
      <Heading size="4" className="mb-4">Summary</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded">
          <Text size="6" className="font-bold text-blue-600">
            {summary.totalScreenshots}
          </Text>
          <Text size="2" color="gray">Total Screenshots</Text>
        </div>
        <div className="text-center p-4 bg-green-50 rounded">
          <Text size="6" className="font-bold text-green-600">
            {summary.screenshotsWithPermissions}
          </Text>
          <Text size="2" color="gray">With Permissions</Text>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded">
          <Text size="6" className="font-bold text-purple-600">
            {summary.permissionRate.toFixed(1)}%
          </Text>
          <Text size="2" color="gray">Permission Rate</Text>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded">
          <Text size="6" className="font-bold text-orange-600">
            {formatFileSize(summary.totalFileSize)}
          </Text>
          <Text size="2" color="gray">Total Size</Text>
        </div>
      </div>
      
      {/* Employee Breakdown */}
      {summary.employeeStats && summary.employeeStats.length > 0 && (
        <div className="mt-6">
          <Heading size="3" className="mb-3">Employee Breakdown</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.employeeStats.map((employee) => (
              <div key={employee.employeeId} className="p-3 bg-gray-50 rounded">
                <Text size="2" weight="bold">{employee.employeeName}</Text>
                <Text size="1" color="gray">{employee.employeeEmail}</Text>
                <div className="flex justify-between mt-1">
                  <Text size="1">{employee.screenshotCount} screenshots</Text>
                  <Text size="1" color="gray">{formatFileSize(employee.totalFileSize)}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotSummary; 