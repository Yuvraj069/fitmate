/**
 * FitMate Instagram-Style Partner Network & Privacy Controller
 * Handles user search by @username, sending partner requests,
 * accepting incoming requests, and profile privacy controls (Private 🔒, Friends 👥, Public 🌐).
 */

class PartnerNetworkController {
  constructor() {
    this.selectedPartnerUsername = null;
  }

  async searchUsers(query) {
    if (!window.FitRestAPI) return [];
    return await window.FitRestAPI.searchUsers(query);
  }

  async sendRequest(targetUsername) {
    if (!window.FitAuth || !window.FitRestAPI) return;
    const currentUser = window.FitAuth.getCurrentUser();
    
    const res = await window.FitRestAPI.sendPartnerRequest(currentUser.username, targetUsername);
    if (res.success) {
      window.FitApp.showToast('📩 Request Sent!', res.message);
      window.FitApp.closeModal('modal-add-partner');
      window.FitApp.renderAll();
    } else {
      alert(res.message);
    }
  }

  async acceptRequest(fromUsername) {
    if (!window.FitAuth || !window.FitRestAPI) return;
    const currentUser = window.FitAuth.getCurrentUser();

    const res = await window.FitRestAPI.acceptPartnerRequest(currentUser.username, fromUsername);
    if (res.success) {
      window.FitApp.showToast('🎉 Partner Connected!', res.message);
      window.FitApp.renderAll();
    } else {
      alert(res.message);
    }
  }

  // Render Connected Partners Selector or Solo Mode Indicator
  renderPartnerSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.FitAuth || !window.FitRestAPI) return;

    const currentUser = window.FitAuth.getCurrentUser();
    const db = window.FitRestAPI.getDB();
    const partnerUsernames = currentUser.partners || [];

    if (partnerUsernames.length === 0) {
      this.selectedPartnerUsername = null;
      container.innerHTML = `
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Solo Mode (Your Numbers Only)</span>
        <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 4px 8px; margin-left: 6px;" onclick="window.FitApp.openModal('modal-add-partner')">
          + Add Partner
        </button>
      `;
      return;
    }

    let html = `
      <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Synced Partner:</span>
      <select class="form-control" style="width: auto; padding: 4px 10px; font-size: 0.85rem;" onchange="window.FitPartners.selectPartner(this.value)">
    `;

    partnerUsernames.forEach(uname => {
      const p = db[uname];
      if (p) {
        const isSelected = this.selectedPartnerUsername === uname || (!this.selectedPartnerUsername && uname === partnerUsernames[0]);
        if (isSelected) this.selectedPartnerUsername = uname;

        html += `<option value="${uname}" ${isSelected ? 'selected' : ''}>${p.name} (@${p.username})</option>`;
      }
    });

    html += `
      </select>
      <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 4px 8px;" onclick="window.FitApp.openModal('modal-add-partner')">
        + Add More
      </button>
    `;

    container.innerHTML = html;
  }

  selectPartner(username) {
    this.selectedPartnerUsername = username;
    window.FitApp.showToast('👥 Synced View Switched', `Viewing numbers for @${username}`);
    window.FitApp.renderAll();
  }

  getSelectedPartner() {
    const currentUser = window.FitAuth ? window.FitAuth.getCurrentUser() : null;
    const db = window.FitRestAPI ? window.FitRestAPI.getDB() : {};

    if (!currentUser) return null;

    const partnerUsernames = currentUser.partners || [];
    if (partnerUsernames.length === 0) {
      return null; // Return null so Solo Mode exclusively shows own numbers!
    }

    if (this.selectedPartnerUsername && db[this.selectedPartnerUsername]) {
      return db[this.selectedPartnerUsername];
    }

    const firstPartner = partnerUsernames[0];
    if (firstPartner && db[firstPartner]) {
      return db[firstPartner];
    }

    return null;
  }
}

window.FitPartners = new PartnerNetworkController();
