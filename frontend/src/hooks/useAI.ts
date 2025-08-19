import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { toast } from '@/hooks/use-toast';

// Types for AI functionality
export interface AnomalyDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  affectedEntity: {
    type: string;
    id: string;
    name: string;
  };
  metrics: {
    name: string;
    value: number;
    threshold: number;
    unit: string;
  }[];
  status: 'new' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface PricingSuggestion {
  id: string;
  planId?: string;
  planName?: string;
  currentPrice: number;
  suggestedPrice: number;
  currency: string;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  timestamp: string;
  implementedAt?: string;
  implementedBy?: string;
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: string;
  status: 'active' | 'training' | 'inactive';
  accuracy: number;
  lastTrainedAt: string;
  parameters: Record<string, any>;
}

export interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  models: {
    name: string;
    status: 'active' | 'inactive';
    lastUsed: string;
  }[];
  latency: number;
  uptime: number;
  lastTrainingRun: string;
  errorRate: number;
}

// Hook for AI anomaly detection
export const useAnomalyDetection = () => {
  const queryClient = useQueryClient();

  // Fetch anomalies
  const { data: anomalies, isLoading, error, refetch } = useQuery({
    queryKey: ['anomalies'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.AI.ANOMALY_ALERT);
      return response.data.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Acknowledge anomaly
  const { mutate: acknowledgeAnomaly } = useMutation({
    mutationFn: async (anomalyId: string) => {
      return api.post(`${API_ENDPOINTS.AI.ANOMALY_ALERT}/${anomalyId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
      toast({
        title: 'Anomaly Acknowledged',
        description: 'The anomaly has been acknowledged successfully.',
      });
    },
  });

  // Resolve anomaly
  const { mutate: resolveAnomaly } = useMutation({
    mutationFn: async (anomalyId: string) => {
      return api.post(`${API_ENDPOINTS.AI.ANOMALY_ALERT}/${anomalyId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
      toast({
        title: 'Anomaly Resolved',
        description: 'The anomaly has been resolved successfully.',
      });
    },
  });

  return {
    anomalies,
    isLoading,
    error,
    refetch,
    acknowledgeAnomaly,
    resolveAnomaly,
  };
};

// Hook for AI pricing suggestions
export const usePricingSuggestions = () => {
  const queryClient = useQueryClient();

  // Fetch pricing suggestions
  const { data: suggestions, isLoading, error, refetch } = useQuery({
    queryKey: ['pricing-suggestions'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.AI.PRICING_SUGGESTION);
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Implement pricing suggestion
  const { mutate: implementSuggestion } = useMutation({
    mutationFn: async (suggestionId: string) => {
      return api.post(`${API_ENDPOINTS.AI.PRICING_SUGGESTION}/${suggestionId}/implement`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: 'Pricing Updated',
        description: 'The pricing suggestion has been implemented successfully.',
      });
    },
  });

  // Request new pricing analysis
  const { mutate: requestAnalysis } = useMutation({
    mutationFn: async (planId: string) => {
      return api.post(`${API_ENDPOINTS.AI.PRICING_SUGGESTION}/analyze`, { planId });
    },
    onSuccess: () => {
      toast({
        title: 'Analysis Requested',
        description: 'Pricing analysis has been requested and will be available soon.',
      });
    },
  });

  return {
    suggestions,
    isLoading,
    error,
    refetch,
    implementSuggestion,
    requestAnalysis,
  };
};

// Hook for AI predictions
export const useAIPredictions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Make prediction
  const predict = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(API_ENDPOINTS.AI.PREDICT, data);
      setIsLoading(false);
      return response.data.data;
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error('Prediction failed');
      setError(error);
      throw error;
    }
  }, []);

  return {
    predict,
    isLoading,
    error,
  };
};

// Hook for AI health status
export const useAIHealth = () => {
  const { data: health, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-health'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.AI.HEALTH);
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    health,
    isLoading,
    error,
    refetch,
  };
};

// Hook for AI models
export const useAIModels = () => {
  const queryClient = useQueryClient();

  // Fetch models
  const { data: models, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.AI.MODELS);
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Activate model
  const { mutate: activateModel } = useMutation({
    mutationFn: async (modelId: string) => {
      return api.post(`${API_ENDPOINTS.AI.MODELS}/${modelId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast({
        title: 'Model Activated',
        description: 'The AI model has been activated successfully.',
      });
    },
  });

  // Deactivate model
  const { mutate: deactivateModel } = useMutation({
    mutationFn: async (modelId: string) => {
      return api.post(`${API_ENDPOINTS.AI.MODELS}/${modelId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast({
        title: 'Model Deactivated',
        description: 'The AI model has been deactivated successfully.',
      });
    },
  });

  return {
    models,
    isLoading,
    error,
    refetch,
    activateModel,
    deactivateModel,
  };
};