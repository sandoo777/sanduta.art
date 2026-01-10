/**
 * Marketing Module
 * Cupoane, Campanii, Segmente, Email Automation, Analytics
 */

'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - COUPONS
// ────────────────────────────────────────────────────────────────────────────────

export type CouponType = 
  | 'PERCENTAGE' 
  | 'FIXED_AMOUNT' 
  | 'FREE_SHIPPING' 
  | 'CATEGORY_DISCOUNT' 
  | 'PRODUCT_DISCOUNT'
  | 'CUSTOMER_DISCOUNT';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // Procent sau valoare fixă
  description?: string;
  startDate: string;
  endDate?: string;
  maxUses?: number;
  usesPerCustomer?: number;
  currentUses: number;
  minOrderValue?: number;
  categoryIds?: string[];
  productIds?: string[];
  customerIds?: string[];
  excludePromotions: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: number;
  description?: string;
  startDate: string;
  endDate?: string;
  maxUses?: number;
  usesPerCustomer?: number;
  minOrderValue?: number;
  categoryIds?: string[];
  productIds?: string[];
  customerIds?: string[];
  excludePromotions?: boolean;
}

export interface ValidateCouponInput {
  code: string;
  userId?: string;
  cartTotal: number;
  productIds: string[];
  categoryIds: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discount: number;
  message?: string;
  error?: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - CAMPAIGNS
// ────────────────────────────────────────────────────────────────────────────────

export type CampaignType = 
  | 'GENERAL_DISCOUNT' 
  | 'CATEGORY_DISCOUNT' 
  | 'PRODUCT_DISCOUNT'
  | 'SEASONAL'
  | 'FLASH_SALE'
  | 'BUNDLE';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  description?: string;
  startDate: string;
  endDate: string;
  productIds?: string[];
  categoryIds?: string[];
  bundleProducts?: string[][]; // Array de array-uri pentru bundle-uri
  priority: number; // Pentru conflicte între campanii
  createdAt: string;
  updatedAt: string;
  
  // Metrici
  views?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
}

