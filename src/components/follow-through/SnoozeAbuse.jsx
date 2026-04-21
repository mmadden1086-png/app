import React from 'react';
import { AlertCircle, Trash2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// A task is "snooze abused" if it has been snoozed and its age is > 5 days
export default function SnoozeAbuse({ tasks }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // Find snoozed tasks that are also old (created more than 5 days ago)
  const abusedTasks = tasks.filter(t => {
    if (!t.snoozed_until || t.completed_at) return false;
    if (!t.created_date) return false;
    const ageDays = (Date.now() - new Date(t.created_date).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays > 5;
  });

  if (abusedTasks.length === 0) return null;

  return (
    <div className="mx-4 mb-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-700">You've moved {abusedTasks.length > 1 ? 'these' : 'this'} a few times — still needed?</p>
      </div>
      <div className="space-y-2">
        {abusedTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <p className="text-sm flex-1 truncate text-slate-700">{task.title}</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => updateMutation.mutate({ id: task.id, data: { urgency: 'Whenever', snoozed_until: '' } })}
            >
              <ArrowDown className="w-3 h-3 mr-1" />
              Keep
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-500 hover:text-red-600"
              onClick={() => deleteMutation.mutate(task.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}