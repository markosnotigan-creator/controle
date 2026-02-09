import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'green' | 'red' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'slate' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};