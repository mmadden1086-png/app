import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, ChevronRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function FutureTasks({ tasks }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 w-full"
      >
        <CalendarClock className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Future ({tasks.length})
        </h2>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {tasks.map((task) => (
              <div key={task.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.due_date ? `Due ${format(parseISO(task.due_date), 'MMM d')}` : 'No date set'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: task.id, data: { urgency: 'Today', due_date: format(new Date(), 'yyyy-MM-dd') } })}
                  className="text-xs"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  Move Up
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}