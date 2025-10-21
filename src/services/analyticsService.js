// Analytics Service - Track page views and user interactions
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

class AnalyticsService {
  // Track page view - Otimizado para não gravar múltiplas vezes o mesmo usuário na mesma página
  async trackPageView(page, userAgent = null) {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return;
      
      // Gera uma chave única para esta página e sessão
      const today = new Date().toDateString(); // Ex: "Mon Oct 21 2025"
      const viewKey = `analytics_${page}_${today}`;
      
      // Verifica se já registrou view desta página hoje
      const hasViewed = localStorage.getItem(viewKey);
      
      if (hasViewed) {
        console.log(`📊 Analytics: View já registrada para ${page} hoje`);
        return; // Não grava novamente
      }
      
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
      
      // Marca que já visualizou esta página hoje
      localStorage.setItem(viewKey, 'true');
      console.log(`✅ Analytics: View registrada para ${page}`);
      
      // Limpa views antigas do localStorage (mais de 7 dias)
      this.cleanOldViews();
      
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }
  
  // Limpa registros antigos do localStorage para não acumular dados
  cleanOldViews() {
    try {
      const keys = Object.keys(localStorage);
      const analyticsKeys = keys.filter(key => key.startsWith('analytics_'));
      
      // Mantém apenas os últimos 100 registros
      if (analyticsKeys.length > 100) {
        const toRemove = analyticsKeys.slice(0, analyticsKeys.length - 100);
        toRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Error cleaning old views:', error);
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
