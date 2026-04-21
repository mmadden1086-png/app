import React from 'react';
import { ListChecks } from 'lucide-react';
import TaskCard from './TaskCard';

export default function OpenTasks({ tasks, onComplete, onSnooze, onEdit }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ListChecks className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Open Tasks ({tasks.length})
        </h2>
      </div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onSnooze={onSnooze}
            onEdit={onEdit}
            rank={i}
            dimmed={i >= 3}
          />
        ))}
      </div>
    </div>
  );
}