export interface CreateCampaignInput {
  name: string;
  type: CampaignType;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  description?: string;
  startDate: string;
  endDate: string;
  productIds?: string[];
  categoryIds?: string[];
  bundleProducts?: string[][];
  priority?: number;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - SEGMENTS
// ────────────────────────────────────────────────────────────────────────────────

export type SegmentType = 
  | 'NEW_CUSTOMERS'
  | 'RETURNING_CUSTOMERS'
  | 'INACTIVE_CUSTOMERS'
  | 'VIP_CUSTOMERS'
  | 'ABANDONED_CART'
  | 'HIGH_VALUE'
  | 'CUSTOM';

export interface SegmentFilter {
  field: 'orderCount' | 'totalSpent' | 'lastOrderDate' | 'averageOrderValue' | 'categoryId' | 'productId' | 'location';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between';
  value: string | number | string[] | number[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  type: SegmentType;
  description?: string;
  filters: SegmentFilter[];
  customerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentInput {
  name: string;
  type: SegmentType;
  description?: string;
  filters: SegmentFilter[];
}

export interface SegmentCustomer {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  averageOrderValue: number;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - EMAIL AUTOMATION
// ────────────────────────────────────────────────────────────────────────────────

export type AutomationType = 
  | 'WELCOME_SERIES'
  | 'ABANDONED_CART'
  | 'ORDER_FOLLOW_UP'
  | 'REVIEW_REQUEST'
  | 'REACTIVATION'
  | 'BIRTHDAY'
  | 'CAMPAIGN_TRIGGER';

export type AutomationTrigger = 
  | 'ACCOUNT_CREATED'
  | 'CART_ABANDONED'
  | 'ORDER_PLACED'
  | 'ORDER_DELIVERED'
  | 'INACTIVE_DAYS'
  | 'BIRTHDAY'
  | 'SEGMENT_JOINED';

export interface EmailAutomation {
  id: string;
  name: string;
  type: AutomationType;
  trigger: AutomationTrigger;
  triggerDelay?: number; // În ore
  subject: string;
  body: string; // HTML cu variabile {{name}}, {{orderNumber}}, etc.
  segmentId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Metrici
  sent?: number;
  opened?: number;
  clicked?: number;
  converted?: number;
}

export interface CreateAutomationInput {
  name: string;
  type: AutomationType;
  trigger: AutomationTrigger;
  triggerDelay?: number;
  subject: string;
  body: string;
  segmentId?: string;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  body: string;
  variables?: Record<string, string>;
  automationId?: string;
}

export interface EmailVariable {
  key: string;
  label: string;
  example: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - ANALYTICS
// ────────────────────────────────────────────────────────────────────────────────

export interface CouponPerformance {
  couponId: string;
  code: string;
  uses: number;
  revenue: number;
  discount: number;
  roi: number;
}

export interface CampaignPerformance {
  campaignId: string;
  name: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost?: number;
  roi?: number;
  conversionRate: number;
}

export interface EmailPerformance {
  automationId: string;
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
}

export interface SegmentPerformance {
  segmentId: string;
  name: string;
  customerCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  lifetimeValue: number;
  conversionRate: number;
}

export interface MarketingAnalytics {
  dateRange: {
    start: string;
    end: string;
  };
  
  overview: {
    totalRevenue: number;
    marketingRevenue: number;
    marketingCost: number;
    roi: number;
    conversions: number;
    conversionRate: number;
  };
  
  coupons: CouponPerformance[];
  campaigns: CampaignPerformance[];
  emails: EmailPerformance[];
  segments: SegmentPerformance[];
}

// ────────────────────────────────────────────────────────────────────────────────
// EMAIL VARIABLES
// ────────────────────────────────────────────────────────────────────────────────

export const EMAIL_VARIABLES: EmailVariable[] = [
  { key: 'name', label: 'Nume Client', example: 'Ion Popescu' },
  { key: 'email', label: 'Email Client', example: 'ion@example.com' },
  { key: 'orderNumber', label: 'Număr Comandă', example: '#12345' },
  { key: 'productName', label: 'Nume Produs', example: 'Șandură Personalizată' },
  { key: 'discountCode', label: 'Cod Reducere', example: 'WELCOME10' },
  { key: 'total', label: 'Total Comandă', example: '250 lei' },
  { key: 'date', label: 'Dată', example: '10 Ianuarie 2026' },
  { key: 'trackingUrl', label: 'Link Tracking', example: 'https://...' },
  { key: 'cartUrl', label: 'Link Coș', example: 'https://sanduta.art/cart' },
];

// ────────────────────────────────────────────────────────────────────────────────
// HOOK - useMarketing
// ────────────────────────────────────────────────────────────────────────────────

export function useMarketing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────────
  // COUPONS
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchCoupons = useCallback(async (): Promise<Coupon[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Fetching coupons');
      const response = await fetch('/api/admin/marketing/coupons');
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error fetching coupons', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCoupon = useCallback(async (input: CreateCouponInput): Promise<Coupon | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Creating coupon', { code: input.code });
      const response = await fetch('/api/admin/marketing/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create coupon');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error creating coupon', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCoupon = useCallback(async (id: string, updates: Partial<CreateCouponInput>): Promise<Coupon | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Updating coupon', { id });
      const response = await fetch(`/api/admin/marketing/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update coupon');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error updating coupon', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCoupon = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Deleting coupon', { id });
      const response = await fetch(`/api/admin/marketing/coupons/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error deleting coupon', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCoupon = useCallback(async (input: ValidateCouponInput): Promise<CouponValidationResult> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Validating coupon', { code: input.code });
      const response = await fetch('/api/marketing/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          valid: false,
          discount: 0,
          error: errorData.error || 'Invalid coupon',
        };
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error validating coupon', { error: message });
      return {
        valid: false,
        discount: 0,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // CAMPAIGNS
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchCampaigns = useCallback(async (): Promise<Campaign[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Fetching campaigns');
      const response = await fetch('/api/admin/marketing/campaigns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error fetching campaigns', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (input: CreateCampaignInput): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Creating campaign', { name: input.name });
      const response = await fetch('/api/admin/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create campaign');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error creating campaign', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<CreateCampaignInput>): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Updating campaign', { id });
      const response = await fetch(`/api/admin/marketing/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error updating campaign', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Deleting campaign', { id });
      const response = await fetch(`/api/admin/marketing/campaigns/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error deleting campaign', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // SEGMENTS
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchSegments = useCallback(async (): Promise<CustomerSegment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Fetching segments');
      const response = await fetch('/api/admin/marketing/segments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch segments');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error fetching segments', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSegmentCustomers = useCallback(async (segmentId: string): Promise<SegmentCustomer[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Fetching segment customers', { segmentId });
      const response = await fetch(`/api/admin/marketing/segments/${segmentId}/customers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch segment customers');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error fetching segment customers', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createSegment = useCallback(async (input: CreateSegmentInput): Promise<CustomerSegment | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Creating segment', { name: input.name });
      const response = await fetch('/api/admin/marketing/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create segment');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error creating segment', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSegment = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Deleting segment', { id });
      const response = await fetch(`/api/admin/marketing/segments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete segment');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error deleting segment', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // EMAIL AUTOMATION
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchAutomations = useCallback(async (): Promise<EmailAutomation[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Fetching automations');
      const response = await fetch('/api/admin/marketing/automations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch automations');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error fetching automations', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAutomation = useCallback(async (input: CreateAutomationInput): Promise<EmailAutomation | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Creating automation', { name: input.name });
      const response = await fetch('/api/admin/marketing/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create automation');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error creating automation', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAutomation = useCallback(async (id: string, updates: Partial<CreateAutomationInput>): Promise<EmailAutomation | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Updating automation', { id });
      const response = await fetch(`/api/admin/marketing/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update automation');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error updating automation', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAutomation = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Deleting automation', { id });
      const response = await fetch(`/api/admin/marketing/automations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete automation');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error deleting automation', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMarketingEmail = useCallback(async (input: SendEmailInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Sending marketing email', { to: input.to });
      const response = await fetch('/api/admin/marketing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error sending email', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchMarketingAnalytics = useCallback(async (
    startDate: string, 
    endDate: string
  ): Promise<MarketingAnalytics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Marketing', 'Fetching analytics', { startDate, endDate });
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`/api/admin/marketing/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Marketing', 'Error fetching analytics', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    
    // Coupons
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    
    // Campaigns
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    
    // Segments
    fetchSegments,
    fetchSegmentCustomers,
    createSegment,
    deleteSegment,
    
    // Email Automation
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    sendMarketingEmail,
    
    // Analytics
    fetchMarketingAnalytics,
  };
}
