import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useGetHealthStandardsByDomain } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ClientNormalizationInterfaceProps {
  domain: string;
  metricName: string;
  rawValue: number;
  unit: string;
}

interface NormalizationResult {
  rawValue: number;
  normalizedValue: number;
  optimalRange: { min: number; max: number };
  evidenceSource: string;
  status: 'optimal' | 'normal' | 'suboptimal';
}

const ClientNormalizationInterface: React.FC<ClientNormalizationInterfaceProps> = ({
  domain,
  metricName,
  rawValue,
  unit,
}) => {
  const { data: standards = [], isLoading } = useGetHealthStandardsByDomain(domain);
  const [normalizationResult, setNormalizationResult] = useState<NormalizationResult | null>(null);

  useEffect(() => {
    if (standards.length > 0) {
      performNormalization();
    }
  }, [standards, rawValue]);

  const performNormalization = () => {
    const standard = standards.find(s => s.metricName === metricName);

    if (!standard) {
      toast.error(`No standard found for ${metricName}`);
      return;
    }

    const min = Number(standard.optimalRange.min);
    const max = Number(standard.optimalRange.max);

    // Normalize to 0-100 scale based on evidence-based standards
    let normalizedValue: number;
    if (rawValue < min) {
      normalizedValue = (rawValue / min) * 50;
    } else if (rawValue > max) {
      normalizedValue = 50 + ((rawValue - max) / max) * 50;
      normalizedValue = Math.min(normalizedValue, 100);
    } else {
      normalizedValue = 50 + ((rawValue - min) / (max - min)) * 50;
    }

    normalizedValue = Math.max(0, Math.min(100, normalizedValue));

    // Determine status
    let status: 'optimal' | 'normal' | 'suboptimal';
    if (rawValue >= min && rawValue <= max) {
      status = 'optimal';
    } else if (rawValue >= min * 0.8 && rawValue <= max * 1.2) {
      status = 'normal';
    } else {
      status = 'suboptimal';
    }

    setNormalizationResult({
      rawValue,
      normalizedValue: Math.round(normalizedValue * 10) / 10,
      optimalRange: { min, max },
      evidenceSource: standard.evidenceSource,
      status,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-600 bg-green-500/10 border-green-500/30';
      case 'normal':
        return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
      case 'suboptimal':
        return 'text-red-600 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-600 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading normalization standards...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" />
          Client-Side Normalization
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Real-time evidence-based scaling from Central Standards Memory
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Metric</Label>
            <div className="text-sm font-medium">{metricName}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Domain</Label>
            <Badge variant="outline">{domain}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Raw Value</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={rawValue}
              readOnly
              className="text-sm"
            />
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>

        {normalizationResult && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Normalized Value (0-100)</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${normalizationResult.normalizedValue}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{normalizationResult.normalizedValue}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Optimal Range</Label>
              <div className="text-sm">
                {normalizationResult.optimalRange.min} - {normalizationResult.optimalRange.max} {unit}
              </div>
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-lg border ${getStatusColor(normalizationResult.status)}`}>
              {normalizationResult.status === 'optimal' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium capitalize">{normalizationResult.status}</span>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Evidence Source:</p>
              <p>{normalizationResult.evidenceSource}</p>
            </div>
          </>
        )}

        <Button
          onClick={performNormalization}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isLoading}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Recalculate Normalization
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientNormalizationInterface;
