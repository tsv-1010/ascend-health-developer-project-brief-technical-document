import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useGetHealthStandardsByDomain, 
  useGetHealthStandardByMetric, 
  useAddHealthStandard, 
  useUpdateHealthStandard,
  useIsStandardsInitialized,
  useInitializeStandards
} from '../hooks/useQueries';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { BookOpen, Plus, Edit, CheckCircle, AlertCircle, Database, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const DOMAINS = ['Fitness', 'Nutrition', 'Longevity', 'Mental/Recovery'];

const CentralStandardsMemory: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('Fitness');
  const [searchMetric, setSearchMetric] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: isInitialized = false, isLoading: initCheckLoading } = useIsStandardsInitialized();
  const { data: domainStandards = [], isLoading: standardsLoading } = useGetHealthStandardsByDomain(selectedDomain);
  const { mutate: searchStandard, data: searchResult, isPending: searchPending } = useGetHealthStandardByMetric();
  const { mutate: addStandard, isPending: addPending } = useAddHealthStandard();
  const { mutate: updateStandard, isPending: updatePending } = useUpdateHealthStandard();
  const { mutate: initializeStandards, isPending: initPending } = useInitializeStandards();

  const [formData, setFormData] = useState({
    metricName: '',
    domain: 'Fitness',
    minValue: '',
    maxValue: '',
    units: '',
    evidenceSource: ''
  });

  const handleSearch = () => {
    if (!searchMetric.trim()) {
      toast.error('Please enter a metric name to search');
      return;
    }
    searchStandard(searchMetric);
  };

  const handleAddStandard = () => {
    if (!formData.metricName || !formData.minValue || !formData.maxValue || !formData.units || !formData.evidenceSource) {
      toast.error('Please fill in all fields');
      return;
    }

    const standard = {
      metricName: formData.metricName,
      domain: formData.domain,
      optimalRange: {
        min: BigInt(formData.minValue),
        max: BigInt(formData.maxValue)
      },
      units: formData.units,
      evidenceSource: formData.evidenceSource
    };

    addStandard(standard, {
      onSuccess: () => {
        toast.success('Health standard added successfully');
        setFormData({
          metricName: '',
          domain: 'Fitness',
          minValue: '',
          maxValue: '',
          units: '',
          evidenceSource: ''
        });
        setShowAddForm(false);
      },
      onError: (error) => {
        toast.error(`Failed to add standard: ${error.message}`);
      }
    });
  };

  const handleInitialize = () => {
    initializeStandards(undefined, {
      onSuccess: () => {
        toast.success('Reference standards initialized successfully');
      },
      onError: (error) => {
        toast.error(`Failed to initialize standards: ${error.message}`);
      }
    });
  };

  if (initCheckLoading) {
    return (
      <Card className="modern-card">
        <CardContent className="py-12 text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading standards database...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="modern-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Central Standards Memory</CardTitle>
                <CardDescription>
                  Evidence-based health benchmarks across all core domains
                </CardDescription>
              </div>
            </div>
            {isAdmin && !isInitialized && (
              <Button 
                onClick={handleInitialize}
                disabled={initPending}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {initPending ? 'Initializing...' : 'Initialize Reference Standards'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isInitialized && (
            <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Reference standards not yet initialized. {isAdmin ? 'Click the button above to initialize with default evidence-based benchmarks.' : 'Please contact an administrator to initialize the standards database.'}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl">
              <TabsTrigger value="browse" className="rounded-lg">Browse by Domain</TabsTrigger>
              <TabsTrigger value="search" className="rounded-lg">Search Metric</TabsTrigger>
              {isAdmin && <TabsTrigger value="manage" className="rounded-lg">Manage Standards</TabsTrigger>}
            </TabsList>

            <TabsContent value="browse" className="space-y-4 mt-6">
              <div className="flex items-center gap-4 mb-6">
                <Label className="text-sm font-medium">Select Domain:</Label>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(domain => (
                      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {standardsLoading ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                  <p className="text-muted-foreground">Loading standards...</p>
                </div>
              ) : domainStandards.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-xl">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No standards found for {selectedDomain}</p>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Standard
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domainStandards.map((standard, index) => (
                    <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{standard.metricName}</CardTitle>
                          <Badge variant="outline" className="ml-2">{standard.domain}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Optimal Range:</span>
                          <span className="text-sm text-muted-foreground">
                            {Number(standard.optimalRange.min)} - {Number(standard.optimalRange.max)} {standard.units}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                          <strong>Evidence:</strong> {standard.evidenceSource}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4 mt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter metric name (e.g., 'Resting HR', 'Body Fat %')"
                    value={searchMetric}
                    onChange={(e) => setSearchMetric(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searchPending}>
                  {searchPending ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResult && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{searchResult.metricName}</CardTitle>
                      <Badge className="bg-primary">{searchResult.domain}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Minimum</div>
                        <div className="text-2xl font-bold text-primary">
                          {Number(searchResult.optimalRange.min)}
                        </div>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Maximum</div>
                        <div className="text-2xl font-bold text-primary">
                          {Number(searchResult.optimalRange.max)}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Units</div>
                      <div className="text-lg font-medium">{searchResult.units}</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium mb-2">Evidence Source</div>
                      <div className="text-sm text-muted-foreground">{searchResult.evidenceSource}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {isAdmin && (
              <TabsContent value="manage" className="space-y-4 mt-6">
                {!showAddForm ? (
                  <div className="text-center py-12">
                    <Button onClick={() => setShowAddForm(true)} size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Health Standard
                    </Button>
                  </div>
                ) : (
                  <Card className="border-primary/30">
                    <CardHeader>
                      <CardTitle>Add New Health Standard</CardTitle>
                      <CardDescription>
                        Define evidence-based benchmarks for health metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="metricName">Metric Name</Label>
                          <Input
                            id="metricName"
                            placeholder="e.g., VO2 Max"
                            value={formData.metricName}
                            onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="domain">Domain</Label>
                          <Select value={formData.domain} onValueChange={(value) => setFormData({ ...formData, domain: value })}>
                            <SelectTrigger id="domain">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DOMAINS.map(domain => (
                                <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minValue">Minimum Value</Label>
                          <Input
                            id="minValue"
                            type="number"
                            placeholder="e.g., 40"
                            value={formData.minValue}
                            onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxValue">Maximum Value</Label>
                          <Input
                            id="maxValue"
                            type="number"
                            placeholder="e.g., 60"
                            value={formData.maxValue}
                            onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="units">Units</Label>
                          <Input
                            id="units"
                            placeholder="e.g., ml/kg/min"
                            value={formData.units}
                            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="evidenceSource">Evidence Source</Label>
                        <Input
                          id="evidenceSource"
                          placeholder="e.g., American College of Sports Medicine"
                          value={formData.evidenceSource}
                          onChange={(e) => setFormData({ ...formData, evidenceSource: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={handleAddStandard} 
                          disabled={addPending}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {addPending ? 'Adding...' : 'Add Standard'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <Alert className="border-blue-500/50 bg-blue-500/10">
        <CheckCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <strong>Integration Note:</strong> All Domain Agents (Nutrition, Fitness, Longevity, Mental/Recovery) can query these standards for normalized baseline comparisons when interpreting user data and forming recommendations.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CentralStandardsMemory;
