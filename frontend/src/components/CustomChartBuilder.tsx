import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  Calendar, 
  ZoomIn, 
  ZoomOut, 
  Move,
  Save,
  Share2,
  Download,
  Plus,
  X,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar';
  metrics: string[];
  timeRange: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface MetricData {
  date: string;
  [key: string]: string | number;
}

const CustomChartBuilder: React.FC = () => {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [currentChart, setCurrentChart] = useState<ChartConfig>({
    id: '',
    title: 'New Chart',
    type: 'line',
    metrics: [],
    timeRange: '30d',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  });

  // Available metrics from wearables and lab data
  const availableMetrics = [
    // Cardiovascular
    { id: 'heart_rate', name: 'Heart Rate', unit: 'bpm', source: 'Oura Ring', category: 'Cardiovascular' },
    { id: 'hrv', name: 'HRV (RMSSD)', unit: 'ms', source: 'WHOOP', category: 'Cardiovascular' },
    { id: 'blood_pressure_sys', name: 'Blood Pressure (Systolic)', unit: 'mmHg', source: 'Manual', category: 'Cardiovascular' },
    { id: 'blood_pressure_dia', name: 'Blood Pressure (Diastolic)', unit: 'mmHg', source: 'Manual', category: 'Cardiovascular' },
    
    // Activity
    { id: 'steps', name: 'Daily Steps', unit: 'steps', source: 'Apple Health', category: 'Activity' },
    { id: 'active_calories', name: 'Active Calories', unit: 'kcal', source: 'Apple Health', category: 'Activity' },
    { id: 'vo2_max', name: 'VO2 Max', unit: 'mL/kg/min', source: 'Apple Health', category: 'Activity' },
    
    // Sleep
    { id: 'sleep_duration', name: 'Sleep Duration', unit: 'hours', source: 'Oura Ring', category: 'Sleep' },
    { id: 'sleep_efficiency', name: 'Sleep Efficiency', unit: '%', source: 'Oura Ring', category: 'Sleep' },
    { id: 'rem_sleep', name: 'REM Sleep', unit: '%', source: 'Oura Ring', category: 'Sleep' },
    { id: 'deep_sleep', name: 'Deep Sleep', unit: '%', source: 'Oura Ring', category: 'Sleep' },
    
    // Metabolic
    { id: 'glucose', name: 'Glucose', unit: 'mg/dL', source: 'Levels CGM', category: 'Metabolic' },
    { id: 'hba1c', name: 'HbA1c', unit: '%', source: 'Function Health', category: 'Metabolic' },
    { id: 'insulin', name: 'Insulin', unit: 'μU/mL', source: 'Function Health', category: 'Metabolic' },
    
    // Lipids
    { id: 'total_cholesterol', name: 'Total Cholesterol', unit: 'mg/dL', source: 'Function Health', category: 'Lipids' },
    { id: 'hdl_cholesterol', name: 'HDL Cholesterol', unit: 'mg/dL', source: 'Function Health', category: 'Lipids' },
    { id: 'ldl_cholesterol', name: 'LDL Cholesterol', unit: 'mg/dL', source: 'Function Health', category: 'Lipids' },
    { id: 'triglycerides', name: 'Triglycerides', unit: 'mg/dL', source: 'Function Health', category: 'Lipids' },
    
    // Vitamins
    { id: 'vitamin_d', name: 'Vitamin D', unit: 'ng/mL', source: 'Function Health', category: 'Vitamins' },
    { id: 'vitamin_b12', name: 'Vitamin B12', unit: 'pg/mL', source: 'Function Health', category: 'Vitamins' },
    
    // Hormones
    { id: 'tsh', name: 'TSH', unit: 'mIU/L', source: 'Function Health', category: 'Hormones' },
    { id: 'cortisol', name: 'Cortisol', unit: 'μg/dL', source: 'Function Health', category: 'Hormones' },
  ];

  // Generate mock data for selected metrics
  const generateMockData = (metrics: string[], days: number): MetricData[] => {
    const data: MetricData[] = [];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dataPoint: MetricData = {
        date: date.toLocaleDateString()
      };
      
      metrics.forEach(metricId => {
        const metric = availableMetrics.find(m => m.id === metricId);
        if (metric) {
          // Generate realistic mock values based on metric type
          let value = 0;
          switch (metricId) {
            case 'heart_rate':
              value = 60 + Math.random() * 20;
              break;
            case 'hrv':
              value = 30 + Math.random() * 30;
              break;
            case 'steps':
              value = 6000 + Math.random() * 8000;
              break;
            case 'sleep_duration':
              value = 6.5 + Math.random() * 2;
              break;
            case 'sleep_efficiency':
              value = 80 + Math.random() * 15;
              break;
            case 'glucose':
              value = 80 + Math.random() * 40;
              break;
            case 'total_cholesterol':
              value = 160 + Math.random() * 80;
              break;
            case 'vitamin_d':
              value = 20 + Math.random() * 40;
              break;
            default:
              value = Math.random() * 100;
          }
          dataPoint[metricId] = Math.round(value * 10) / 10;
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };

  const addMetric = (metricId: string) => {
    if (!currentChart.metrics.includes(metricId)) {
      setCurrentChart(prev => ({
        ...prev,
        metrics: [...prev.metrics, metricId]
      }));
    }
  };

  const removeMetric = (metricId: string) => {
    setCurrentChart(prev => ({
      ...prev,
      metrics: prev.metrics.filter(m => m !== metricId)
    }));
  };

  const updateTimeRange = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    setCurrentChart(prev => ({
      ...prev,
      timeRange: range,
      dateRange: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    }));
  };

  const saveChart = () => {
    if (currentChart.metrics.length === 0) {
      toast.error('Please select at least one metric');
      return;
    }
    
    const newChart: ChartConfig = {
      ...currentChart,
      id: `chart_${Date.now()}`
    };
    
    setCharts(prev => [...prev, newChart]);
    setCurrentChart({
      id: '',
      title: 'New Chart',
      type: 'line',
      metrics: [],
      timeRange: '30d',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    });
    
    toast.success('Chart saved successfully!');
  };

  const deleteChart = (chartId: string) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
    toast.success('Chart deleted');
  };

  const exportChart = (chart: ChartConfig) => {
    const days = chart.timeRange === '7d' ? 7 : chart.timeRange === '30d' ? 30 : chart.timeRange === '90d' ? 90 : 365;
    const data = generateMockData(chart.metrics, days);
    
    const csvContent = [
      ['Date', ...chart.metrics.map(m => availableMetrics.find(metric => metric.id === m)?.name || m)].join(','),
      ...data.map(row => [
        row.date,
        ...chart.metrics.map(m => row[m] || '')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chart data exported!');
  };

  const categories = [...new Set(availableMetrics.map(m => m.category))];
  const days = currentChart.timeRange === '7d' ? 7 : currentChart.timeRange === '30d' ? 30 : currentChart.timeRange === '90d' ? 90 : 365;
  const chartData = currentChart.metrics.length > 0 ? generateMockData(currentChart.metrics, days) : [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];

  return (
    <div className="space-y-6">
      {/* Chart Builder */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Custom Chart Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chart Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Chart Title</Label>
              <input
                type="text"
                value={currentChart.title}
                onChange={(e) => setCurrentChart(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter chart title"
              />
            </div>
            
            <div>
              <Label>Chart Type</Label>
              <Select value={currentChart.type} onValueChange={(value: 'line' | 'bar') => 
                setCurrentChart(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-4 h-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Time Range</Label>
              <Select value={currentChart.timeRange} onValueChange={updateTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="365d">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={saveChart} disabled={currentChart.metrics.length === 0}>
                <Save className="w-4 h-4 mr-2" />
                Save Chart
              </Button>
            </div>
          </div>

          <Separator />

          {/* Metric Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Select Metrics</Label>
              <Badge variant="outline">
                {currentChart.metrics.length} selected
              </Badge>
            </div>
            
            {/* Selected Metrics */}
            {currentChart.metrics.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Metrics:</Label>
                <div className="flex flex-wrap gap-2">
                  {currentChart.metrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId);
                    return (
                      <Badge key={metricId} variant="default" className="flex items-center gap-1">
                        {metric?.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeMetric(metricId)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Available Metrics by Category */}
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">{category}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableMetrics
                      .filter(metric => metric.category === category)
                      .map(metric => (
                        <Button
                          key={metric.id}
                          variant={currentChart.metrics.includes(metric.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => currentChart.metrics.includes(metric.id) 
                            ? removeMetric(metric.id) 
                            : addMetric(metric.id)
                          }
                          className="justify-start text-left h-auto p-2"
                        >
                          <div>
                            <div className="font-medium text-xs">{metric.name}</div>
                            <div className="text-xs text-muted-foreground">{metric.source}</div>
                          </div>
                        </Button>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Preview */}
          {currentChart.metrics.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="text-lg">Chart Preview</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Move className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {currentChart.type === 'line' ? (
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      {currentChart.metrics.map((metricId, index) => {
                        const metric = availableMetrics.find(m => m.id === metricId);
                        return (
                          <Line
                            key={metricId}
                            type="monotone"
                            dataKey={metricId}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            name={metric?.name || metricId}
                          />
                        );
                      })}
                    </RechartsLineChart>
                  ) : (
                    <RechartsBarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      {currentChart.metrics.map((metricId, index) => {
                        const metric = availableMetrics.find(m => m.id === metricId);
                        return (
                          <Bar
                            key={metricId}
                            dataKey={metricId}
                            fill={colors[index % colors.length]}
                            name={metric?.name || metricId}
                          />
                        );
                      })}
                    </RechartsBarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Charts */}
      {charts.length > 0 && (
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Saved Charts ({charts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map(chart => {
                const chartData = generateMockData(chart.metrics, 
                  chart.timeRange === '7d' ? 7 : chart.timeRange === '30d' ? 30 : chart.timeRange === '90d' ? 90 : 365
                );
                
                return (
                  <Card key={chart.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{chart.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => exportChart(chart)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteChart(chart.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {chart.type === 'line' ? <LineChart className="w-3 h-3 mr-1" /> : <BarChart3 className="w-3 h-3 mr-1" />}
                          {chart.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {chart.timeRange}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {chart.metrics.length} metrics
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {chart.type === 'line' ? (
                            <RechartsLineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="date" className="text-xs" />
                              <YAxis className="text-xs" />
                              <Tooltip />
                              {chart.metrics.map((metricId, index) => (
                                <Line
                                  key={metricId}
                                  type="monotone"
                                  dataKey={metricId}
                                  stroke={colors[index % colors.length]}
                                  strokeWidth={2}
                                />
                              ))}
                            </RechartsLineChart>
                          ) : (
                            <RechartsBarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="date" className="text-xs" />
                              <YAxis className="text-xs" />
                              <Tooltip />
                              {chart.metrics.map((metricId, index) => (
                                <Bar
                                  key={metricId}
                                  dataKey={metricId}
                                  fill={colors[index % colors.length]}
                                />
                              ))}
                            </RechartsBarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          <strong>Chart Builder Tips:</strong> Select multiple metrics to compare trends over time. 
          Use line charts for continuous data and bar charts for discrete measurements. 
          Charts support zoom and pan functionality for detailed analysis. 
          Export your charts as CSV for external analysis or sharing.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CustomChartBuilder;
