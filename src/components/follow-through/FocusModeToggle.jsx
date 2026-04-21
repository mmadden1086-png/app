import React from 'react';
import { Focus } from 'lucide-react';

export default function FocusModeToggle({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      <Focus className="w-3.5 h-3.5" />
      {active ? 'Exit Focus' : 'Focus'}
    </button>
  );
}