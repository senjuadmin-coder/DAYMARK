import React from 'react';
import { Plus } from 'lucide-react';
import { AppScreen } from '../types';

interface TopBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenQuickCapture: () => void;
}

const NAV_ITEMS: Array<{ id: AppScreen; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'folio', label: 'Folio' },
  { id: 'archive', label: 'Archive' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onNavigate,
  onOpenQuickCapture,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5] border-b border-[#E5E1D8]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line editorial wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('today')}
          className="font-serif text-[22px] font-semibold tracking-[-0.02em] text-[#181715] hover:text-[#C85A32] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Daymark
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-5 sm:gap-8 overflow-x-auto no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1.5 text-[14px] font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#181715] font-semibold'
                    : 'text-[#5E5A54] hover:text-[#181715]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-[1.5px] transition-opacity duration-150 ${
                    isActive ? 'bg-[#C85A32] opacity-100' : 'bg-[#181715] opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] border border-[#181715] hover:border-[#C85A32] rounded-sm text-[13px] font-semibold tracking-[0.01em] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.25]" aria-hidden="true" />
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
