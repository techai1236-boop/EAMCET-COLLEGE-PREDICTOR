import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';
import { ChanceCategory } from '../types';
import { CHANCE_CONFIG } from '../config/predictorConfig';

interface ChanceBadgeProps {
  chance: ChanceCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ChanceBadge: React.FC<ChanceBadgeProps> = ({
  chance,
  showIcon = true,
  size = 'md',
}) => {
  const config = CHANCE_CONFIG[chance];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  const getIcon = () => {
    switch (chance) {
      case 'HIGH':
        return <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />;
      case 'MODERATE':
        return <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />;
      case 'LOW':
        return <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 shrink-0" />;
      case 'VERY_LOW':
        return <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />;
      default:
        return null;
    }
  };

  const styleClasses = {
    HIGH: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    MODERATE: 'bg-amber-50 text-amber-800 border-amber-300',
    LOW: 'bg-orange-50 text-orange-800 border-orange-300',
    VERY_LOW: 'bg-rose-50 text-rose-800 border-rose-300',
  }[chance];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs whitespace-nowrap ${sizeClasses} ${styleClasses}`}
      title={config.description}
    >
      {showIcon && getIcon()}
      <span>{config.label}</span>
    </span>
  );
};
