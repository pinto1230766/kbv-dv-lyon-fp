import React, { useMemo } from 'react';
import { useData } from '../DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdvancedStats: React.FC = () => {
  const { visits, speakers, hosts } = useData();

  // Visites par mois
  const visitsByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    
    visits.forEach(v => {
      const month = v.date.substring(0, 7); // YYYY-MM
      counts[month] = (counts[month] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // 12 derniers mois
  }, [visits]);

  // Visites par congrégation
  const visitsByCongregation = useMemo(() => {
    const counts: Record<string, number> = {};
    
    visits.forEach(v => {
      counts[v.congregation] = (counts[v.congregation] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([congregation, count]) => ({ congregation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [visits]);

  // Orateurs les plus actifs
  const topSpeakers = useMemo(() => {
    const counts: Record<string, number> = {};
    
    visits.forEach(v => {
      if (v.speakerName) {
        counts[v.speakerName] = (counts[v.speakerName] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [visits]);

  // Répartition par statut
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'Confirmed': 0,
      'Pending': 0,
      'Cancelled': 0,
      'New': 0
    };
    
    visits.forEach(v => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [visits]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-black text-gray-900 dark:text-white">Statistiques Avancées</h2>

      {/* Visites par mois */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Visites par Mois</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={visitsByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="count" fill="#e64c19" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top congrégations */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Top Congrégations</h3>
          <div className="space-y-3">
            {visitsByCongregation.map((item, index) => (
              <div key={item.congregation} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{item.congregation}</p>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(item.count / visitsByCongregation[0].count) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top orateurs */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Orateurs les Plus Actifs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topSpeakers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedStats;
