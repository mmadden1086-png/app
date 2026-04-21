import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, X, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function EveningWrapUp({ openTasks, onDismiss }) {
  const hour = new Date().getHours();
  const isEvening = hour >= 18 && hour < 24;
  const queryClient = useQueryClient();

  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('evening_dismissed') === new Date().toDateString()
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (!isEvening || openTasks.length === 0 || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('evening_dismissed', new Date().toDateString());
    setDismissed(true);
    onDismiss?.();
  };

  const handleMoveToTomorrow = (task) => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    updateMutation.mutate({ id: task.id, data: { snoozed_until: tomorrow } });
  };

  const topTasks = openTasks.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3 bg-primary/5 border border-primary/20 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm text-foreground">
            {openTasks.length} still open. Quick win before tomorrow?
          </p>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {topTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-2 bg-card rounded-xl px-3 py-2">
            <p className="text-sm font-medium truncate flex-1">{task.title}</p>
            <button
              onClick={() => handleMoveToTomorrow(task)}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0 flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Tomorrow
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}