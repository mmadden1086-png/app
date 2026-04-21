import { base44 } from '@/api/base44Client';

/**
 * Morning Digest Email
 * Scheduled: daily at 7:30am
 * Sends a focused morning summary to all app users.
 */
export async function sendMorningDigest() {
  const tasks = await base44.entities.Task.list('-created_date', 500);
  const users = await base44.entities.User.list();

  const now = new Date();

  for (const user of users) {
    if (!user.email) continue;

    // Tasks that are open and not snoozed past today for this user
    const openTasks = tasks.filter(t => {
      if (t.completed_at) return false;
      if (t.snoozed_until) {
        const snoozeDate = new Date(t.snoozed_until + 'T00:00:00');
        if (snoozeDate > now) return false;
      }
      return true;
    });

    if (openTasks.length === 0) continue;

    // Sort by priority (overdue first, then Today urgency)
    const prioritized = openTasks.sort((a, b) => {
      const aOverdue = a.due_date && new Date(a.due_date) < now ? 1 : 0;
      const bOverdue = b.due_date && new Date(b.due_date) < now ? 1 : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;
      const urgencyOrder = { Today: 0, 'This Week': 1, Whenever: 2 };
      return (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2);
    });

    const top = prioritized[0];
    const count = openTasks.length;

    const subject = count === 1
      ? `1 thing needs attention today`
      : `You've got ${count} open. Start with one.`;

    const taskLines = prioritized.slice(0, 5).map(t => {
      const overdue = t.due_date && new Date(t.due_date) < now;
      return `• ${overdue ? '🔴 ' : ''}${t.title}${t.requested_by ? ` (from ${t.requested_by})` : ''}`;
    }).join('\n');

    const body = `Good morning,

${subject}

${count > 1 ? `Start with: "${top.title}"\n\n` : ''}Your open tasks:
${taskLines}${count > 5 ? `\n…and ${count - 5} more` : ''}

Open Follow Through to handle them.`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `☀️ ${subject}`,
      body,
      from_name: 'Follow Through',
    });
  }
}