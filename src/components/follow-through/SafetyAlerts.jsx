import React from 'react';
import { AlertTriangle, Focus, CalendarClock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SafetyAlerts({ openCount, staleTasks, onFocusTop3, onRescheduleStale }) {
  if (openCount <= 7 && (!staleTasks || staleTasks.length === 0)) return null;

  return (
    <div className="px-4 mb-4 space-y-3">
      {openCount > 7 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">Things are piling up.</p>
              <p className="text-xs text-amber-700 mt-1">
                You have {openCount} open tasks. Consider focusing on what matters most.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs h-8 rounded-lg" onClick={onFocusTop3}>
                  <Focus className="w-3 h-3 mr-1" />
                  Focus Top 3
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}