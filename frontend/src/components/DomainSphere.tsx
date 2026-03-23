import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DomainProgress, HealthDomain } from '../backend';
import { Flame } from 'lucide-react';

interface DomainSphereProps {
  domain: {
    name: HealthDomain;
    title: string;
    image: string;
    color: string;
  };
  progress: DomainProgress;
  onClick: () => void;
}

const DomainSphere: React.FC<DomainSphereProps> = ({ domain, progress, onClick }) => {
  const score = Number(progress.score);
  const streak = Number(progress.streak);

  return (
    <div 
      className="domain-sphere group cursor-pointer animate-scale-in"
      onClick={onClick}
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      <div className="relative w-full h-full p-8 flex flex-col items-center justify-center text-center">
        <div className="relative mb-4">
          <img 
            src={domain.image} 
            alt={domain.title}
            className="w-20 h-20 rounded-3xl shadow-soft group-hover:scale-110 transition-all duration-500 ease-out"
          />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <h3 className="font-bold text-white mb-4 text-lg tracking-tight">
          {domain.title}
        </h3>
        
        <div className="space-y-3">
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm rounded-2xl px-4 py-2 text-sm font-medium"
          >
            Score: {score}
          </Badge>
          
          {streak > 0 && (
            <div className="flex items-center justify-center gap-2 bg-orange-500/20 backdrop-blur-sm rounded-2xl px-3 py-2">
              <Flame className="w-4 h-4 text-orange-300 streak-flame" />
              <span className="text-sm text-white font-semibold">{streak}d streak</span>
            </div>
          )}
        </div>

        {/* Enhanced progress ring with glow effect */}
        <svg className="absolute inset-0 w-full h-full progress-ring" viewBox="0 0 100 100">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 47}`}
            strokeDashoffset={`${2 * Math.PI * 47 * (1 - score / 100)}`}
            className="transition-all duration-1000 ease-out"
            filter="url(#glow)"
            strokeLinecap="round"
          />
        </svg>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DomainSphere;
