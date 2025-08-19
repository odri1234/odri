import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Phone, 
  Mail, 
  Headphones, 
  LifeBuoy, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart,
  Settings, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  RefreshCw, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal,
  Globe, 
  MapPin, 
  Calendar, 
  Zap, 
  Target, 
  Award, 
  Lightbulb, 
  Cpu, 
  Database, 
  Server, 
  Monitor, 
  Network, 
  Wifi, 
  Router, 
  Signal, 
  Battery, 
  Power, 
  Gauge, 
  Thermometer, 
  HardDrive, 
  MemoryStick,
  Package, 
  Gift, 
  Percent, 
  Calculator, 
  Receipt, 
  FileText, 
  Folder, 
  Archive, 
  Tag, 
  Hash, 
  AtSign, 
  ExternalLink, 
  Copy, 
  Share, 
  Bookmark, 
  Flag,
  Bell,
  Crown,
  Briefcase,
  UserCheck,
  UserX,
  UserPlus,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Building2,
  Home,
  MapIcon,
  Truck,
  ShoppingCart,
  PiggyBank,
  TrendingUpIcon,
  Layers,
  Grid,
  List,
  Table,
  Columns,
  Rows,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Focus,
  Scan,
  Camera,
  Webcam,
  Volume,
  Volume1,
  Volume2,
  VolumeOff,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Shuffle,
  Image,
  Video,
  Music,
  File,
  Paperclip,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';

