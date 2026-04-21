import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp, Mic, Zap } from 'lucide-react';
import { parseSmartInput } from '@/lib/taskUtils';
import { motion, AnimatePresence } from 'framer-motion';
import QuickAddDetails from './QuickAddDetails';
import { toast } from 'sonner';

export default function QuickAdd() {
  const [title, setTitle] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState({});
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
      setDetails({});
      setShowDetails(false);
      inputRef.current?.focus();
      toast('Locked in.', { duration: 1500 });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    const parsed = parseSmartInput(title);
    const taskData = {
      ...parsed,
      urgency: details.urgency || 'Today',
      effort: details.effort || 'Medium',
      category: details.category || '',
      notes: details.notes || '',
      clarity: details.clarity || '',
      why_this_matters: details.why_this_matters || '',
      due_date: details.due_date || parsed.due_date || '',
      due_time: details.due_time || parsed.due_time || '',
      is_flexible: details.is_flexible ?? true,
      repeat: details.repeat || 'none',
      requested_by: details.requested_by || '',
    };
    createMutation.mutate(taskData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pt-2 pb-3">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="What needs to happen?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 text-base border-0 bg-muted/50 rounded-xl pl-4 pr-4 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || createMutation.isPending}
              className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold shrink-0"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Lock It In
            </Button>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showDetails ? 'Less' : 'Add Details'}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <QuickAddDetails details={details} onChange={setDetails} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}