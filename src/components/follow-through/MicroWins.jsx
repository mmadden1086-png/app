import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

export default function MicroWins({ completedTasks }) {
  const recent = completedTasks
    .filter(t => t.completed_at)
    .slice(0, 3);

  if (recent.length === 0) return null;

  const getWhenLabel = (task) => {
    const d = new Date(task.completed_at);
    if (isToday(d)) return 'today';
    if (isYesterday(d)) return 'yesterday';
    return format(d, 'MMM d');
  };

  return (
    <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Recently Handled</p>
      </div>
      <div className="space-y-1">
        {recent.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-800 line-through truncate flex-1">{task.title}</p>
            <p className="text-[10px] text-emerald-600 shrink-0">{getWhenLabel(task)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}