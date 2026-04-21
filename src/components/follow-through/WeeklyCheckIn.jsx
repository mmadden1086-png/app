import React from 'react';
import { Calendar, TrendingUp, AlertTriangle, Heart } from 'lucide-react';
import { startOfWeek, endOfWeek, isWithinInterval, differenceInDays } from 'date-fns';

function getWeeklyStats(tasks) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const completedThisWeek = tasks.filter(t =>
    t.completed_at && isWithinInterval(new Date(t.completed_at), { start: weekStart, end: weekEnd })
  );

  const missedThisWeek = tasks.filter(t =>
    !t.completed_at && t.due_date && new Date(t.due_date) < now &&
    isWithinInterval(new Date(t.due_date), { start: weekStart, end: weekEnd })
  );

  const completionTimes = completedThisWeek
    .filter(t => t.created_date)
    .map(t => differenceInDays(new Date(t.completed_at), new Date(t.created_date)));

  const avgTime = completionTimes.length > 0
    ? (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
    : 0;

  let message = '';
  if (missedThisWeek.length > 0) {
    message = `You missed ${missedThisWeek.length} task${missedThisWeek.length > 1 ? 's' : ''}. Talk about what got in the way.`;
  } else if (completedThisWeek.length >= 3) {
    message = 'You both showed up this week. 💚';
  } else if (completedThisWeek.length > 0) {
    message = 'Making progress. Keep the momentum.';
  } else {
    message = 'This week is still open. What can you knock out?';
  }

  return {
    completed: completedThisWeek.length,
    missed: missedThisWeek.length,
    avgTime,
    message,
  };
}

export default function WeeklyCheckIn({ tasks }) {
  const stats = getWeeklyStats(tasks);

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Weekly Check-In</h2>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.missed}</p>
            <p className="text-xs text-muted-foreground">Missed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.avgTime}d</p>
            <p className="text-xs text-muted-foreground">Avg Time</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-sm font-medium text-center">{stats.message}</p>
        </div>
      </div>
    </div>
  );
}