import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTimeContext, getTaskDerivedProps, CATEGORY_CONFIG } from '@/lib/taskUtils';
import SnoozeMenu from './SnoozeMenu';

export default function DoThisNext({ task, onComplete, onSnooze, currentUser }) {
  const ref = useRef(null);
  const [showSnooze, setShowSnooze] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [task?.id]);

  if (!task) return null;

  const { isOverdue, overdueDays } = getTaskDerivedProps(task);
  const timeContext = getTimeContext(task);

  const getBehaviorLine = () => {
    if (isOverdue) return '🔴 This is slipping';
    if (task.urgency === 'Today') return '🟡 Handle this today';
    return '🟢 Needs attention now';
  };

  const ownership = task.requested_by
    ? `Requested by ${task.requested_by}`
    : 'You added this';

  return (
    <div ref={ref} className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Do This Next</h2>
      </div>

      <motion.div
        layout
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative rounded-2xl p-5 shadow-md border-2 ${
          isOverdue
            ? 'bg-red-50 border-red-200'
            : 'bg-card border-primary/20'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs font-medium ${isOverdue ? 'text-red-700' : 'text-muted-foreground'}`}>
                {timeContext}
              </span>
              {task.category && CATEGORY_CONFIG[task.category] && (
                <span className="text-xs">{CATEGORY_CONFIG[task.category].icon}</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-1">{ownership}</p>
        <p className="text-sm font-medium mb-4">{getBehaviorLine()}</p>

        {task.clarity && (
          <p className="text-xs text-muted-foreground mb-4 italic">
            Done = {task.clarity}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => onComplete(task)}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            <Check className="w-5 h-5 mr-2" />
            Done
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowSnooze(!showSnooze)}
              className="h-12 px-4 rounded-xl"
            >
              <Clock className="w-5 h-5" />
            </Button>
            <AnimatePresence>
              {showSnooze && (
                <SnoozeMenu
                  onSnooze={(date) => {
                    onSnooze(task, date);
                    setShowSnooze(false);
                  }}
                  onClose={() => setShowSnooze(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}