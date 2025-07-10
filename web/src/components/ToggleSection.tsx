import React from 'react';
import { ToggleOption } from '../types';

interface ToggleSectionProps {
  title: string;
  toggles: ToggleOption[];
  onToggle: (key: string) => void;
}

const ToggleSection: React.FC<ToggleSectionProps> = ({ title, toggles, onToggle }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            onClick={() => onToggle(toggle.key)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200 
              border-2 text-sm
              ${toggle.enabled 
                ? 'bg-white text-brazil-navy border-white shadow-lg' 
                : 'bg-transparent text-white border-white/30 hover:border-white/60'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${toggle.enabled ? '' : 'opacity-50'}`}
                style={{ backgroundColor: toggle.enabled ? toggle.color : '#fff' }}
              />
              {toggle.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToggleSection;
