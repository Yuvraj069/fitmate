/**
 * FitMate 2.0 Main UI Orchestrator
 * Apple Light Theme UI Controller, Custom Exercise Manager,
 * Auth Guard & Partner Network.
 */

class FitMateApp {
  constructor() {
    this.activeTab = 'partner-workout';
    this.selectedMuscleKey = 'chest';
  }

  init() {
    console.log('🍏 Initializing FitMate 2.0 Apple Platform...');

    if (window.FitStorage) {
      window.FitStorage.subscribe(() => {
        this.renderAll();
      });
    }

    this.renderAll();
    this.setupEventListeners();
  }

  renderAll() {
    const activeUser = window.FitStorage ? window.FitStorage.getActiveUser() : null;
    const partnerUser = window.FitStorage ? window.FitStorage.getPartnerUser() : null;
    const state = window.FitStorage ? window.FitStorage.getState() : {};

    // 1. STRICT AUTH GUARD: If not signed in, show Registration/Login Modal
    if (!activeUser) {
      this.openModal('modal-auth-login');
      const mainContainer = document.querySelector('.main-container');
      const navTabs = document.querySelector('.nav-tabs');
      if (mainContainer) mainContainer.style.opacity = '0.15';
      if (navTabs) navTabs.style.opacity = '0.15';
      return;
    } else {
      const mainContainer = document.querySelector('.main-container');
      const navTabs = document.querySelector('.nav-tabs');
      if (mainContainer) mainContainer.style.opacity = '1';
      if (navTabs) navTabs.style.opacity = '1';
    }

    // Update Header Active User Info
    const avatarElem = document.getElementById('user-active-avatar');
    const nameElem = document.getElementById('user-active-name');
    if (avatarElem) avatarElem.innerText = activeUser.avatar || activeUser.name.charAt(0);
    if (nameElem) nameElem.innerText = `@${activeUser.username}`;

    // 2. Render Partner Selector Dropdown
    if (window.FitPartners) {
      window.FitPartners.renderPartnerSelector('partner-selector-container');
    }

    // 3. Update Pending Partner Requests Badge
    const pendingReqs = activeUser.pendingRequests || [];
    const pendingBadge = document.getElementById('pending-requests-badge');
    if (pendingBadge) {
      pendingBadge.innerText = pendingReqs.length;
      pendingBadge.style.display = pendingReqs.length > 0 ? 'inline-flex' : 'none';
    }

    // 4. Update Hero Rendezvous Banner
    const rTime = document.getElementById('rendezvous-time-text');
    if (rTime && state.rendezvous) rTime.innerText = state.rendezvous.formattedTime;

    const rSplit = document.getElementById('rendezvous-split-text');
    if (rSplit && state.rendezvous) rSplit.innerText = state.rendezvous.targetSplit;

    const pStatus = document.getElementById('partner-status-badge');
    if (pStatus) {
      if (partnerUser) {
        const status = partnerUser.status || 'confirmed';
        pStatus.className = `status-chip status-${status}`;
        pStatus.innerText = `● ${partnerUser.name.split(' ')[0]} ${status.toUpperCase()}`;
      } else {
        pStatus.className = `status-chip status-enroute`;
        pStatus.innerText = `● Solo Mode`;
      }
    }

    // 5. Render Muscle Soreness Body Map
    if (window.FitBodyMap) {
      window.FitBodyMap.renderFrontSVG('front-body-map-container', activeUser.soreness);
      window.FitBodyMap.renderBackSVG('back-body-map-container', activeUser.soreness);

      window.FitBodyMap.attachMapListeners(
        'front-body-map-container',
        'back-body-map-container',
        (muscleKey) => {
          this.openMuscleSorenessModal(muscleKey);
        }
      );

      const advisory = window.FitBodyMap.generateSmartSplitAdvisory(
        activeUser.soreness,
        partnerUser ? partnerUser.soreness : {},
        activeUser.name.split(' ')[0],
        partnerUser ? partnerUser.name.split(' ')[0] : 'Partner'
      );

      const advisoryElem = document.getElementById('smart-split-advisory-box');
      if (advisoryElem) {
        advisoryElem.innerHTML = `
          <div class="advisory-title">💡 ${advisory.recommendedSplit}</div>
          <div class="advisory-desc" style="margin-top: 2px;">${advisory.warningMsg}</div>
        `;
      }
    }

    // 6. Render Today's Workout Exercises
    if (window.FitWorkout) {
      window.FitWorkout.renderWorkoutExercises('todays-exercises-container');
    }

    // 7. Render Nutrition Dashboard & Group Feed
    if (window.FitNutrition) {
      window.FitNutrition.renderNutritionDashboard();
    }

    // 8. Render Personal Metrics Cards
    const heightWeightElem = document.getElementById('user-height-weight-display');
    if (heightWeightElem) {
      heightWeightElem.innerText = `${activeUser.height || '178 cm'} • ${activeUser.weight || '75 kg'}`;
    }
  }

