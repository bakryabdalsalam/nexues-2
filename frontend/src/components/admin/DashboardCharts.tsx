import { useQuery } from '@tanstack/react-query';
import { Line, Bar } from 'react-chartjs-2';
import { analyticsApi } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const DashboardCharts = () => {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getAnalytics
  });

  const applicationsData = {
    labels: analytics?.applicationsByDay.map(d => d.date) || [],
    datasets: [
      {
        label: 'Applications',
        data: analytics?.applicationsByDay.map(d => d.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const jobsByCategory = {
    labels: analytics?.jobsByCategory.map(d => d.category) || [],
    datasets: [
      {
        label: 'Jobs by Category',
        data: analytics?.jobsByCategory.map(d => d.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Applications Trend</h3>
        <Line data={applicationsData} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Jobs by Category</h3>
        <Bar data={jobsByCategory} />
      </div>
    </div>
  );
};
