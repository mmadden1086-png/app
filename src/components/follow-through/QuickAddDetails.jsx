import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const URGENCY_PRESETS = [
  { value: 'Today', label: 'Today' },
  { value: 'This Week', label: 'Before Weekend' },
  { value: 'Whenever', label: 'No Rush' },
];

export default function QuickAddDetails({ details, onChange }) {
  const update = (key, value) => onChange({ ...details, [key]: value });

  return (
    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
      {/* Urgency presets */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">
          When do you actually need this?
        </Label>
        <div className="flex gap-2">
          {URGENCY_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => update('urgency', preset.value)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                details.urgency === preset.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due date</Label>
          <Input
            type="date"
            value={details.due_date || ''}
            onChange={(e) => update('due_date', e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due time</Label>
          <Input
            type="time"
            value={details.due_time || ''}
            onChange={(e) => update('due_time', e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</Label>
        <Textarea
          placeholder="Any extra context..."
          value={details.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          className="min-h-[60px] rounded-lg resize-none"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Add clarity — what does done look like?
        </Label>
        <Input
          placeholder="e.g. Booked and confirmed"
          value={details.clarity || ''}
          onChange={(e) => update('clarity', e.target.value)}
          className="h-10 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</Label>
          <Select value={details.category || ''} onValueChange={(v) => update('category', v)}>
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
          <Select value={details.effort || 'Medium'} onValueChange={(v) => update('effort', v)}>
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
        <Input
          placeholder="Optional — helps with motivation"
          value={details.why_this_matters || ''}
          onChange={(e) => update('why_this_matters', e.target.value)}
          className="h-10 rounded-lg"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Repeat</Label>
        <Select value={details.repeat || 'none'} onValueChange={(v) => update('repeat', v)}>
          <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}