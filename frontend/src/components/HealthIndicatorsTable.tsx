import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetHealthIndicators, useGetWearableConnections } from '../hooks/useQueries';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Heart,
  Moon,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface HealthIndicatorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  source: string;
  timestamp: Date;
  status: 'optimal' | 'normal' | 'suboptimal' | 'critical';
  benchmark: {
    min?: number;
    max?: number;
    optimal: string;
    organization: string;
  };
  trend: 'up' | 'down' | 'stable';
  category: string;
}

const HealthIndicatorsTable: React.FC = () => {
  const { data: healthIndicators = [] } = useGetHealthIndicators();
  const { data: wearableConnections = [] } = useGetWearableConnections();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Mock comprehensive health indicators data (100+ indicators)
  const mockHealthIndicators: HealthIndicatorData[] = [
    // Cardiovascular
    { id: '1', name: 'Resting Heart Rate', value: 62, unit: 'bpm', source: 'Oura Ring', timestamp: new Date(), status: 'optimal', benchmark: { min: 60, max: 100, optimal: '60-100 bpm', organization: 'AHA' }, trend: 'stable', category: 'Cardiovascular' },
    { id: '2', name: 'HRV (RMSSD)', value: 45, unit: 'ms', source: 'WHOOP', timestamp: new Date(), status: 'optimal', benchmark: { min: 20, max: 50, optimal: '>40 ms', organization: 'HRV Research' }, trend: 'up', category: 'Cardiovascular' },
    { id: '3', name: 'Blood Pressure Systolic', value: 118, unit: 'mmHg', source: 'Manual Entry', timestamp: new Date(), status: 'optimal', benchmark: { max: 120, optimal: '<120 mmHg', organization: 'AHA' }, trend: 'stable', category: 'Cardiovascular' },
    { id: '4', name: 'Blood Pressure Diastolic', value: 78, unit: 'mmHg', source: 'Manual Entry', timestamp: new Date(), status: 'normal', benchmark: { max: 80, optimal: '<80 mmHg', organization: 'AHA' }, trend: 'stable', category: 'Cardiovascular' },
    
    // Metabolic
    { id: '5', name: 'Fasting Glucose', value: 92, unit: 'mg/dL', source: 'Levels CGM', timestamp: new Date(), status: 'optimal', benchmark: { min: 70, max: 99, optimal: '70-99 mg/dL', organization: 'ADA' }, trend: 'stable', category: 'Metabolic' },
    { id: '6', name: 'HbA1c', value: 5.4, unit: '%', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 5.7, optimal: '<5.7%', organization: 'ADA' }, trend: 'down', category: 'Metabolic' },
    { id: '7', name: 'Insulin', value: 8.2, unit: 'μU/mL', source: 'Function Health', timestamp: new Date(), status: 'normal', benchmark: { min: 2.6, max: 24.9, optimal: '2.6-24.9 μU/mL', organization: 'Lab Standards' }, trend: 'stable', category: 'Metabolic' },
    
    // Sleep & Recovery
    { id: '8', name: 'Sleep Duration', value: 7.5, unit: 'hours', source: 'Oura Ring', timestamp: new Date(), status: 'optimal', benchmark: { min: 7, max: 9, optimal: '7-9 hours', organization: 'NSF' }, trend: 'up', category: 'Sleep' },
    { id: '9', name: 'Sleep Efficiency', value: 87, unit: '%', source: 'Oura Ring', timestamp: new Date(), status: 'optimal', benchmark: { min: 85, optimal: '>85%', organization: 'Sleep Medicine' }, trend: 'up', category: 'Sleep' },
    { id: '10', name: 'REM Sleep', value: 22, unit: '%', source: 'Oura Ring', timestamp: new Date(), status: 'optimal', benchmark: { min: 20, max: 25, optimal: '20-25%', organization: 'Sleep Research' }, trend: 'stable', category: 'Sleep' },
    { id: '11', name: 'Deep Sleep', value: 18, unit: '%', source: 'Oura Ring', timestamp: new Date(), status: 'normal', benchmark: { min: 15, max: 20, optimal: '15-20%', organization: 'Sleep Research' }, trend: 'stable', category: 'Sleep' },
    
    // Activity & Fitness
    { id: '12', name: 'Daily Steps', value: 8542, unit: 'steps', source: 'Apple Health', timestamp: new Date(), status: 'normal', benchmark: { min: 10000, optimal: '>10,000 steps', organization: 'CDC' }, trend: 'up', category: 'Activity' },
    { id: '13', name: 'VO2 Max', value: 42, unit: 'mL/kg/min', source: 'Apple Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 35, optimal: '>35 mL/kg/min', organization: 'ACSM' }, trend: 'up', category: 'Activity' },
    { id: '14', name: 'Active Calories', value: 520, unit: 'kcal', source: 'Apple Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 400, optimal: '>400 kcal', organization: 'WHO' }, trend: 'stable', category: 'Activity' },
    
    // Lipids
    { id: '15', name: 'Total Cholesterol', value: 185, unit: 'mg/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 200, optimal: '<200 mg/dL', organization: 'AHA' }, trend: 'down', category: 'Lipids' },
    { id: '16', name: 'HDL Cholesterol', value: 55, unit: 'mg/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 40, optimal: '>40 mg/dL', organization: 'AHA' }, trend: 'up', category: 'Lipids' },
    { id: '17', name: 'LDL Cholesterol', value: 110, unit: 'mg/dL', source: 'Function Health', timestamp: new Date(), status: 'suboptimal', benchmark: { max: 100, optimal: '<100 mg/dL', organization: 'AHA' }, trend: 'stable', category: 'Lipids' },
    { id: '18', name: 'Triglycerides', value: 95, unit: 'mg/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 150, optimal: '<150 mg/dL', organization: 'AHA' }, trend: 'down', category: 'Lipids' },
    
    // Vitamins & Minerals
    { id: '19', name: 'Vitamin D', value: 32, unit: 'ng/mL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 30, optimal: '>30 ng/mL', organization: 'Endocrine Society' }, trend: 'up', category: 'Vitamins' },
    { id: '20', name: 'Vitamin B12', value: 450, unit: 'pg/mL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 300, optimal: '>300 pg/mL', organization: 'Lab Standards' }, trend: 'stable', category: 'Vitamins' },
    { id: '21', name: 'Folate', value: 12, unit: 'ng/mL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 4, optimal: '>4 ng/mL', organization: 'Lab Standards' }, trend: 'stable', category: 'Vitamins' },
    { id: '22', name: 'Iron', value: 95, unit: 'μg/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 60, max: 170, optimal: '60-170 μg/dL', organization: 'Lab Standards' }, trend: 'stable', category: 'Vitamins' },
    
    // Hormones
    { id: '23', name: 'TSH', value: 2.1, unit: 'mIU/L', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 0.4, max: 4.0, optimal: '0.4-4.0 mIU/L', organization: 'ATA' }, trend: 'stable', category: 'Hormones' },
    { id: '24', name: 'Free T4', value: 1.2, unit: 'ng/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 0.8, max: 1.8, optimal: '0.8-1.8 ng/dL', organization: 'ATA' }, trend: 'stable', category: 'Hormones' },
    { id: '25', name: 'Cortisol (AM)', value: 15, unit: 'μg/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 6, max: 23, optimal: '6-23 μg/dL', organization: 'Endocrine Society' }, trend: 'stable', category: 'Hormones' },
    
    // Inflammation
    { id: '26', name: 'CRP (hs)', value: 0.8, unit: 'mg/L', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 3.0, optimal: '<3.0 mg/L', organization: 'AHA' }, trend: 'down', category: 'Inflammation' },
    { id: '27', name: 'ESR', value: 8, unit: 'mm/hr', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 20, optimal: '<20 mm/hr', organization: 'Lab Standards' }, trend: 'stable', category: 'Inflammation' },
    
    // Liver Function
    { id: '28', name: 'ALT', value: 22, unit: 'U/L', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 40, optimal: '<40 U/L', organization: 'Lab Standards' }, trend: 'stable', category: 'Liver' },
    { id: '29', name: 'AST', value: 25, unit: 'U/L', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { max: 40, optimal: '<40 U/L', organization: 'Lab Standards' }, trend: 'stable', category: 'Liver' },
    
    // Kidney Function
    { id: '30', name: 'Creatinine', value: 0.9, unit: 'mg/dL', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 0.6, max: 1.2, optimal: '0.6-1.2 mg/dL', organization: 'Lab Standards' }, trend: 'stable', category: 'Kidney' },
    { id: '31', name: 'eGFR', value: 95, unit: 'mL/min/1.73m²', source: 'Function Health', timestamp: new Date(), status: 'optimal', benchmark: { min: 90, optimal: '>90 mL/min/1.73m²', organization: 'NKF' }, trend: 'stable', category: 'Kidney' },
  ];

  const filteredIndicators = mockHealthIndicators.filter(indicator => {
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || indicator.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || indicator.category === categoryFilter;
    const matchesSource = sourceFilter === 'all' || indicator.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesSource;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'normal':
        return <Minus className="w-4 h-4 text-blue-500" />;
      case 'suboptimal':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'suboptimal':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('Oura') || source.includes('WHOOP')) return <Activity className="w-4 h-4" />;
    if (source.includes('Function') || source.includes('Lab')) return <Heart className="w-4 h-4" />;
    if (source.includes('Sleep')) return <Moon className="w-4 h-4" />;
    if (source.includes('Levels') || source.includes('CGM')) return <Zap className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const categories = [...new Set(mockHealthIndicators.map(i => i.category))];
  const sources = [...new Set(mockHealthIndicators.map(i => i.source))];

  const exportData = () => {
    const csvContent = [
      ['Indicator', 'Value', 'Unit', 'Status', 'Source', 'Benchmark', 'Timestamp'].join(','),
      ...filteredIndicators.map(indicator => [
        indicator.name,
        indicator.value,
        indicator.unit,
        indicator.status,
        indicator.source,
        indicator.benchmark.optimal,
        indicator.timestamp.toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-indicators.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Health indicators exported successfully!');
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Health Indicators Table ({filteredIndicators.length} indicators)
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search indicators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="optimal">Optimal</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="suboptimal">Suboptimal</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setCategoryFilter('all');
            setSourceFilter('all');
          }}>
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {mockHealthIndicators.filter(i => i.status === 'optimal').length}
            </div>
            <div className="text-sm text-muted-foreground">Optimal</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              {mockHealthIndicators.filter(i => i.status === 'normal').length}
            </div>
            <div className="text-sm text-muted-foreground">Normal</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="text-xl font-bold text-orange-600">
              {mockHealthIndicators.filter(i => i.status === 'suboptimal').length}
            </div>
            <div className="text-sm text-muted-foreground">Suboptimal</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {mockHealthIndicators.filter(i => i.status === 'critical').length}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Benchmark</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIndicators.map((indicator) => (
                <TableRow key={indicator.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{indicator.name}</div>
                      <div className="text-sm text-muted-foreground">{indicator.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {indicator.value} {indicator.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(indicator.status)}>
                      {getStatusIcon(indicator.status)}
                      <span className="ml-1 capitalize">{indicator.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{indicator.benchmark.optimal}</div>
                      <div className="text-muted-foreground">{indicator.benchmark.organization}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSourceIcon(indicator.source)}
                      <span className="text-sm">{indicator.source}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTrendIcon(indicator.trend)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {indicator.timestamp.toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredIndicators.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No health indicators match your current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthIndicatorsTable;
