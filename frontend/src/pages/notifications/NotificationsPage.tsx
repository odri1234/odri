import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { notificationsService as notificationService } from '@/services/api.service';
import { Bell, Send, Users, MessageSquare, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  userId?: string;
  userName?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  type: string;
  variables: string[];
}

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  
  const [singleNotification, setSingleNotification] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
  });

  const [bulkNotification, setBulkNotification] = useState({
    userIds: [] as string[],
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
  });

  const queryClient = useQueryClient();

  // Fetch notification logs
  const { data: notificationLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: () => notificationService.getNotificationLogs(),
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationService.getTemplates(),
  });

  // Send single notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: notificationService.sendNotification,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Notification sent successfully',
      });
      setSingleNotification({
        userId: '',
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    },
  });

  // Send bulk notifications mutation
  const sendBulkNotificationMutation = useMutation({
    mutationFn: notificationService.sendBulkNotifications,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Bulk notifications sent successfully',
      });
      setBulkNotification({
        userIds: [],
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
      });
      setIsBulkDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send bulk notifications',
        variant: 'destructive',
      });
    },
  });

  const handleSendNotification = () => {
    if (!singleNotification.userId || !singleNotification.title || !singleNotification.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    sendNotificationMutation.mutate(singleNotification);
  };

  const handleSendBulkNotification = () => {
    if (bulkNotification.userIds.length === 0 || !bulkNotification.title || !bulkNotification.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields and select users',
        variant: 'destructive',
      });
      return;
    }
    sendBulkNotificationMutation.mutate(bulkNotification);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Send and manage notifications to users
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="logs">Notification Logs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Single Notification
                </CardTitle>
                <CardDescription>
                  Send a notification to a specific user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Single Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Send Notification</DialogTitle>
                      <DialogDescription>
                        Send a notification to a specific user
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          value={singleNotification.userId}
                          onChange={(e) => setSingleNotification(prev => ({ ...prev, userId: e.target.value }))}
                          placeholder="Enter user ID"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={singleNotification.title}
                          onChange={(e) => setSingleNotification(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Notification title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={singleNotification.message}
                          onChange={(e) => setSingleNotification(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Notification message"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={singleNotification.type}
                            onValueChange={(value) => setSingleNotification(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={singleNotification.priority}
                            onValueChange={(value) => setSingleNotification(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSendNotification}
                        disabled={sendNotificationMutation.isPending}
                      >
                        {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Notifications
                </CardTitle>
                <CardDescription>
                  Send notifications to multiple users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Send Bulk Notifications
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Send Bulk Notifications</DialogTitle>
                      <DialogDescription>
                        Send notifications to multiple users
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userIds">User IDs (comma-separated)</Label>
                        <Textarea
                          id="userIds"
                          value={bulkNotification.userIds.join(', ')}
                          onChange={(e) => setBulkNotification(prev => ({ 
                            ...prev, 
                            userIds: e.target.value.split(',').map(id => id.trim()).filter(id => id) 
                          }))}
                          placeholder="user1, user2, user3..."
                          rows={2}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bulkTitle">Title</Label>
                        <Input
                          id="bulkTitle"
                          value={bulkNotification.title}
                          onChange={(e) => setBulkNotification(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Notification title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bulkMessage">Message</Label>
                        <Textarea
                          id="bulkMessage"
                          value={bulkNotification.message}
                          onChange={(e) => setBulkNotification(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Notification message"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="bulkType">Type</Label>
                          <Select
                            value={bulkNotification.type}
                            onValueChange={(value) => setBulkNotification(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="bulkPriority">Priority</Label>
                          <Select
                            value={bulkNotification.priority}
                            onValueChange={(value) => setBulkNotification(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSendBulkNotification}
                        disabled={sendBulkNotificationMutation.isPending}
                      >
                        {sendBulkNotificationMutation.isPending ? 'Sending...' : 'Send Bulk Notifications'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Logs</CardTitle>
              <CardDescription>
                View all sent notifications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notificationLogs?.map((log: NotificationLog) => (
                    <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{log.title}</h4>
                          <Badge className={getTypeColor(log.type)}>{log.type}</Badge>
                          <Badge className={getPriorityColor(log.priority)}>{log.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.message}</p>
                        {log.userName && (
                          <p className="text-xs text-muted-foreground">To: {log.userName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm capitalize">{log.status}</span>
                      </div>
                    </div>
                  ))}
                  {(!notificationLogs || notificationLogs.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No notification logs found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Manage notification templates for quick sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates?.map((template: NotificationTemplate) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{template.content}</p>
                        <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                        {template.variables.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Variables:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.variables.map((variable, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(!templates || templates.length === 0) && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No templates found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;