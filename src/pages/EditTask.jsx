import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import BottomNav from '@/components/follow-through/BottomNav';

export default function EditTask() {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = window.location.pathname.split('/edit/')[1];
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const tasks = await base44.entities.Task.filter({ id: taskId });
      return tasks[0];
    },
    enabled: !!taskId,
  });

  const [form, setForm] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        notes: task.notes || '',
        urgency: task.urgency || 'Today',
        due_date: task.due_date || '',
        due_time: task.due_time || '',
        category: task.category || '',
        effort: task.effort || 'Medium',
        clarity: task.clarity || '',
        why_this_matters: task.why_this_matters || '',
        requested_by: task.requested_by || '',
        is_flexible: task.is_flexible ?? true,
        repeat: task.repeat || 'none',
      });
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast('Updated.', { duration: 1500 });
      navigate('/');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Task.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast('Removed.', { duration: 1500 });
      navigate('/');
    },
  });

  const update = (key, value) => setForm({ ...form, [key]: value });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            className="h-8 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</Label>
          <Input
            value={form.title || ''}
            onChange={(e) => update('title', e.target.value)}
            className="h-12 text-base rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">Urgency</Label>
          <div className="flex gap-2">
            {['Today', 'This Week', 'Whenever'].map((v) => (
              <button
                key={v}
                onClick={() => update('urgency', v)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  form.urgency === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due date</Label>
            <Input type="date" value={form.due_date || ''} onChange={(e) => update('due_date', e.target.value)} className="h-10 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due time</Label>
            <Input type="time" value={form.due_time || ''} onChange={(e) => update('due_time', e.target.value)} className="h-10 rounded-lg" />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</Label>
          <Textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} className="min-h-[80px] rounded-lg resize-none" />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Clarity — what does done look like?</Label>
          <Input value={form.clarity || ''} onChange={(e) => update('clarity', e.target.value)} className="h-10 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</Label>
            <Select value={form.category || ''} onValueChange={(v) => update('category', v === 'none_val' ? '' : v)}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none_val">None</SelectItem>
                <SelectItem value="Home">🏠 Home</SelectItem>
                <SelectItem value="Kids">👶 Kids</SelectItem>
                <SelectItem value="Money">💰 Money</SelectItem>
                <SelectItem value="Relationship">❤️ Relationship</SelectItem>
                <SelectItem value="Health">💪 Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Effort</Label>
            <Select value={form.effort || 'Medium'} onValueChange={(v) => update('effort', v)}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Quick">⚡ Quick</SelectItem>
                <SelectItem value="Medium">🔨 Medium</SelectItem>
                <SelectItem value="Heavy">🏋️ Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Why this matters</Label>
          <Input value={form.why_this_matters || ''} onChange={(e) => update('why_this_matters', e.target.value)} className="h-10 rounded-lg" />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Requested by</Label>
          <Input value={form.requested_by || ''} onChange={(e) => update('requested_by', e.target.value)} className="h-10 rounded-lg" placeholder="Name" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Repeat</Label>
            <Select value={form.repeat || 'none'} onValueChange={(v) => update('repeat', v)}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_flexible} onCheckedChange={(v) => update('is_flexible', v)} />
              <Label className="text-sm">Flexible</Label>
            </div>
          </div>
        </div>

        <Button
          onClick={() => updateMutation.mutate(form)}
          disabled={!form.title?.trim() || updateMutation.isPending}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}