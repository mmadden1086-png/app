import React from 'react';
import { AlertTriangle } from 'lucide-react';
import TaskCard from './TaskCard';

export default function NeedsAttention({ tasks, onComplete, onSnooze, onEdit }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">
          Needs Attention ({tasks.length})
        </h2>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onSnooze={onSnooze}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}