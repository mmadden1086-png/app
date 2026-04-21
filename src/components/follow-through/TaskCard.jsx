import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Check, Clock, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTimeContext, getTaskDerivedProps, CATEGORY_CONFIG, EFFORT_CONFIG, URGENCY_CONFIG, getAttentionMessage } from '@/lib/taskUtils';
import SnoozeMenu from './SnoozeMenu';

export default function TaskCard({ task, onComplete, onSnooze, onEdit, rank, dimmed }) {
  const [showSnooze, setShowSnooze] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const swipeThreshold = 100;
  const [swiping, setSwiping] = useState(null);

  const { isOverdue } = getTaskDerivedProps(task);
  const timeContext = getTimeContext(task);
  const attentionMsg = getAttentionMessage(task);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > swipeThreshold) {
      onComplete(task);
    } else if (info.offset.x < -swipeThreshold) {
      setShowSnooze(true);
    }
    setSwiping(null);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe backgrounds */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-emerald-500 flex items-center pl-5">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 bg-amber-500 flex items-center justify-end pr-5">
          <Clock className="w-5 h-5 text-white" />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        onDrag={(e, info) => {
          if (info.offset.x > 30) setSwiping('right');
          else if (info.offset.x < -30) setSwiping('left');
          else setSwiping(null);
        }}
        style={{ x }}
        className={`relative bg-card border border-border rounded-xl p-4 transition-opacity ${
          dimmed ? 'opacity-60' : ''
        } ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => onComplete(task)}
            className="mt-0.5 w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0 hover:border-primary hover:bg-primary/10 transition-all active:scale-90"
          >
            <Check className="w-3 h-3 text-transparent hover:text-primary" />
          </button>

          <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {task.urgency && URGENCY_CONFIG[task.urgency] && (
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${URGENCY_CONFIG[task.urgency].color}`}>
                  {task.urgency}
                </span>
              )}
              {task.category && CATEGORY_CONFIG[task.category] && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_CONFIG[task.category].color}`}>
                  {CATEGORY_CONFIG[task.category].icon} {task.category}
                </span>
              )}
              {task.effort && EFFORT_CONFIG[task.effort] && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${EFFORT_CONFIG[task.effort].color}`}>
                  {EFFORT_CONFIG[task.effort].label}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-foreground leading-snug">{task.title}</h3>

            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                {timeContext}
              </span>
              {task.requested_by && (
                <span className="text-xs text-muted-foreground">
                  · by {task.requested_by}
                </span>
              )}
            </div>

            {attentionMsg && (
              <p className="text-xs font-medium text-amber-600 mt-1">{attentionMsg}</p>
            )}

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {task.notes && <p>{task.notes}</p>}
                    {task.clarity && <p className="italic">Done = {task.clarity}</p>}
                    {task.why_this_matters && <p className="text-xs">💡 {task.why_this_matters}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showSnooze && (
            <div className="absolute right-4 top-4 z-50">
              <SnoozeMenu
                onSnooze={(date) => {
                  onSnooze(task, date);
                  setShowSnooze(false);
                }}
                onClose={() => setShowSnooze(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}