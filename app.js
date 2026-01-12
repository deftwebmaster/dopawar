/* ============================================
   DOPAMINE WAR — Core Application Logic
   ============================================ */

const DopamineWar = {
  
  // ==========================================
  // Storage Keys
  // ==========================================
  STORAGE_KEYS: {
    AUDIT_COMPLETE: 'dw_audit_complete',
    AUDIT_SCORES: 'dw_audit_scores',
    AUDIT_DATE: 'dw_audit_date',
    CASUALTY_LOG: 'dw_casualty_log',
    DECLASSIFIED_UNLOCKED: 'dw_declassified',
  },

  // ==========================================
  // Enemy/Front Definitions
  // ==========================================
  FRONTS: {
    social: {
      id: 'social',
      name: 'Social Media',
      icon: '📱',
      description: 'Infinite scroll, likes, notifications—engineered addiction.',
    },
    sugar: {
      id: 'sugar',
      name: 'Sugar & Junk Food',
      icon: '🍩',
      description: 'Hyper-palatable foods hijacking your reward circuits.',
    },
    porn: {
      id: 'porn',
      name: 'Pornography',
      icon: '🔞',
      description: 'Supernormal stimuli rewiring your arousal template.',
      declassified: true,
    },
    news: {
      id: 'news',
      name: 'News & Doomscrolling',
      icon: '📰',
      description: 'Outrage algorithms feeding anxiety for engagement.',
    },
    gaming: {
      id: 'gaming',
      name: 'Gaming',
      icon: '🎮',
      description: 'Variable reward schedules and achievement loops.',
    },
    shopping: {
      id: 'shopping',
      name: 'Online Shopping',
      icon: '🛒',
      description: 'One-click dopamine hits and anticipation addiction.',
    },
    caffeine: {
      id: 'caffeine',
      name: 'Caffeine',
      icon: '☕',
      description: 'Borrowed energy with compounding interest.',
    },
    gambling: {
      id: 'gambling',
      name: 'Gambling & Trading',
      icon: '🎰',
      description: 'Variable ratio reinforcement at its most dangerous.',
      declassified: true,
    },
  },

  // ==========================================
  // Threat Level Definitions
  // ==========================================
  THREAT_LEVELS: {
    critical: { min: 80, label: 'CRITICAL', color: 'critical' },
    high: { min: 60, label: 'HIGH', color: 'high' },
    moderate: { min: 40, label: 'MODERATE', color: 'moderate' },
    low: { min: 20, label: 'LOW', color: 'low' },
    secure: { min: 0, label: 'SECURE', color: 'secure' },
  },

  // ==========================================
  // LocalStorage Helpers
  // ==========================================
  storage: {
    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('Storage get error:', e);
        return null;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Storage set error:', e);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('Storage remove error:', e);
        return false;
      }
    },

    clear() {
      Object.values(DopamineWar.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  },

  // ==========================================
  // Audit State
  // ==========================================
  audit: {
    isComplete() {
      return DopamineWar.storage.get(DopamineWar.STORAGE_KEYS.AUDIT_COMPLETE) === true;
    },

    getScores() {
      return DopamineWar.storage.get(DopamineWar.STORAGE_KEYS.AUDIT_SCORES) || {};
    },

    saveScores(scores) {
      DopamineWar.storage.set(DopamineWar.STORAGE_KEYS.AUDIT_SCORES, scores);
      DopamineWar.storage.set(DopamineWar.STORAGE_KEYS.AUDIT_COMPLETE, true);
      DopamineWar.storage.set(DopamineWar.STORAGE_KEYS.AUDIT_DATE, new Date().toISOString());
    },

    getDate() {
      return DopamineWar.storage.get(DopamineWar.STORAGE_KEYS.AUDIT_DATE);
    },

    getOverallScore() {
      const scores = this.getScores();
      const values = Object.values(scores);
      if (values.length === 0) return 0;
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    },

    getThreatLevel(score = null) {
      const s = score !== null ? score : this.getOverallScore();
      for (const [key, level] of Object.entries(DopamineWar.THREAT_LEVELS)) {
        if (s >= level.min) return { key, ...level };
      }
      return { key: 'secure', ...DopamineWar.THREAT_LEVELS.secure };
    },

    reset() {
      DopamineWar.storage.remove(DopamineWar.STORAGE_KEYS.AUDIT_COMPLETE);
      DopamineWar.storage.remove(DopamineWar.STORAGE_KEYS.AUDIT_SCORES);
      DopamineWar.storage.remove(DopamineWar.STORAGE_KEYS.AUDIT_DATE);
    }
  },

  // ==========================================
  // Casualty Log
  // ==========================================
  casualtyLog: {
    getEntries() {
      return DopamineWar.storage.get(DopamineWar.STORAGE_KEYS.CASUALTY_LOG) || [];
    },

    addEntry(entry) {
      const entries = this.getEntries();
      entries.unshift({
        ...entry,
        id: Date.now(),
        date: new Date().toISOString(),
      });
      // Keep last 30 entries
      if (entries.length > 30) entries.pop();
      DopamineWar.storage.set(DopamineWar.STORAGE_KEYS.CASUALTY_LOG, entries);
    },

    getTodayEntry() {
      const entries = this.getEntries();
      const today = new Date().toDateString();
      return entries.find(e => new Date(e.date).toDateString() === today);
    },

    hasLoggedToday() {
      return !!this.getTodayEntry();
    },

    getStreak() {
      const entries = this.getEntries();
      if (entries.length === 0) return 0;
      
      let streak = 0;
      let currentDate = new Date();
      
      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1 && entry.status === 'held') {
          streak++;
          currentDate = entryDate;
        } else {
          break;
        }
      }
      
      return streak;
    }
  },

  // ==========================================
  // Battle Plans
  // ==========================================
  battlePlans: {
    generate(scores) {
      const plans = [];
      const sortedFronts = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3); // Top 3 threats

      for (const [frontId, score] of sortedFronts) {
        const front = DopamineWar.FRONTS[frontId];
        if (!front) continue;

        const tactics = this.getTactics(frontId, score);
        plans.push({
          front,
          score,
          threatLevel: DopamineWar.audit.getThreatLevel(score),
          tactics,
        });
      }

      return plans;
    },

    getTactics(frontId, score) {
      const tacticLibrary = {
        social: [
          { threshold: 80, tactic: 'Delete apps from phone. Use browser-only access.' },
          { threshold: 60, tactic: 'Enable grayscale mode. Remove all notifications.' },
          { threshold: 40, tactic: 'Set app timers. One check morning, one evening.' },
          { threshold: 20, tactic: 'Designate phone-free zones in your home.' },
          { threshold: 0, tactic: 'Maintain current boundaries. Stay vigilant.' },
        ],
        sugar: [
          { threshold: 80, tactic: '72-hour sugar fast. Reset your palate.' },
          { threshold: 60, tactic: 'Clear the house. No junk in arm\'s reach.' },
          { threshold: 40, tactic: 'Replace with protein + fat snacks.' },
          { threshold: 20, tactic: 'Track intake. Awareness precedes control.' },
          { threshold: 0, tactic: 'Maintain current habits. Watch for creep.' },
        ],
        porn: [
          { threshold: 80, tactic: 'Install blockers on all devices. Tell someone.' },
          { threshold: 60, tactic: 'Identify triggers. Build friction before access.' },
          { threshold: 40, tactic: 'Redirect urges to physical activity.' },
          { threshold: 20, tactic: 'Monitor usage patterns. Know your weak hours.' },
          { threshold: 0, tactic: 'Stay aware. This front can reactivate fast.' },
        ],
        news: [
          { threshold: 80, tactic: 'Full news blackout. 7 days minimum.' },
          { threshold: 60, tactic: 'One source, once daily, time-boxed.' },
          { threshold: 40, tactic: 'No news before noon or after 8pm.' },
          { threshold: 20, tactic: 'Replace doomscrolling with long-form reading.' },
          { threshold: 0, tactic: 'Current intake is sustainable. Don\'t slip.' },
        ],
        gaming: [
          { threshold: 80, tactic: 'Uninstall. Move hardware out of bedroom.' },
          { threshold: 60, tactic: 'Set hard stop times. Use physical timers.' },
          { threshold: 40, tactic: 'No gaming before completing daily priorities.' },
          { threshold: 20, tactic: 'Choose finite games over infinite loops.' },
          { threshold: 0, tactic: 'Gaming is in check. Watch for binge triggers.' },
        ],
        shopping: [
          { threshold: 80, tactic: '30-day purchase freeze. Essentials only.' },
          { threshold: 60, tactic: 'Delete saved cards. Add friction.' },
          { threshold: 40, tactic: '48-hour rule on all non-essential purchases.' },
          { threshold: 20, tactic: 'Unsubscribe from marketing. Block sale alerts.' },
          { threshold: 0, tactic: 'Spending is controlled. Maintain discipline.' },
        ],
        caffeine: [
          { threshold: 80, tactic: 'Taper 25% per week. Don\'t quit cold.' },
          { threshold: 60, tactic: 'No caffeine after noon. Protect sleep.' },
          { threshold: 40, tactic: 'Switch to tea. Lower dose, slower release.' },
          { threshold: 20, tactic: 'One cup max. Track for creep.' },
          { threshold: 0, tactic: 'Caffeine is managed. Don\'t increase.' },
        ],
        gambling: [
          { threshold: 80, tactic: 'Self-exclude from all platforms. Now.' },
          { threshold: 60, tactic: 'Hand financial control to trusted person.' },
          { threshold: 40, tactic: 'Delete trading apps. Invest via autopilot only.' },
          { threshold: 20, tactic: 'Set strict loss limits. Honor them.' },
          { threshold: 0, tactic: 'Risk is contained. Stay out of the casino.' },
        ],
      };

      const tactics = tacticLibrary[frontId] || [];
      for (const t of tactics) {
        if (score >= t.threshold) return t.tactic;
      }
      return 'No specific tactic. Monitor this front.';
    }
  },

  // ==========================================
  // Utilities
  // ==========================================
  utils: {
    formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },

    formatDateShort(isoString) {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    },

    daysAgo(isoString) {
      const date = new Date(isoString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    },

    // Redirect if audit not complete
    requireAudit() {
      if (!DopamineWar.audit.isComplete()) {
        window.location.href = '/';
        return false;
      }
      return true;
    }
  }
};

// Make globally available
window.DW = DopamineWar;
