/**
 * Utility functions for consistent number formatting throughout the app
 */

export const formatCurrency = (value: number): string => {
  return (Math.round(value * 100) / 100).toFixed(2);
};

export const formatPremium = (value: number): string => {
  return (Math.round(value * 100) / 100).toFixed(2);
};

export const formatPercentage = (value: number): string => {
  return (Math.round(value * 1000) / 10).toFixed(1);
};

export const formatGreek = (value: number): string => {
  return (Math.round(value * 1000) / 1000).toFixed(3);
};

export const formatPrice = (value: number): string => {
  return (Math.round(value * 100) / 100).toFixed(2);
};