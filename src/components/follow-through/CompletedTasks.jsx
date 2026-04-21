import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { getCompletionTime } from '@/lib/taskUtils';

export default function CompletedTasks({ tasks }) {
  const [expanded, setExpanded] = useState(false);

  if (!tasks || tasks.length === 0) return null;

  const recent = tasks.slice(0, 20);

  return (
    <div className="px-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 w-full"
      >
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Completed ({tasks.length})
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
            {recent.map((task) => (
              <div key={task.id} className="bg-card border border-border rounded-xl p-3 opacity-70">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm line-through text-muted-foreground">{task.title}</p>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs text-muted-foreground">
                      {task.completed_at ? format(new Date(task.completed_at), 'MMM d') : ''}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      {getCompletionTime(task)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}