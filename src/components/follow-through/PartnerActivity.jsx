import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, X } from 'lucide-react';
import { isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export default function PartnerActivity({ tasks, currentUserEmail }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('partner_activity_dismissed_ts') || '0'
  );

  // Find tasks added by someone else in the last 24h
  const recentPartnerTasks = tasks.filter(t => {
    if (!t.created_date) return false;
    if (t.created_by === currentUserEmail) return false;
    const created = new Date(t.created_date);
    const msSince = Date.now() - created.getTime();
    return msSince < 24 * 60 * 60 * 1000;
  });

  if (recentPartnerTasks.length === 0) return null;

  // Dismiss key = latest task timestamp
  const latestTs = Math.max(...recentPartnerTasks.map(t => new Date(t.created_date).getTime()));
  if (parseInt(dismissed) >= latestTs) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('partner_activity_dismissed_ts', String(latestTs));
    setDismissed(String(latestTs));
  };

  const adder = recentPartnerTasks[0].created_by?.split('@')[0] || 'Your partner';
  const count = recentPartnerTasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3"
    >
      <Users className="w-5 h-5 text-blue-500 shrink-0" />
      <p className="flex-1 text-sm font-medium text-blue-900">
        {adder} added {count === 1 ? 'something' : `${count} things`} — quick look?
      </p>
      <button onClick={handleDismiss} className="text-blue-400 hover:text-blue-600 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}