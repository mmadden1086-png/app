import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PartnerCloseLoop({ task, requestedBy, onDismiss }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!requestedBy || sent) return null;

  const handleNotify = async () => {
    setSending(true);
    // Best-effort email — non-blocking
    base44.integrations.Core.SendEmail({
      to: requestedBy.includes('@') ? requestedBy : `${requestedBy}@example.com`,
      subject: '✅ Done',
      body: `Just a heads up — "${task.title}" has been handled.`,
    }).catch(() => {});
    setSent(true);
    setSending(false);
    setTimeout(onDismiss, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-40 bg-card border border-border rounded-2xl shadow-lg p-4 flex items-center gap-3"
    >
      {sent ? (
        <>
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium flex-1">Loop closed. 👍</p>
        </>
      ) : (
        <>
          <Heart className="w-5 h-5 text-pink-400 shrink-0" />
          <p className="text-sm font-medium flex-1">Let {requestedBy} know?</p>
          <button
            onClick={handleNotify}
            disabled={sending}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
          >
            👍 Done
          </button>
          <button onClick={onDismiss} className="text-muted-foreground text-sm">Skip</button>
        </>
      )}
    </motion.div>
  );
}