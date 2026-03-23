import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Activity, Apple, Brain, DollarSign, Users, Leaf, Target, Heart } from 'lucide-react';
import { HealthDomain } from '../backend';

interface UnifiedHealthOrbProps {
  className?: string;
}

const UnifiedHealthOrb: React.FC<UnifiedHealthOrbProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const domains = [
    { 
      name: HealthDomain.fitness, 
      title: 'Fitness', 
      icon: Activity, 
      color: 'from-green-400 to-emerald-500',
      angle: 0
    },
    { 
      name: HealthDomain.nutrition, 
      title: 'Nutrition', 
      icon: Apple, 
      color: 'from-orange-400 to-red-500',
      angle: 45
    },
    { 
      name: HealthDomain.mental, 
      title: 'Mental', 
      icon: Brain, 
      color: 'from-blue-400 to-indigo-500',
      angle: 90
    },
    { 
      name: HealthDomain.finances, 
      title: 'Finances', 
      icon: DollarSign, 
      color: 'from-yellow-400 to-orange-500',
      angle: 135
    },
    { 
      name: HealthDomain.community, 
      title: 'Community', 
      icon: Users, 
      color: 'from-purple-400 to-pink-500',
      angle: 180
    },
    { 
      name: HealthDomain.environment, 
      title: 'Environment', 
      icon: Leaf, 
      color: 'from-teal-400 to-cyan-500',
      angle: 225
    },
    { 
      name: HealthDomain.purpose, 
      title: 'Purpose', 
      icon: Target, 
      color: 'from-red-400 to-pink-500',
      angle: 270
    },
    { 
      name: HealthDomain.longevity, 
      title: 'Longevity', 
      icon: Heart, 
      color: 'from-gray-400 to-slate-500',
      angle: 315
    },
  ];

  const handleDomainClick = (domain: typeof domains[0]) => {
    navigate({ to: `/domain/${domain.name}` });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Central Health Orb */}
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse-glow"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
          <img 
            src="/assets/generated/health-orb-central.png" 
            alt="Health Core"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        {/* Orbiting Domain Spheres */}
        {domains.map((domain, index) => {
          const Icon = domain.icon;
          const radius = 120;
          const angleRad = (domain.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;
          
          return (
            <button
              key={domain.name}
              className="absolute w-16 h-16 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer group"
              style={{
                left: `calc(50% + ${x}px - 2rem)`,
                top: `calc(50% + ${y}px - 2rem)`,
                animationDelay: `${index * 0.5}s`
              }}
              onClick={() => handleDomainClick(domain)}
              onMouseEnter={() => setHoveredDomain(domain.name)}
              onMouseLeave={() => setHoveredDomain(null)}
            >
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${domain.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow orbiting-domain`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              {hoveredDomain === domain.name && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-card border border-border rounded-lg px-3 py-1 text-sm font-medium shadow-lg animate-scale-in">
                  {domain.title}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <h3 className="text-2xl font-bold gradient-text">Your Health Universe</h3>
        <p className="text-muted-foreground mt-2">
          Click any domain to explore your wellness journey
        </p>
      </div>
    </div>
  );
};

export default UnifiedHealthOrb;
