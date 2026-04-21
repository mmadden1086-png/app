import { differenceInDays, differenceInHours, differenceInMinutes, format, isToday, isTomorrow, isAfter, isBefore, addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';

export function getTaskDerivedProps(task) {
  const now = new Date();
  const today = startOfDay(now);
  
  const createdDate = task.created_date ? new Date(task.created_date) : now;
  const ageDays = differenceInDays(now, createdDate);
  
  let isOverdue = false;
  let overdueDays = 0;
  
  if (task.due_date && !task.completed_at) {
    const dueDate = startOfDay(parseISO(task.due_date));
    if (isBefore(dueDate, today)) {
      isOverdue = true;
      overdueDays = differenceInDays(today, dueDate);
    }
  }
  
  if (!task.due_date && task.urgency === 'Today' && !task.completed_at && ageDays > 0) {
    isOverdue = true;
    overdueDays = ageDays;
  }
  
  return { isOverdue, overdueDays, ageDays };
}

export function getTimeContext(task) {
  const now = new Date();
  const { isOverdue, overdueDays, ageDays } = getTaskDerivedProps(task);
  
  if (task.completed_at) {
    return `Completed ${format(new Date(task.completed_at), 'MMM d')}`;
  }
  
  if (isOverdue) {
    if (overdueDays === 1) return 'Overdue by 1 day';
    return `Overdue by ${overdueDays} days`;
  }
  
  if (task.due_date) {
    const dueDate = parseISO(task.due_date);
    if (isToday(dueDate)) {
      if (task.due_time) {
        const [h, m] = task.due_time.split(':');
        const dueDateTime = new Date(dueDate);
        dueDateTime.setHours(parseInt(h), parseInt(m));
        const hoursLeft = differenceInHours(dueDateTime, now);
        const minsLeft = differenceInMinutes(dueDateTime, now);
        if (minsLeft <= 0) return 'Overdue';
        if (hoursLeft < 1) return `Due in ${minsLeft} min`;
        return `Due in ${hoursLeft}h`;
      }
      return 'Due today';
    }
    if (isTomorrow(dueDate)) return 'Due tomorrow';
    const daysUntil = differenceInDays(dueDate, startOfDay(now));
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    return `Due ${format(dueDate, 'MMM d')}`;
  }
  
  if (ageDays === 0) return 'Added today';
  if (ageDays === 1) return 'Added yesterday';
  return `Added ${ageDays} days ago`;
}

export function getAttentionMessage(task) {
  const { isOverdue, overdueDays, ageDays } = getTaskDerivedProps(task);
  
  if (overdueDays > 7) return "This is becoming a pattern";
  if (overdueDays > 3) return "This is slipping";
  if (isOverdue) return "This is being felt";
  if (ageDays > 5) return "Still needed?";
  if (ageDays > 3) return "This has been sitting";
  if (ageDays === 1 && task.requested_by) return `${task.requested_by} asked yesterday`;
  return null;
}

export function getPriorityScore(task) {
  let score = 0;
  const { isOverdue, overdueDays, ageDays } = getTaskDerivedProps(task);
  
  if (isOverdue) score += 100 + overdueDays * 10;
  if (task.urgency === 'Today') score += 50;
  if (task.urgency === 'This Week') score += 20;
  if (task.effort === 'Quick') score += 5;
  if (task.due_date) {
    const daysUntil = differenceInDays(parseISO(task.due_date), startOfDay(new Date()));
    if (daysUntil >= 0) score += Math.max(0, 30 - daysUntil);
  }
  score += Math.min(ageDays * 2, 20);
  
  return score;
}

export function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
}

export function isSnoozed(task) {
  if (!task.snoozed_until) return false;
  return isAfter(parseISO(task.snoozed_until), startOfDay(new Date()));
}

export function isCompleted(task) {
  return !!task.completed_at;
}

export function isOpenTask(task) {
  return !isCompleted(task) && !isSnoozed(task);
}

export function isFutureTask(task) {
  if (!task.due_date) return false;
  const daysUntil = differenceInDays(parseISO(task.due_date), startOfDay(new Date()));
  return daysUntil > 14;
}

export function isNear(task) {
  return isOpenTask(task) && !isFutureTask(task);
}

export function needsAttention(task) {
  const { isOverdue, ageDays } = getTaskDerivedProps(task);
  return isOpenTask(task) && (isOverdue || ageDays > 3);
}

export function parseSmartInput(input) {
  const result = { title: input };
  
  const tomorrowMatch = input.match(/\btomorrow\b/i);
  if (tomorrowMatch) {
    const tomorrow = addDays(new Date(), 1);
    result.due_date = format(tomorrow, 'yyyy-MM-dd');
    result.title = input.replace(/\btomorrow\b/i, '').trim();
  }
  
  const todayMatch = input.match(/\btoday\b/i);
  if (todayMatch) {
    result.due_date = format(new Date(), 'yyyy-MM-dd');
    result.title = input.replace(/\btoday\b/i, '').trim();
  }
  
  const timeMatch = input.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const mins = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    if (!ampm && hours < 8) hours += 12;
    result.due_time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    result.title = result.title.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i, '').trim();
    if (!result.due_date) {
      result.due_date = format(new Date(), 'yyyy-MM-dd');
    }
  }
  
  // Clean up extra spaces
  result.title = result.title.replace(/\s+/g, ' ').trim();
  
  return result;
}

export function getSnoozeDate(option) {
  const now = new Date();
  switch (option) {
    case 'tomorrow': return format(addDays(now, 1), 'yyyy-MM-dd');
    case 'weekend': {
      const dayOfWeek = now.getDay();
      const daysToSat = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
      return format(addDays(now, daysToSat || 7), 'yyyy-MM-dd');
    }
    case 'nextweek': return format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 7), 'yyyy-MM-dd');
    default: return format(addDays(now, 1), 'yyyy-MM-dd');
  }
}

export function getCompletionTime(task) {
  if (!task.completed_at || !task.created_date) return null;
  const days = differenceInDays(new Date(task.completed_at), new Date(task.created_date));
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export const CATEGORY_CONFIG = {
  'Home': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏠' },
  'Kids': { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '👶' },
  'Money': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💰' },
  'Relationship': { color: 'bg-pink-50 text-pink-700 border-pink-200', icon: '❤️' },
  'Health': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '💪' },
};

export const EFFORT_CONFIG = {
  'Quick': { label: '⚡ Quick', color: 'bg-emerald-50 text-emerald-700' },
  'Medium': { label: '🔨 Medium', color: 'bg-amber-50 text-amber-700' },
  'Heavy': { label: '🏋️ Heavy', color: 'bg-red-50 text-red-700' },
};

export const URGENCY_CONFIG = {
  'Today': { label: 'Today', color: 'bg-red-50 text-red-700 border-red-200' },
  'This Week': { label: 'This Week', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Whenever': { label: 'Whenever', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};