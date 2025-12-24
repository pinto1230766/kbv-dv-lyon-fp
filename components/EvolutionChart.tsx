
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid } from 'recharts';
import { useData } from '../DataContext';

const EvolutionChart: React.FC = () => {
  const { visits } = useData();
  const currentMonth = new Date().getMonth();

  // Helper to get month name (short)
  const getMonthName = (monthIndex: number) => {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleDateString('fr-FR', { month: 'short' });
  };

  // Generate data for the last 6 months (including current)
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(currentMonth - 5 + i); // Start 5 months ago
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const monthLabel = getMonthName(monthIndex);
    const labelCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

    // Count visits for this month/year
    const count = visits.filter(v => {
      const vDate = new Date(v.date);
      return vDate.getMonth() === monthIndex && vDate.getFullYear() === year;
    }).length;

    return {
      name: labelCapitalized,
      value: count,
      active: i === 5 // Mark current month as active
    };
  });

  return (
    <section className="px-4">
      <h3 className="text-lg font-bold tracking-tight mb-3 text-gray-900 dark:text-white">Évolution mensuelle</h3>
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 p-3 shadow-sm h-[140px] md:h-[160px]">
        <ResponsiveContainer width="100%" height={100}>
            <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e64c19" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e64c19" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(230, 76, 25, 0.05)', radius: 6 }}
                contentStyle={{ 
                    backgroundColor: 'rgba(28, 28, 30, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
                    padding: '8px 12px'
                }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                formatter={(value: number) => [`${value} visites`, 'Total']}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={28}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? 'url(#colorActive)' : 'url(#colorInactive)'} 
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default EvolutionChart;
