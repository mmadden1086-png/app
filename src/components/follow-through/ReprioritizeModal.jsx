import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, X, Star, CalendarClock, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';

export default function ReprioritizeModal({ open, onClose, openTasks }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleKeepTop3 = async () => {
    const sorted = [...openTasks];
    for (let i = 3; i < sorted.length; i++) {
      await updateMutation.mutateAsync({ id: sorted[i].id, data: { urgency: 'This Week' } });
    }
    onClose();
  };

  const handlePushToWeek = async () => {
    const sorted = [...openTasks];
    for (let i = 1; i < sorted.length; i++) {
      const nextWeek = format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7), 'yyyy-MM-dd');
      await updateMutation.mutateAsync({ id: sorted[i].id, data: { snoozed_until: nextWeek } });
    }
    onClose();
  };

  const handleResetToday = async () => {
    for (const task of openTasks) {
      await updateMutation.mutateAsync({ id: task.id, data: { urgency: 'Today', snoozed_until: '' } });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Reprioritize</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              You have {openTasks.length} open tasks. Life changes — reset what matters now.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleKeepTop3}
                className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <Star className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Keep Top 3</p>
                  <p className="text-xs text-muted-foreground">Move everything else to This Week</p>
                </div>
              </button>

              <button
                onClick={handlePushToWeek}
                className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <CalendarClock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Push Rest to Next Week</p>
                  <p className="text-xs text-muted-foreground">Focus only on the top task today</p>
                </div>
              </button>

              <button
                onClick={handleResetToday}
                className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <SkipForward className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Reset — All Today</p>
                  <p className="text-xs text-muted-foreground">Pull everything back and start fresh</p>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}