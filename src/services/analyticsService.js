// Analytics Service - Track page views and user interactions
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

class AnalyticsService {
  // Track page view
  async trackPageView(page, userAgent = null) {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return;
      
      const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown');
      
      const analyticsRef = collection(db, 'analytics');
      await addDoc(analyticsRef, {
        type: 'pageview',
        page: page,
        timestamp: Timestamp.now(),
        userAgent: ua,
        date: new Date().toISOString(),
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        device: this.getDeviceType(ua),
        browser: this.getBrowser(ua)
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Get analytics for a specific period
  async getAnalytics(days = 7) {
    try {
      const analyticsRef = collection(db, 'analytics');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const q = query(
        analyticsRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  }

  // Get page views by route
  async getPageViewsByRoute(days = 7) {
    const analytics = await this.getAnalytics(days);
    const pageViews = {};

    analytics.forEach(item => {
      if (item.type === 'pageview') {
        const page = item.page || 'unknown';
        pageViews[page] = (pageViews[page] || 0) + 1;
      }
    });

    return Object.entries(pageViews)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Get hourly distribution
  async getHourlyDistribution(days = 7) {
    const analytics = await this.getAnalytics(days);
    const hourly = Array(24).fill(0);

    analytics.forEach(item => {
      if (item.hour !== undefined) {
        hourly[item.hour]++;
      }
    });

    return hourly.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    }));
  }

  // Get device distribution
  async getDeviceDistribution(days = 7) {
    const analytics = await this.getAnalytics(days);
    const devices = { mobile: 0, desktop: 0, tablet: 0 };

    analytics.forEach(item => {
      const device = item.device || 'desktop';
      devices[device]++;
    });

    return devices;
  }

  // Get total views
  async getTotalViews(days = 7) {
    const analytics = await this.getAnalytics(days);
    return analytics.filter(item => item.type === 'pageview').length;
  }

  // Get unique pages
  async getUniquePages(days = 7) {
    const pageViews = await this.getPageViewsByRoute(days);
    return pageViews.length;
  }

  // Utility functions
  getDeviceType(userAgent) {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  getBrowser(userAgent) {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Other';
  }
}

export default new AnalyticsService();