// Message Component
const ChatMessage = ({ message, isBot = false, timestamp, rating }: { 
  message: string; 
  isBot?: boolean; 
  timestamp: Date;
  rating?: 'positive' | 'negative' | null;
}) => {
  const [messageRating, setMessageRating] = useState(rating);

  return (
    <div className={cn("flex gap-3 mb-4", isBot ? "justify-start" : "justify-end")}>
      {isBot && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[70%] space-y-2", !isBot && "order-first")}>
        <div className={cn(
          "rounded-lg px-4 py-2",
          isBot 
            ? "bg-gray-100 text-gray-900" 
            : "bg-blue-500 text-white"
        )}>
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{timestamp.toLocaleTimeString()}</span>
          {isBot && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 w-6 p-0", messageRating === 'positive' && "text-green-500")}
                onClick={() => setMessageRating(messageRating === 'positive' ? null : 'positive')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 w-6 p-0", messageRating === 'negative' && "text-red-500")}
                onClick={() => setMessageRating(messageRating === 'negative' ? null : 'negative')}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {!isBot && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ onActionClick }: { onActionClick: (action: string) => void }) => {
  const actions = [
    { id: 'check_balance', label: 'Check Balance', icon: Wallet },
    { id: 'payment_issue', label: 'Payment Issue', icon: CreditCard },
    { id: 'network_problem', label: 'Network Problem', icon: Wifi },
    { id: 'account_help', label: 'Account Help', icon: UserCheck },
    { id: 'billing_question', label: 'Billing Question', icon: Receipt },
    { id: 'technical_support', label: 'Technical Support', icon: Settings },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="h-auto p-3 flex flex-col items-center gap-2"
            onClick={() => onActionClick(action.label)}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

// Chat Interface Component
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
      rating: null,
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      message: inputMessage,
      isBot: false,
      timestamp: new Date(),
      rating: null,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        message: generateAIResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
        rating: null,
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('balance') || message.includes('account')) {
      return "I can help you check your account balance. Your current balance is KES 1,250. Would you like me to show you recent transactions or help you top up?";
    }
    
    if (message.includes('payment') || message.includes('pay')) {
      return "I see you're having payment issues. Let me help you with that. Are you trying to make a payment or having trouble with a recent transaction? I can guide you through M-PESA, card payments, or other options.";
    }
    
    if (message.includes('network') || message.includes('internet') || message.includes('wifi')) {
      return "I understand you're experiencing network issues. Let me run a quick diagnostic... Your connection appears to be stable. Are you experiencing slow speeds, disconnections, or unable to connect? I can help troubleshoot or escalate to our technical team.";
    }
    
    if (message.includes('bill') || message.includes('invoice')) {
      return "I can help you with billing questions. Your next bill is due on March 15th for KES 2,500. Would you like me to send you the detailed invoice, set up auto-pay, or help with payment options?";
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm here to help you with any questions about your internet service, payments, account management, or technical issues. What can I assist you with today?";
    }
    
    return "I understand your concern. Let me help you with that. Could you provide more details so I can give you the most accurate assistance? If needed, I can also connect you with a human agent.";
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    handleSendMessage();
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Start voice recognition
      toast({
        title: "Voice Input",
        description: "Voice recognition started. Speak now...",
      });
    } else {
      // Stop voice recognition
      toast({
        title: "Voice Input",
        description: "Voice recognition stopped.",
      });
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          AI Customer Support
        </CardTitle>
        <CardDescription>
          Get instant help with your account, payments, and technical issues
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <QuickActions onActionClick={handleQuickAction} />
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.message}
                isBot={msg.isBot}
                timestamp={msg.timestamp}
                rating={msg.rating}
              />
            ))}
            {isTyping && (
              <div className="flex gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceInput}
              className={cn(isListening && "bg-red-500 text-white")}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Support Analytics Component
const SupportAnalytics = () => {
  const analytics = {
    totalChats: 1247,
    resolvedChats: 1089,
    avgResponseTime: '2.3 seconds',
    satisfactionScore: 4.6,
    commonIssues: [
      { issue: 'Payment Problems', count: 342, percentage: 27.4 },
      { issue: 'Network Issues', count: 298, percentage: 23.9 },
      { issue: 'Account Questions', count: 187, percentage: 15.0 },
      { issue: 'Billing Inquiries', count: 156, percentage: 12.5 },
      { issue: 'Technical Support', count: 134, percentage: 10.7 },
      { issue: 'Other', count: 130, percentage: 10.4 },
    ],
    hourlyVolume: [
      { hour: '00:00', volume: 12 },
      { hour: '06:00', volume: 45 },
      { hour: '12:00', volume: 89 },
      { hour: '18:00', volume: 156 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Chats</p>
                <p className="text-2xl font-bold">{analytics.totalChats.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Resolution Rate</p>
                <p className="text-2xl font-bold">{((analytics.resolvedChats / analytics.totalChats) * 100).toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold">{analytics.avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Satisfaction Score</p>
                <p className="text-2xl font-bold">{analytics.satisfactionScore}/5</p>
              </div>
              <Star className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
            <CardDescription>Most frequent customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.commonIssues.map((issue, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{issue.issue}</span>
                    <span className="text-sm text-muted-foreground">{issue.count}</span>
                  </div>
                  <Progress value={issue.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat Volume by Hour</CardTitle>
            <CardDescription>Customer support activity throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-600">Volume Chart</p>
                <p className="text-muted-foreground">Hourly chat volume visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// AI Configuration Component
const AIConfiguration = () => {
  const [config, setConfig] = useState({
    enabled: true,
    language: 'en',
    responseDelay: 1.5,
    maxResponseLength: 500,
    escalationThreshold: 3,
    knowledgeBaseEnabled: true,
    sentimentAnalysis: true,
    autoTranslation: false,
    voiceEnabled: true,
    businessHours: {
      enabled: true,
      start: '08:00',
      end: '18:00',
      timezone: 'Africa/Nairobi',
    },
    fallbackToHuman: true,
    learningMode: true,
    confidenceThreshold: 0.8,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Configuration
        </CardTitle>
        <CardDescription>
          Configure AI chatbot behavior and capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable AI Chatbot</Label>
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            
            <div>
              <Label htmlFor="language">Primary Language</Label>
              <Select value={config.language} onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="responseDelay">Response Delay (seconds)</Label>
              <Input
                id="responseDelay"
                type="number"
                step="0.1"
                value={config.responseDelay}
                onChange={(e) => setConfig(prev => ({ ...prev, responseDelay: parseFloat(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="maxResponseLength">Max Response Length</Label>
              <Input
                id="maxResponseLength"
                type="number"
                value={config.maxResponseLength}
                onChange={(e) => setConfig(prev => ({ ...prev, maxResponseLength: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalationThreshold">Escalation Threshold</Label>
              <Input
                id="escalationThreshold"
                type="number"
                value={config.escalationThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, escalationThreshold: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of failed attempts before escalating to human
              </p>
            </div>
            
            <div>
              <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
              <Input
                id="confidenceThreshold"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={config.confidenceThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum confidence level for AI responses (0-1)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="knowledgeBase">Knowledge Base</Label>
                <Switch
                  id="knowledgeBase"
                  checked={config.knowledgeBaseEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, knowledgeBaseEnabled: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sentimentAnalysis">Sentiment Analysis</Label>
                <Switch
                  id="sentimentAnalysis"
                  checked={config.sentimentAnalysis}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, sentimentAnalysis: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="autoTranslation">Auto Translation</Label>
                <Switch
                  id="autoTranslation"
                  checked={config.autoTranslation}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoTranslation: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="voiceEnabled">Voice Input/Output</Label>
                <Switch
                  id="voiceEnabled"
                  checked={config.voiceEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, voiceEnabled: checked }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Business Hours</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="businessHoursEnabled">Enable Business Hours</Label>
              <Switch
                id="businessHoursEnabled"
                checked={config.businessHours.enabled}
                onCheckedChange={(checked) => setConfig(prev => ({ 
                  ...prev, 
                  businessHours: { ...prev.businessHours, enabled: checked }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={config.businessHours.start}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  businessHours: { ...prev.businessHours, start: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={config.businessHours.end}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  businessHours: { ...prev.businessHours, end: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>

        <Button className="w-full">
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Component
export const AICustomerSupport = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Customer Support</h1>
          <p className="text-muted-foreground">
            AI-powered chatbot for instant customer assistance and support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Chats</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Length</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Wait Time</span>
                    <Badge variant="secondary">1.2 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Resolution Rate</span>
                    <Badge className="bg-green-500">87.3%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Human Agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Online Agents</span>
                    <Badge className="bg-green-500">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Busy Agents</span>
                    <Badge className="bg-yellow-500">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Agents</span>
                    <Badge className="bg-blue-500">5</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Escalate to Human
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SupportAnalytics />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <AIConfiguration />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Knowledge Base Management
              </CardTitle>
              <CardDescription>
                Manage AI training data and knowledge articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="font-semibold">Articles</p>
                      <p className="text-2xl font-bold">247</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="font-semibold">FAQs</p>
                      <p className="text-2xl font-bold">89</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="font-semibold">Training Data</p>
                      <p className="text-2xl font-bold">1.2K</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Article
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Train Model
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICustomerSupport;