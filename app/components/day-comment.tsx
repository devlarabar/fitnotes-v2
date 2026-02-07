import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, X } from 'lucide-react';
import { Button, Card, SpinnerInline } from './ui';
import { Textarea } from './ui/form/textarea';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';
import { DayComment as DayCommentType } from '@/app/lib/schema';

interface Props {
  date: string; // YYYY-MM-DD format
}

export function DayComment({ date }: Props) {
  const [comment, setComment] = useState<DayCommentType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchComment();
  }, [date]);

  const fetchComment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setComment(data);
      setEditValue(data?.comment || '');
    } catch (err) {
      console.error('Error fetching day comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      // Delete if empty
      if (comment) {
        await handleDelete();
      }
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      if (comment) {
        // Update existing
        const { error } = await supabase
          .from('comments')
          .update({ comment: editValue })
          .eq('id', comment.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('comments')
          .insert({ date, comment: editValue });

        if (error) throw error;
      }

      toast.success('Comment saved');
      await fetchComment();
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving comment:', err);
      toast.error('Failed to save comment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!comment) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      toast.success('Comment deleted');
      setComment(null);
      setEditValue('');
      setIsEditing(false);
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
    }
  };

  const handleCancel = () => {
    setEditValue(comment?.comment || '');
    setIsEditing(false);
  };

  if (loading) {
    return null;
  }

  if (!isEditing && !comment) {
    return (
      <Button
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="w-full text-text-dim hover:text-text-secondary"
      >
        <MessageSquare size={16} />
        Add day note
      </Button>
    );
  }

  if (isEditing) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
            <MessageSquare size={16} />
            Day Note
          </div>
          <Textarea
            placeholder="Add a note for this day..."
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="bg-bg-tertiary border-border-primary text-text-primary"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <SpinnerInline />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-bg-secondary transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-start gap-3">
        <MessageSquare size={16} className="text-text-dim mt-0.5" />
        <p className="flex-1 text-sm text-text-secondary italic">{comment?.comment}</p>
      </div>
    </Card>
  );
}
