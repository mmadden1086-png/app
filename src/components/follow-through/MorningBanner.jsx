import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, X } from 'lucide-react';

export default function MorningBanner({ openCount, topTaskTitle, onDismiss }) {
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  if (!isMorning || openCount === 0) return null;

  const message = openCount === 1
    ? `1 thing needs attention today.`
    : `You've got ${openCount} open. Start with one.`;

  const sub = topTaskTitle ? `Start with: "${topTaskTitle}"` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
    >
      <Sun className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-amber-900 text-sm">{message}</p>
        {sub && <p className="text-xs text-amber-700 mt-0.5">{sub}</p>}
      </div>
      <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}