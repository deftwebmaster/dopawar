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
          { threshold: 80, tactic: 'Trigger: phone in hand with no task → System change: Delete apps entirely. Browser-only access with a 15-min daily window.' },
          { threshold: 60, tactic: 'Trigger: idle moment or notification dot → System change: Switch to grayscale display. Remove all social notifications at OS level.' },
          { threshold: 40, tactic: 'Trigger: habitual check during transitions → System change: Set 2 scheduled check windows. Log out after each session to add re-entry friction.' },
          { threshold: 20, tactic: 'Trigger: boredom or low-stimulation gap → System change: Designate phone-free zones (bedroom, meals). Replace with a physical default.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: Maintain current architecture. Audit if screen time creeps above baseline.' },
        ],
        sugar: [
          { threshold: 80, tactic: 'Trigger: stress, fatigue, or emotional spike → System change: 72-hour reset — remove all processed sugar from environment. Replace with protein + fat.' },
          { threshold: 60, tactic: 'Trigger: visible food in kitchen or pantry → System change: Clear the house. Proximity is the trigger — remove it entirely.' },
          { threshold: 40, tactic: 'Trigger: afternoon energy dip → System change: Swap sugar hit for protein snack + 10-min walk. Address the underlying blood sugar pattern.' },
          { threshold: 20, tactic: 'Trigger: social eating or habit cues → System change: Track intake for 7 days. Awareness of pattern precedes architecture change.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: Maintain current system. Watch for creep during stress periods.' },
        ],
        porn: [
          { threshold: 80, tactic: 'Trigger: late-night device use or stress discharge → System change: Install blockers on all devices now. Charge phone outside bedroom.' },
          { threshold: 60, tactic: 'Trigger: specific time of day or emotional state → System change: Map your exact trigger window. Build a 90-second intercept before device access during it.' },
          { threshold: 40, tactic: 'Trigger: boredom or low-arousal state → System change: Redirect to physical exertion within 60 seconds of urge onset. Exhaust the energy, not the urge.' },
          { threshold: 20, tactic: 'Trigger: late hours or isolated environment → System change: Log usage patterns for 2 weeks. Adjust one environmental variable based on what you find.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: Maintain current friction level. This front can reactivate quickly under stress — keep blockers in place.' },
        ],
        news: [
          { threshold: 80, tactic: 'Trigger: anxiety or need for certainty → System change: Full blackout for 7 days. Delete apps. Your nervous system needs a reset before new habits can form.' },
          { threshold: 60, tactic: 'Trigger: morning or evening idle time → System change: One curated source, once daily, time-boxed to 10 minutes. Set a timer and close it when it goes off.' },
          { threshold: 40, tactic: 'Trigger: morning routine or pre-sleep habit → System change: No news before 10am or after 8pm. Protect the highest-leverage cognitive windows.' },
          { threshold: 20, tactic: 'Trigger: scroll reflex during downtime → System change: Replace one doomscroll session daily with long-form reading. Retrain the depth of attention.' },
          { threshold: 0, tactic: "Trigger: none active → System change: Current architecture is stable. Audit if outrage or anxiety increases — that's the signal to tighten." },
        ],
        gaming: [
          { threshold: 80, tactic: 'Trigger: stress relief or avoidance of a priority task → System change: Uninstall. Move hardware out of the bedroom. Reintroduce only with hard limits after 30 days.' },
          { threshold: 60, tactic: 'Trigger: "just one more game" after a session → System change: Set a physical timer before starting. Stop at the alarm regardless of game state.' },
          { threshold: 40, tactic: 'Trigger: evening default or task avoidance → System change: No gaming until daily priorities are complete. Use it as a reward with a defined end time.' },
          { threshold: 20, tactic: 'Trigger: daily login reward or streak mechanic → System change: Audit which games use variable reward schedules. Replace with finite games that have clear endpoints.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: System is holding. Watch for seasonal binge patterns — new releases, holidays, or high-stress periods.' },
        ],
        shopping: [
          { threshold: 80, tactic: 'Trigger: emotional spike or browsing reflex → System change: 30-day purchase freeze on all non-essentials. Delete saved payment methods and shopping apps.' },
          { threshold: 60, tactic: 'Trigger: one-click ease or saved card autofill → System change: Remove saved cards from all platforms. Manual entry creates a pause long enough for the impulse to decay.' },
          { threshold: 40, tactic: "Trigger: sale alert or 'limited time' framing → System change: 48-hour rule on every unplanned purchase. Add to cart, wait, delete. Most urges don't survive 48 hours." },
          { threshold: 20, tactic: 'Trigger: marketing email or push notification → System change: Unsubscribe from all retail lists in one session. Block promotional categories in email.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: Spending architecture is stable. Audit monthly — track what arrives vs. what actually gets used.' },
        ],
        caffeine: [
          { threshold: 80, tactic: 'Trigger: inability to function without it → System change: Taper 25% per week — cold quit reinforces dependency. Address the underlying sleep debt driving consumption.' },
          { threshold: 60, tactic: 'Trigger: afternoon slump or cognitive fog → System change: Hard cutoff at noon. Afternoon dips are sleep debt — caffeine only defers the cost to tomorrow.' },
          { threshold: 40, tactic: 'Trigger: habitual morning ritual or social cue → System change: Delay first caffeine 90 minutes after waking. Let cortisol peak naturally before supplementing.' },
          { threshold: 20, tactic: 'Trigger: creeping second or third cup → System change: Cap at one cup. Log intake for 2 weeks to make the pattern visible before addressing it.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: Intake is managed. Monitor during high-stress periods — consumption tends to creep without noticing.' },
        ],
        gambling: [
          { threshold: 80, tactic: "Trigger: financial stress or excitement about a 'system' → System change: Self-exclude from all platforms today. Hand temporary financial oversight to a trusted person." },
          { threshold: 60, tactic: 'Trigger: market volatility or near-miss → System change: Delete all trading and betting apps. Switch to automated index funds — remove the action loop entirely.' },
          { threshold: 40, tactic: 'Trigger: idle time or speculative content online → System change: Define strict loss limits before any session. The number must be set before you start, not during.' },
          { threshold: 20, tactic: 'Trigger: sports events or social gambling context → System change: Track every bet or trade for 30 days with emotional state logged. Pattern visibility is the first intervention.' },
          { threshold: 0, tactic: 'Trigger: none active → System change: Risk architecture is stable. The near-miss response is the early warning signal — watch for it.' },
        ],
      };

      const tactics = tacticLibrary[frontId] || [];
      for (const t of tactics) {
        if (score >= t.threshold) return t.tactic;
      }
      return 'Trigger: unidentified → System change: Map the loop before selecting an intervention.';
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
        window.location.href = '/threat-assessment/';
        return false;
      }
      return true;
    }
  }
};

// Make globally available
window.DW = DopamineWar;
