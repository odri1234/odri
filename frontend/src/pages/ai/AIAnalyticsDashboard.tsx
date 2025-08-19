import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Target, 
  Zap, 
  Eye, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  DollarSign, 
  Wifi, 
  Server, 
  Database, 
  Network, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  Bell,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Router,
  Globe,
  Lock,
  Key,
  Award,
  Star,
  Lightbulb,
  Cpu,
  HardDrive,
  MemoryStick,
  WifiOff,
  SignalHigh,
  SignalLow,
  Gauge
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

// AI Insight Card Component
const AIInsightCard = ({ insight }: { insight: any }) => {
  const severityConfig = {
    critical: { color: 'bg-red-500', icon: AlertTriangle },
    high: { color: 'bg-orange-500', icon: AlertTriangle },
    medium: { color: 'bg-yellow-500', icon: Eye },
    low: { color: 'bg-blue-500', icon: Lightbulb },
    info: { color: 'bg-green-500', icon: CheckCircle },
  };

  const config = severityConfig[insight.severity as keyof typeof severityConfig] || severityConfig.info;
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.color)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <CardDescription>{insight.category}</CardDescription>
            </div>
          </div>
          <Badge variant={insight.severity === 'critical' ? 'destructive' : 'default'}>
            {insight.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{insight.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Confidence: {insight.confidence}%
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button size="sm">
              Take Action
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Real-time AI Metrics Component
const RealTimeAIMetrics = () => {
  const { data: metrics = {
    anomaliesDetected: 0,
    predictionsGenerated: 0,
    modelsRunning: 0,
    accuracyScore: 0,
  }, isLoading } = useQuery({
    queryKey: ['ai-metrics'],
    queryFn: () => aiService.getMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    select: (data) => ({
      anomaliesDetected: data?.anomaliesDetected || 0,
      predictionsGenerated: data?.predictionsGenerated || 0,
      modelsRunning: data?.modelsRunning || 0,
      accuracyScore: data?.accuracyScore || 0,
    })
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Anomalies Detected</p>
              <p className="text-2xl font-bold">{metrics.anomaliesDetected}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Predictions Generated</p>
              <p className="text-2xl font-bold">{metrics.predictionsGenerated}</p>
            </div>
            <Brain className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Models Running</p>
              <p className="text-2xl font-bold">{metrics.modelsRunning}</p>
            </div>
            <Cpu className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Accuracy Score</p>
              <p className="text-2xl font-bold">{metrics.accuracyScore}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Anomaly Detection Component
const AnomalyDetectionPanel = () => {
  const { user } = useAuthStore();
  
  const { data: anomalies = [], isLoading } = useQuery({
    queryKey: ['anomalies', user?.ispId],
    queryFn: () => aiService.getAnomalies(user?.ispId),
    refetchInterval: 60000, // Refresh every minute
    enabled: !!user?.ispId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Real-time Anomaly Detection
        </CardTitle>
        <CardDescription>
          AI-powered detection of unusual patterns and potential threats
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : anomalies.length > 0 ? (
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 
                                    anomaly.severity === 'high' ? 'destructive' : 
                                    anomaly.severity === 'medium' ? 'secondary' : 'default'}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{anomaly.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {anomaly.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {anomaly.affected} affected
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {anomaly.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                    <Button 
                      size="sm" 
                      variant={anomaly.severity === 'critical' ? 'destructive' : 'default'}
                      onClick={() => aiService.resolveAnomaly(anomaly.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Anomalies Detected</h3>
            <p className="text-muted-foreground">
              All systems are currently operating normally
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Predictive Analytics Component
const PredictiveAnalytics = () => {
  const { user } = useAuthStore();
  
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictions', user?.ispId],
    queryFn: () => aiService.getPredictions(user?.ispId),
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: !!user?.ispId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Predictive Analytics
        </CardTitle>
        <CardDescription>
          AI-powered predictions and forecasts for business planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={prediction.impact === 'High' ? 'destructive' : 
                                    prediction.impact === 'Medium' ? 'secondary' : 'default'}>
                        {prediction.impact} Impact
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {prediction.timeframe}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{prediction.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{prediction.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Confidence: {prediction.confidence}%</span>
                      <span>Recommended: {prediction.action}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => aiService.implementPrediction(prediction.id)}
                    >
                      Take Action
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
            <p className="text-muted-foreground">
              AI models are still gathering data to make accurate predictions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// AI Model Performance Component
const AIModelPerformance = () => {
  const { user } = useAuthStore();
  
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['ai-models', user?.ispId],
    queryFn: () => aiService.getModels(user?.ispId),
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: !!user?.ispId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          AI Model Performance
        </CardTitle>
        <CardDescription>
          Monitor and manage AI model performance and accuracy
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : models.length > 0 ? (
          <div className="space-y-4">
            {models.map((model, index) => (
              <div key={model.id || index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{model.name}</h4>
                    <p className="text-sm text-muted-foreground">{model.type}</p>
                  </div>
                  <Badge variant={model.status === 'active' ? 'default' : 
                                model.status === 'training' ? 'secondary' : 'destructive'}>
                    {model.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                    <p className="font-semibold">{model.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Predictions</p>
                    <p className="font-semibold">{model.predictions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Trained</p>
                    <p className="font-semibold">
                      {typeof model.lastTrained === 'string' 
                        ? model.lastTrained 
                        : new Date(model.lastTrained).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold">{model.status}</p>
                  </div>
                </div>
                
                <Progress value={model.accuracy} className="mb-3" />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => aiService.retrainModel(model.id)}
                    disabled={model.status === 'training'}
                  >
                    {model.status === 'training' ? 'Training...' : 'Retrain'}
                  </Button>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Cpu className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Models Available</h3>
            <p className="text-muted-foreground">
              No AI models have been deployed for your organization yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Smart Recommendations Component
const SmartRecommendations = () => {
  const { user } = useAuthStore();
  
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', user?.ispId],
    queryFn: () => aiService.getRecommendations(user?.ispId),
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: !!user?.ispId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>
          AI-generated recommendations to optimize your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{rec.category}</Badge>
                      <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'}>
                        {rec.impact} Impact
                      </Badge>
                      <Badge variant="outline">
                        {rec.effort} Effort
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <p className="text-sm font-medium text-green-600">
                      Potential savings: {rec.savings}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => aiService.getRecommendationDetails(rec.id)}
                    >
                      Learn More
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => aiService.implementRecommendation(rec.id)}
                    >
                      Implement
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground">
              AI is still analyzing your data to generate personalized recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
export const AIAnalyticsDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Fetch AI insights data
  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights', user?.ispId, selectedTimeRange],
    queryFn: () => aiService.getInsights(user?.ispId, selectedTimeRange),
    enabled: !!user?.ispId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered insights and predictions for your ISP business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
              queryClient.invalidateQueries({ queryKey: ['ai-metrics'] });
              queryClient.invalidateQueries({ queryKey: ['anomalies'] });
              queryClient.invalidateQueries({ queryKey: ['predictions'] });
              queryClient.invalidateQueries({ queryKey: ['ai-models'] });
              queryClient.invalidateQueries({ queryKey: ['recommendations'] });
              toast({
                title: "Refreshing data",
                description: "Fetching the latest AI analytics data"
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Data
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time AI Metrics */}
      <RealTimeAIMetrics />

      {/* AI Insights Grid */}
      {insightsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : aiInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiInsights.map((insight) => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI is still analyzing your data to generate valuable insights. Check back soon or adjust your time range.
          </p>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="anomalies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies">
          <AnomalyDetectionPanel />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="models">
          <AIModelPerformance />
        </TabsContent>

        <TabsContent value="recommendations">
          <SmartRecommendations />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI models and detection thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Anomaly Detection</Label>
                      <p className="text-sm text-muted-foreground">Enable continuous monitoring</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Predictive Analytics</Label>
                      <p className="text-sm text-muted-foreground">Generate future predictions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-remediation</Label>
                      <p className="text-sm text-muted-foreground">Automatically fix detected issues</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Smart Notifications</Label>
                      <p className="text-sm text-muted-foreground">AI-powered alert prioritization</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (fewer alerts)</SelectItem>
                        <SelectItem value="medium">Medium (balanced)</SelectItem>
                        <SelectItem value="high">High (more alerts)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="confidence">Minimum Confidence</Label>
                    <Select defaultValue="75">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                        <SelectItem value="95">95%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="retraining">Model Retraining</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Save AI Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;