  setupEventListeners() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        const tabKey = tab.getAttribute('data-tab');
        this.switchTab(tabKey);
      };
    });
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeNav = document.querySelector(`.nav-tab[data-tab="${tabKey}"]`);
    const activeContent = document.getElementById(`tab-${tabKey}`);

    if (activeNav) activeNav.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
  }

  openMuscleSorenessModal(muscleKey) {
    this.selectedMuscleKey = muscleKey;
    const activeUser = window.FitStorage.getActiveUser();
    const currentVal = (activeUser && activeUser.soreness && activeUser.soreness[muscleKey]) || 15;

    const modalTitle = document.getElementById('soreness-modal-title');
    if (modalTitle) modalTitle.innerText = `Set Soreness: ${muscleKey.toUpperCase()}`;

    const rangeInput = document.getElementById('soreness-range-input');
    const valDisplay = document.getElementById('soreness-val-display');

    if (rangeInput) rangeInput.value = currentVal;
    if (valDisplay) valDisplay.innerText = `${currentVal}%`;

    this.openModal('modal-soreness');
  }

  saveMuscleSoreness() {
    const rangeInput = document.getElementById('soreness-range-input');
    const val = parseInt(rangeInput.value) || 15;

    window.FitStorage.updateMuscleSoreness(this.selectedMuscleKey, val);
    this.closeModal('modal-soreness');
    this.showToast('💪 Soreness Saved', `${this.selectedMuscleKey.toUpperCase()} updated to ${val}% soreness.`);
  }

  // Save Custom Exercise!
  saveCustomExercise() {
    const name = document.getElementById('ex-name-input')?.value;
    const group = document.getElementById('ex-group-select')?.value || 'Chest';
    const sets = document.getElementById('ex-sets-input')?.value || 3;
    const reps = document.getElementById('ex-reps-input')?.value || 10;
    const weight = document.getElementById('ex-weight-input')?.value || 0;

    if (!name || !name.trim()) {
      alert("Please enter an exercise name.");
      return;
    }

    window.FitStorage.addCustomExercise(name, group, sets, reps, weight);
    this.closeModal('modal-add-exercise');
    this.showToast('💪 Custom Exercise Added', `${name} added to your workout!`);
  }

  openRendezvousModal() {
    const state = window.FitStorage.getState();
    const timeInput = document.getElementById('meetup-time-input');
    const splitInput = document.getElementById('meetup-split-input');
    const notesInput = document.getElementById('meetup-notes-input');

    if (timeInput && state.rendezvous) timeInput.value = state.rendezvous.scheduledTime;
    if (splitInput && state.rendezvous) splitInput.value = state.rendezvous.targetSplit;
    if (notesInput && state.rendezvous) notesInput.value = state.rendezvous.notes;

    this.openModal('modal-rendezvous');
  }

  saveRendezvous() {
    const timeVal = document.getElementById('meetup-time-input')?.value || '17:30';
    const splitVal = document.getElementById('meetup-split-input')?.value || 'Push Day A';
    const notesVal = document.getElementById('meetup-notes-input')?.value || '';

    window.FitStorage.updateRendezvous(timeVal, splitVal, notesVal);
    this.closeModal('modal-rendezvous');
    this.showToast('🔔 Meetup Scheduled!', `Notified partner for ${timeVal} (${splitVal}).`);
  }

  saveMealLog() {
    const mealType = document.getElementById('meal-type-select')?.value || 'Meal';
    const title = document.getElementById('meal-title-input')?.value || 'Fitness Meal';
    const cals = document.getElementById('meal-cals-input')?.value || 650;
    const prot = document.getElementById('meal-prot-input')?.value || 48;
    const carbs = document.getElementById('meal-carbs-input')?.value || 60;
    const fats = document.getElementById('meal-fats-input')?.value || 16;

    window.FitStorage.addNutritionLog(mealType, title, cals, prot, carbs, fats);
    this.closeModal('modal-meal');
    this.showToast('🥗 Meal Shared', `${title} posted to shared feed!`);
  }

  addQuickWater(amountMl) {
    window.FitStorage.addHydrationLog(amountMl);
    this.showToast('💧 Hydration Logged', `+${amountMl}ml water added!`);
  }

  openAddPartnerModal() {
    const searchInput = document.getElementById('partner-search-input');
    const resultsContainer = document.getElementById('partner-search-results');
    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">Search users by @username</div>`;

    this.openModal('modal-add-partner');
  }

  async handlePartnerSearch(query) {
    const resultsContainer = document.getElementById('partner-search-results');
    if (!resultsContainer || !window.FitPartners) return;

    if (!query || query.trim().length < 2) {
      resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">Search users by @username</div>`;
      return;
    }

    const results = await window.FitPartners.searchUsers(query);
    const currentUser = window.FitStorage.getActiveUser();

    if (results.length === 0) {
      resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">No users found for "${query}"</div>`;
      return;
    }

    let html = '';
    results.forEach(user => {
      if (user.username === currentUser.username) return;

      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 0.5rem; border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">${user.avatar}</div>
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">${user.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">@${user.username}</div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" style="font-size: 0.8rem; padding: 4px 12px;" onclick="window.FitPartners.sendRequest('${user.username}')">
            Send Request 📩
          </button>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
  }

  openPendingRequestsModal() {
    const currentUser = window.FitStorage.getActiveUser();
    const container = document.getElementById('pending-requests-container');
    if (!container || !currentUser) return;

    const reqs = currentUser.pendingRequests || [];

    if (reqs.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending partner requests</div>`;
    } else {
      let html = '';
      reqs.forEach(req => {
        html += `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); padding: 0.85rem 1rem; border-radius: var(--radius-md); margin-bottom: 0.5rem; border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">${req.fromName} (@${req.fromUsername})</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Requested to connect as Workout Partner</div>
            </div>
            <button class="btn btn-green btn-sm" style="font-size: 0.8rem; padding: 6px 14px;" onclick="window.FitPartners.acceptRequest('${req.fromUsername}'); window.FitApp.closeModal('modal-pending-requests');">
              Accept ✓
            </button>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    this.openModal('modal-pending-requests');
  }

  openModal(modalId) {
    const elem = document.getElementById(modalId);
    if (elem) elem.classList.add('active');
  }

  closeModal(modalId) {
    const elem = document.getElementById(modalId);
    if (elem) elem.classList.remove('active');
  }

  showToast(title, desc) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">⚡</div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }
}

window.FitApp = new FitMateApp();

document.addEventListener('DOMContentLoaded', () => {
  window.FitApp.init();
});
