
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useData } from '../DataContext';

const DistributionChart: React.FC = () => {
  const { visits } = useData();

  // Calculate real distribution from visits
  const stats = visits.reduce((acc, visit) => {
    const type = visit.meetingType || 'Physique'; // Default to Physique for old data
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = visits.length;

  const data = [
    { name: 'Physique', value: stats['Physique'] || 0, color: '#e64c19', icon: 'groups' }, // Primary
    { name: 'Zoom', value: stats['Zoom'] || 0, color: '#3b82f6', icon: 'videocam' }, // Blue
    { name: 'Hybride', value: stats['Hybride'] || 0, color: '#10b981', icon: 'present_to_all' }, // Green
  ].filter(d => d.value > 0);

  // Calculate percentages
  const dataWithPercent = data.map(d => ({
    ...d,
    percent: total > 0 ? Math.round((d.value / total) * 100) : 0
  }));

  if (total === 0) {
      return (
        <section className="px-4">
            <h3 className="text-lg font-bold tracking-tight mb-3 text-gray-900 dark:text-white">Répartition</h3>
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center shadow-sm text-center h-[160px] md:h-[180px]">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-gray-300 dark:text-white/20 text-2xl">pie_chart</span>
                </div>
                <p className="text-gray-500 dark:text-text-secondary text-xs font-medium">Pas assez de données.</p>
            </div>
        </section>
      )
  }

  return (
    <section className="px-4">
      <h3 className="text-lg font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Répartition</h3>
      <div className="bg-white dark:bg-card-dark rounded-2xl p-4 border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-lg h-[200px]">
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height={144}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-gray-400 dark:text-text-secondary uppercase font-bold tracking-wider">Total</span>
            <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{total}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 flex-1 ml-10 justify-center">
          {dataWithPercent.map((item) => (
            <div key={item.name} className="flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">{item.name}</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-semibold">{item.value} visites</span>
                </div>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DistributionChart;
