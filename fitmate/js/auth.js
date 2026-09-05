/**
 * FitMate Auth & Guided DOM Spotlight Walkthrough Engine
 * Manages registration with health metrics, strict session checking,
 * and real-time DOM element highlighting guided tour.
 */

const SESSION_KEY = 'fitmate_logged_user';

class AuthController {
  constructor() {
    this.spotlightStep = 1;
    this.totalSpotlightSteps = 4;
    this.tourActive = false;
  }

  getCurrentUser() {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return null; // Force Register/Login landing page if not authenticated!
    const db = window.FitRestAPI ? window.FitRestAPI.getDB() : {};
    return db[username] || null;
  }

  setCurrentUserSession(username) {
    localStorage.setItem(SESSION_KEY, username);
  }

  // Handle Login
  async handleLogin(usernameOrEmail, password) {
    if (!window.FitRestAPI) return;
    const res = await window.FitRestAPI.login(usernameOrEmail, password);
    
    if (res.success) {
      this.setCurrentUserSession(res.user.username);
      window.FitApp.closeModal('modal-auth-login');
      window.FitApp.showToast('✅ Signed In', `Logged in as @${res.user.username}`);
      window.FitApp.renderAll();
      return true;
    } else {
      alert(res.message);
      return false;
    }
  }

  // Handle Registration with Health Metrics
  async handleRegister(formData) {
    if (!window.FitRestAPI) return;
    const res = await window.FitRestAPI.register(formData);

    if (res.success) {
      this.setCurrentUserSession(res.user.username);
      window.FitApp.closeModal('modal-auth-register');
      window.FitApp.renderAll();

      // Launch Interactive Guided DOM Spotlight Walkthrough!
      setTimeout(() => {
        this.startSpotlightTour();
      }, 400);
      return true;
    } else {
      alert(res.message);
      return false;
    }
  }

  handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
  }

  // INTERACTIVE GUIDED DOM SPOTLIGHT TOUR
  startSpotlightTour() {
    this.tourActive = true;
    this.spotlightStep = 1;

    const backdrop = document.getElementById('spotlight-backdrop');
    if (backdrop) backdrop.classList.add('active');

    this.renderSpotlightStep();
  }

  renderSpotlightStep() {
    const backdrop = document.getElementById('spotlight-backdrop');
    const card = document.getElementById('spotlight-card');
    const ring = document.getElementById('spotlight-target-ring');

    if (!backdrop || !card || !ring) return;

    let targetElem = null;
    let title = "";
    let desc = "";

    switch(this.spotlightStep) {
      case 1:
        targetElem = document.querySelector('[data-tab="partner-workout"]');
        title = "1. Shared Partner Workout Sync";
        desc = "Touch here to switch to Today's Workout. Log sets, reps, and weights in real-time with your partner.";
        break;

      case 2:
        targetElem = document.querySelector('[data-tab="soreness-map"]');
        title = "2. Muscle Soreness & Advisory";
        desc = "Touch here to view your Anatomical Body Map. Score muscle soreness to receive automated Smart Split recommendations.";
        break;

      case 3:
        targetElem = document.querySelector('[data-tab="group-nutrition"]');
        title = "3. Group Nutrition & Recovery";
        desc = "Touch here to log your daily calories, meals, and hydration while inspecting your partner's recovery feed.";
        break;

      case 4:
        targetElem = document.getElementById('btn-add-partner-header') || document.querySelector('[onclick*="openAddPartnerModal"]');
        title = "4. Connect with Workout Partner";
        desc = "Search any user by their @username to send a partner request. Numbers sync automatically once accepted!";
        break;
    }

    if (targetElem) {
      const rect = targetElem.getBoundingClientRect();
      
      // Position Spotlight Ring over target
      ring.style.top = `${rect.top - 6}px`;
      ring.style.left = `${rect.left - 6}px`;
      ring.style.width = `${rect.width + 12}px`;
      ring.style.height = `${rect.height + 12}px`;

      // Position Card nearby
      card.style.top = `${Math.min(window.innerHeight - 220, rect.bottom + 16)}px`;
      card.style.left = `${Math.max(20, Math.min(window.innerWidth - 400, rect.left - 40))}px`;
    }

    const titleElem = document.getElementById('spotlight-title');
    const descElem = document.getElementById('spotlight-desc');
    const stepElem = document.getElementById('spotlight-step-text');
    const nextBtn = document.getElementById('spotlight-next-btn');

    if (titleElem) titleElem.innerText = title;
    if (descElem) descElem.innerText = desc;
    if (stepElem) stepElem.innerText = `Step ${this.spotlightStep} of ${this.totalSpotlightSteps}`;

    if (nextBtn) {
      nextBtn.innerText = this.spotlightStep === this.totalSpotlightSteps ? "Add Partner Now 🚀" : "Next →";
    }
  }

  nextSpotlightStep() {
    if (this.spotlightStep < this.totalSpotlightSteps) {
      this.spotlightStep++;
      this.renderSpotlightStep();
    } else {
      this.endSpotlightTour();
    }
  }

  endSpotlightTour() {
    const backdrop = document.getElementById('spotlight-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    this.tourActive = false;

    // Automatically navigate user to Add Partner search modal!
    setTimeout(() => {
      if (window.FitApp) window.FitApp.openAddPartnerModal();
    }, 200);
  }
}

window.FitAuth = new AuthController();
