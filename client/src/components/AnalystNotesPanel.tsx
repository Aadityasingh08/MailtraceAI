import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { AnalystNote } from '../types';
import { api } from '../services/api';

interface AnalystNotesPanelProps {
  investigationId: string;
  notes: AnalystNote[];
  onNoteAdded: (newNote: AnalystNote) => void;
}

export const AnalystNotesPanel: React.FC<AnalystNotesPanelProps> = ({
  investigationId,
  notes,
  onNoteAdded,
}) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.addNote(investigationId, content.trim());
      onNoteAdded(res.note);
      setContent('');
    } catch (err: any) {
      alert(`Failed to add analyst note: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Analyst Notes & Collaboration Log
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
          {notes.length} Notes Recorded
        </span>
      </div>

      {/* Note input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Record forensic observation, containment action, or IOC cross-reference..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 text-xs font-bold shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Recording...' : 'Add Note to Dossier'}</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3 pt-2">
        {notes.map((note, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-soc-secondary/40 border border-soc-border space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center space-x-1.5 text-soc-cyan font-bold">
                <User className="w-3.5 h-3.5" />
                <span>{note.author_name}</span>
              </div>
              <div className="flex items-center space-x-1 text-soc-muted">
                <Clock className="w-3 h-3" />
                <span>{new Date(note.created_at).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-soc-text whitespace-pre-wrap font-sans pt-1">
              {note.content}
            </p>
          </div>
        ))}

        {notes.length === 0 && (
          <p className="text-center py-4 text-xs text-soc-muted font-mono">
            No analyst notes recorded yet. Add initial triage observations above.
          </p>
        )}
      </div>
    </div>
  );
};
