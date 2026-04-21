import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function SnoozedTasks({ tasks }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const unsnoozeMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.update(id, { snoozed_until: '' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 w-full"
      >
        <Moon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Snoozed ({tasks.length})
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
                    Back on {format(parseISO(task.snoozed_until), 'MMM d')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unsnoozeMutation.mutate(task.id)}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Bring Back
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}