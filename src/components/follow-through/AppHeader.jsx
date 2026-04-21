import React from 'react';
import { Shuffle } from 'lucide-react';
import FocusModeToggle from './FocusModeToggle';

export default function AppHeader({ focusMode, onToggleFocus, onReprioritize, openCount }) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">Follow Through</h1>
          {openCount > 0 && (
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {openCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {openCount > 1 && (
            <button
              onClick={onReprioritize}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Reprioritize
            </button>
          )}
          <FocusModeToggle active={focusMode} onToggle={onToggleFocus} />
        </div>
      </div>
    </header>
  );
}