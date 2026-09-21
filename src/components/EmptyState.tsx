import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-2 font-display">{title}</h3>
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 max-w-md">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {actionLabel && onAction && (
          <button
            id={`empty-action-${title.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onAction}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            id={`empty-sec-action-${title.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onSecondaryAction}
            className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-xl transition-colors text-sm"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
