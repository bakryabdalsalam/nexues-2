import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { format } from 'date-fns';

interface ReportConfig {
  type: 'users' | 'applications' | 'jobs';
  dateRange: 'week' | 'month' | 'year' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  startDate?: Date;
  endDate?: Date;
}

export const ReportGenerator = () => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'jobs',
    dateRange: 'month',
    format: 'pdf'
  });

  const generateMutation = useMutation({
    mutationFn: async (reportConfig: ReportConfig) => {
      const blob = await adminApi.generateReport(reportConfig.type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportConfig.type}-${format(new Date(), 'yyyy-MM-dd')}.${reportConfig.format}`;
      a.click();
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-6">Generate Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value as ReportConfig['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="jobs">Jobs Report</option>
              <option value="applications">Applications Report</option>
              <option value="users">Users Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <select
              value={config.dateRange}
              onChange={(e) => setConfig({ ...config, dateRange: e.target.value as ReportConfig['dateRange'] })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Format
            </label>
            <select
              value={config.format}
              onChange={(e) => setConfig({ ...config, format: e.target.value as ReportConfig['format'] })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <button
            onClick={() => generateMutation.mutate(config)}
            disabled={generateMutation.isPending}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Report Preview</h3>
          <div className="text-sm text-gray-500">
            <p>Type: {config.type}</p>
            <p>Range: {config.dateRange}</p>
            <p>Format: {config.format}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
