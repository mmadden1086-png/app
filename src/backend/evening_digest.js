import { base44 } from '@/api/base44Client';

/**
 * Evening Closeout Email
 * Scheduled: daily at 7:00pm
 * Sends remaining open tasks to prompt a quick wrap-up.
 */
export async function sendEveningDigest() {
  const tasks = await base44.entities.Task.list('-created_date', 500);
  const users = await base44.entities.User.list();

  const now = new Date();

  for (const user of users) {
    if (!user.email) continue;

    const openTasks = tasks.filter(t => {
      if (t.completed_at) return false;
      if (t.snoozed_until) {
        const snoozeDate = new Date(t.snoozed_until + 'T00:00:00');
        if (snoozeDate > now) return false;
      }
      // Only Today-urgency tasks for evening nudge
      return t.urgency === 'Today' || (t.due_date && t.due_date === now.toISOString().split('T')[0]);
    });

    if (openTasks.length === 0) continue;

    const count = openTasks.length;
    const taskLines = openTasks.slice(0, 5).map(t =>
      `• ${t.title}${t.effort === 'Quick' ? ' ⚡ (quick)' : ''}`
    ).join('\n');

    const body = `Evening check-in,

${count} still open. Quick win before tomorrow?

${taskLines}

Even one is progress. Open Follow Through to handle it.`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🌙 ${count} still open — quick win before tomorrow?`,
      body,
      from_name: 'Follow Through',
    });
  }
}