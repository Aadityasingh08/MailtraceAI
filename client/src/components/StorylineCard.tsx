import React from 'react';
import { Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';

interface StorylineCardProps {
  storyline: string;
  threatType: string;
  severity: string;
}

export const StorylineCard: React.FC<StorylineCardProps> = ({ storyline, threatType, severity }) => {
  return (
    <div className="glass-panel-glow rounded-xl p-5 border border-soc-cyan/30 shadow-glow relative overflow-hidden space-y-3">
      {/* Background Gradient Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-soc-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-border/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-soc-cyan/10 text-soc-cyan border border-soc-cyan/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-soc-cyan font-bold block">
              AI-GENERATED INVESTIGATION SUMMARY
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              Autonomous Attack Storyline & Forensic Narrative
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-soc-card border border-soc-border text-soc-muted">
            Model: Heuristic AI Engine v2.4
          </span>
        </div>
      </div>

      <p className="text-sm text-soc-text leading-relaxed font-sans pt-1">
        {storyline || 'Investigation completed with baseline heuristics. No anomalous storylines detected.'}
      </p>

      <div className="pt-2 text-[10px] font-mono text-soc-muted flex items-center justify-between border-t border-soc-border/40">
        <span>AI inference synthesized from MIME topology, NLP lexical analysis, and IOC correlations.</span>
        <span className="text-soc-cyan font-semibold">Classification: {threatType} ({severity})</span>
      </div>
    </div>
  );
};
