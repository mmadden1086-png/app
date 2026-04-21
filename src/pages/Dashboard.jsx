import React, { useState, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import AppHeader from '@/components/follow-through/AppHeader';
import QuickAdd from '@/components/follow-through/QuickAdd';
import DoThisNext from '@/components/follow-through/DoThisNext';
import NeedsAttention from '@/components/follow-through/NeedsAttention';
import OpenTasks from '@/components/follow-through/OpenTasks';
import FutureTasks from '@/components/follow-through/FutureTasks';
import SnoozedTasks from '@/components/follow-through/SnoozedTasks';
import CompletedTasks from '@/components/follow-through/CompletedTasks';
import SafetyAlerts from '@/components/follow-through/SafetyAlerts';
import BottomNav from '@/components/follow-through/BottomNav';
import MorningBanner from '@/components/follow-through/MorningBanner';
import EveningWrapUp from '@/components/follow-through/EveningWrapUp';
import MicroWins from '@/components/follow-through/MicroWins';
import PartnerActivity from '@/components/follow-through/PartnerActivity';
import SnoozeAbuse from '@/components/follow-through/SnoozeAbuse';
import ReprioritizeModal from '@/components/follow-through/ReprioritizeModal';
import PartnerCloseLoop from '@/components/follow-through/PartnerCloseLoop';

import {
  sortByPriority, isOpenTask, isSnoozed, isCompleted,
  isFutureTask, isNear, needsAttention
} from '@/lib/taskUtils';


export default function Dashboard() {
  const [focusMode, setFocusMode] = useState(false);
  const [morningDismissed, setMorningDismissed] = useState(false);
  const [showReprioritize, setShowReprioritize] = useState(false);
  const [closeLoopTask, setCloseLoopTask] = useState(null);
  const doThisNextEl = React.useRef(null);

  const scrollToDoThisNext = () => {
    doThisNextEl.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 200),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const completeMutation = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, {
      completed_at: new Date().toISOString(),
    }),
    onSuccess: (_, task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const msgs = ['Handled.', 'That mattered.', 'Done and done.', 'Nice.'];
      toast(msgs[Math.floor(Math.random() * msgs.length)], { duration: 1500 });
      // Trigger close loop if someone else requested it
      if (task.requested_by) {
        setCloseLoopTask(task);
      }
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ task, date }) => base44.entities.Task.update(task.id, { snoozed_until: date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast('Snoozed.', { duration: 1500 });
    },
  });

  const handleComplete = (task) => completeMutation.mutate(task);
  const handleSnooze = (task, date) => snoozeMutation.mutate({ task, date });
  const handleEdit = (task) => navigate(`/edit/${task.id}`);

  const { topTask, attentionTasks, openTasks, futureTasks, snoozedTasks, completedTasks, openCount, allOpenTasks } = useMemo(() => {
    const open = tasks.filter(isOpenTask);
    const nearTasks = open.filter(isNear);
    const sorted = sortByPriority(nearTasks);

    return {
      topTask: sorted[0] || null,
      attentionTasks: sorted.filter(needsAttention).filter(t => t.id !== sorted[0]?.id),
      openTasks: sorted.filter(t => t.id !== sorted[0]?.id && !needsAttention(t)),
      futureTasks: open.filter(isFutureTask),
      snoozedTasks: tasks.filter(isSnoozed),
      completedTasks: tasks.filter(isCompleted).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)),
      openCount: open.length,
      allOpenTasks: sorted,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode(!focusMode)}
        onReprioritize={() => setShowReprioritize(true)}
        openCount={openCount}
      />

      <div className="max-w-lg mx-auto">
        <QuickAdd />

        {/* Smart nudge banners */}
        {!morningDismissed && (
          <MorningBanner
            openCount={openCount}
            topTaskTitle={topTask?.title}
            onDismiss={() => setMorningDismissed(true)}
            onScrollToNext={scrollToDoThisNext}
          />
        )}

        <PartnerActivity
          tasks={tasks}
          currentUserEmail={currentUser?.email}
        />

        <SnoozeAbuse tasks={tasks} />

        <EveningWrapUp
          openTasks={allOpenTasks}
          onDismiss={() => {}}
        />

        <MicroWins completedTasks={completedTasks} />

        <div ref={doThisNextEl}>
          {topTask ? (
            <DoThisNext
              task={topTask}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
            />
          ) : (
            <div className="mx-4 mb-4 bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-3xl mb-3">✨</p>
              <p className="font-bold text-lg text-foreground">You're clear.</p>
              <p className="text-sm text-muted-foreground mt-1">Nothing needs attention right now.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">That's rare. Keep it that way.</p>
            </div>
          )}
        </div>

        {!focusMode && (
          <>
            <SafetyAlerts
              openCount={openCount}
              staleTasks={attentionTasks}
              onFocusTop3={() => setFocusMode(true)}
            />

            <NeedsAttention
              tasks={attentionTasks}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
              onEdit={handleEdit}
            />

            <OpenTasks
              tasks={openTasks}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
              onEdit={handleEdit}
            />

            <FutureTasks tasks={futureTasks} />
            <SnoozedTasks tasks={snoozedTasks} />
            <CompletedTasks tasks={completedTasks} />
          </>
        )}
      </div>

      <ReprioritizeModal
        open={showReprioritize}
        onClose={() => setShowReprioritize(false)}
        openTasks={allOpenTasks}
      />

      <AnimatePresence>
        {closeLoopTask && (
          <PartnerCloseLoop
            task={closeLoopTask}
            requestedBy={closeLoopTask.requested_by}
            onDismiss={() => setCloseLoopTask(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}