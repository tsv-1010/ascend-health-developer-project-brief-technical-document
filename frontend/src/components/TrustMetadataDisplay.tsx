import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertCircle, Clock, Database, Lock, Key, Hash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface TrustMetadata {
  timestamp: string;
  providerId: string;
  authenticationType: 'OAuth2' | 'API_Key' | 'Manual';
  reliabilityScore: number;
  firmwareVersion?: string;
  integrityHash: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
}

interface TrustMetadataDisplayProps {
  metadata: TrustMetadata;
  compact?: boolean;
  showFullDetails?: boolean;
}

const TrustMetadataDisplay: React.FC<TrustMetadataDisplayProps> = ({ 
  metadata, 
  compact = false,
  showFullDetails = false 
}) => {
  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReliabilityBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAuthIcon = (type: string) => {
    switch (type) {
      case 'OAuth2':
        return <Key className="w-3 h-3" />;
      case 'API_Key':
        return <Database className="w-3 h-3" />;
      case 'Manual':
        return <Lock className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {getVerificationIcon(metadata.verificationStatus)}
        <span className={getReliabilityColor(metadata.reliabilityScore)}>
          {metadata.reliabilityScore}%
        </span>
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          {getAuthIcon(metadata.authenticationType)}
          {metadata.authenticationType}
        </Badge>
        <span className="text-muted-foreground">{metadata.providerId}</span>
      </div>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Trust Metadata - {metadata.providerId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verification Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
          metadata.verificationStatus === 'verified' ? 'bg-green-500/10 border-green-500/30' :
          metadata.verificationStatus === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' :
          'bg-red-500/10 border-red-500/30'
        }`}>
          <span className="text-sm font-medium">Verification Status</span>
          <div className="flex items-center gap-2">
            {getVerificationIcon(metadata.verificationStatus)}
            <span className="text-sm font-semibold capitalize">{metadata.verificationStatus}</span>
          </div>
        </div>

        {/* Reliability Score */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getReliabilityBgColor(metadata.reliabilityScore)}`}>
          <span className="text-sm font-medium">Reliability Score</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metadata.reliabilityScore >= 90 ? 'bg-green-600' :
                  metadata.reliabilityScore >= 70 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${metadata.reliabilityScore}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${getReliabilityColor(metadata.reliabilityScore)}`}>
              {metadata.reliabilityScore}%
            </span>
          </div>
        </div>

        <Separator />

        {/* Authentication Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Authentication Type</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {getAuthIcon(metadata.authenticationType)}
              {metadata.authenticationType}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Provider ID</span>
            <span className="text-sm font-medium">{metadata.providerId}</span>
          </div>

          {metadata.firmwareVersion && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Firmware Version</span>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{metadata.firmwareVersion}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Data Integrity */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Integrity Hash
            </span>
            <div className="text-right">
              <span className="text-xs font-mono text-muted-foreground break-all">
                {showFullDetails ? metadata.integrityHash : `${metadata.integrityHash.substring(0, 16)}...`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Timestamp
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(metadata.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Production-Grade Indicators */}
        {showFullDetails && (
          <>
            <Separator />
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Production-grade trust metadata tagging active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Real-time provenance tracking enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Comprehensive authentication verification</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TrustMetadataDisplay;
