import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Calendar, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSnoozeDate } from '@/lib/taskUtils';

export default function SnoozeMenu({ onSnooze, onClose }) {
  const [customDate, setCustomDate] = useState('');

  const options = [
    { key: 'tomorrow', label: 'Tomorrow', icon: Sun },
    { key: 'weekend', label: 'This Weekend', icon: Calendar },
    { key: 'nextweek', label: 'Next Week', icon: ArrowRight },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="absolute bottom-full right-0 mb-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
    >
      <div className="p-2 space-y-1">
        {options.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onSnooze(getSnoozeDate(key))}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
            {label}
          </button>
        ))}
      </div>
      <div className="border-t border-border p-2">
        <div className="flex gap-2">
          <Input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="h-9 text-sm rounded-lg flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => customDate && onSnooze(customDate)}
            disabled={!customDate}
            className="h-9 rounded-lg"
          >
            Set
          </Button>
        </div>
      </div>
    </motion.div>
  );
}