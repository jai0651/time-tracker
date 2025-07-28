import React from 'react';
import { Text, Heading, Flex, Badge, Button } from '@radix-ui/themes';

const ScreenshotViewer = ({ screenshot, onClose }) => {
  if (!screenshot) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <Flex justify="between" align="center">
            <div>
              <Heading size="4">Screenshot Details</Heading>
              <Text size="2" color="gray">{screenshot.fileName}</Text>
            </div>
            <Button onClick={onClose} variant="outline">
              ✕ Close
            </Button>
          </Flex>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div>
              <Text size="2" weight="bold" className="mb-2">Screenshot Preview</Text>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={screenshot.imageUrl}
                  alt="Screenshot"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Qjc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <Text size="2" weight="bold" className="mb-4">Screenshot Information</Text>
              
              <div className="space-y-3">
                {/* Employee Info */}
                {screenshot.employee && (
                  <div>
                    <Text size="1" color="gray">Employee</Text>
                    <Text size="2" weight="bold">{screenshot.employee.name}</Text>
                    <Text size="1" color="gray">{screenshot.employee.email}</Text>
                  </div>
                )}

                {/* Activity Info */}
                {screenshot.activity && (
                  <div>
                    <Text size="1" color="gray">Activity</Text>
                    <Text size="2">{screenshot.activity.description || 'Work Activity'}</Text>
                    {screenshot.activity.shift?.project && (
                      <Text size="1" color="gray">
                        Project: {screenshot.activity.shift.project.name}
                      </Text>
                    )}
                    {screenshot.activity.shift?.task && (
                      <Text size="1" color="gray">
                        Task: {screenshot.activity.shift.task.name}
                      </Text>
                    )}
                  </div>
                )}

                {/* File Details */}
                <div>
                  <Text size="1" color="gray">File Details</Text>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Text size="1" color="gray">File Name</Text>
                      <Text size="2">{screenshot.fileName}</Text>
                    </div>
                    <div>
                      <Text size="1" color="gray">File Size</Text>
                      <Text size="2">{formatFileSize(screenshot.fileSize)}</Text>
                    </div>
                    <div>
                      <Text size="1" color="gray">Dimensions</Text>
                      <Text size="2">{screenshot.width} × {screenshot.height}</Text>
                    </div>
                    <div>
                      <Text size="1" color="gray">MIME Type</Text>
                      <Text size="2">{screenshot.mimeType}</Text>
                    </div>
                  </div>
                </div>

                {/* Capture Details */}
                <div>
                  <Text size="1" color="gray">Capture Details</Text>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Text size="1" color="gray">Captured At</Text>
                      <Text size="2">{formatDate(screenshot.capturedAt)}</Text>
                    </div>
                    <div>
                      <Text size="1" color="gray">Uploaded At</Text>
                      <Text size="2">{formatDate(screenshot.uploadedAt)}</Text>
                    </div>
                  </div>
                </div>

                {/* Permission Status */}
                <div>
                  <Text size="1" color="gray">Permission Status</Text>
                  <div className="flex items-center gap-2">
                    <Badge color={screenshot.hasPermissions ? "green" : "red"}>
                      {screenshot.hasPermissions ? '✅ Granted' : '❌ Denied'}
                    </Badge>
                    {screenshot.permissionError && (
                      <Text size="1" color="red">{screenshot.permissionError}</Text>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotViewer; 