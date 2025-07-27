import React from 'react';
import { Text, Heading } from '@radix-ui/themes';

const AnalyticsSummary = ({ summary, formatDuration }) => {
  if (!summary) return null;

  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow">
      <Heading size="4" className="mb-4">Summary</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded">
          <Text size="6" className="font-bold text-blue-600">
            {summary.totalActivities}
          </Text>
          <Text size="2" color="gray">Total Activities</Text>
        </div>
        <div className="text-center p-4 bg-green-50 rounded">
          <Text size="6" className="font-bold text-green-600">
            {formatDuration(summary.totalDuration)}
          </Text>
          <Text size="2" color="gray">Total Time</Text>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded">
          <Text size="6" className="font-bold text-purple-600">
            {formatDuration(summary.billableDuration)}
          </Text>
          <Text size="2" color="gray">Billable Time</Text>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded">
          <Text size="6" className="font-bold text-orange-600">
            {summary.activeActivities}
          </Text>
          <Text size="2" color="gray">Active Activities</Text>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSummary; 