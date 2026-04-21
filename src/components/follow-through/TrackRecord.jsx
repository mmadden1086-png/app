import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

function getStats(tasks) {
  const completed = tasks.filter(t => t.completed_at);
  const open = tasks.filter(t => !t.completed_at);

  const totalCompleted = completed.length;
  const openCount = open.length;

  const completionTimes = completed
    .filter(t => t.created_date)
    .map(t => differenceInDays(new Date(t.completed_at), new Date(t.created_date)));

  const avgDays = completionTimes.length > 0
    ? (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
    : 0;

  const onTime = completed.filter(t => {
    if (!t.due_date) return true;
    return new Date(t.completed_at) <= new Date(t.due_date + 'T23:59:59');
  }).length;

  const onTimePct = totalCompleted > 0 ? Math.round((onTime / totalCompleted) * 100) : 0;
  const latePct = totalCompleted > 0 ? 100 - onTimePct : 0;

  const reliabilityScore = totalCompleted > 0
    ? Math.min(100, Math.round(onTimePct * 0.7 + Math.max(0, 30 - (openCount * 3))))
    : 0;

  let interpretation = 'Keep going';
  if (reliabilityScore >= 80) interpretation = 'Strong follow-through 💪';
  else if (reliabilityScore >= 60) interpretation = "You're improving 📈";
  else if (reliabilityScore >= 40) interpretation = 'Needs attention ⚠️';
  else interpretation = 'Let\'s reset and focus 🎯';

  return { totalCompleted, avgDays, openCount, reliabilityScore, onTimePct, latePct, interpretation };
}

export default function TrackRecord({ tasks }) {
  const stats = getStats(tasks);

  const statCards = [
    { label: 'Completed', value: stats.totalCompleted, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Avg Days', value: stats.avgDays, icon: Clock, color: 'text-blue-600' },
    { label: 'Open', value: stats.openCount, icon: AlertCircle, color: 'text-amber-600' },
    { label: 'Reliability', value: `${stats.reliabilityScore}%`, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Track Record</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">On-time {stats.onTimePct}% · Late {stats.latePct}%</p>
          <p className="font-semibold mt-1">{stats.interpretation}</p>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center">
          <span className="text-xs font-bold">{stats.reliabilityScore}</span>
        </div>
      </div>
    </div>
  );
}