/**
 * FitMate Nutrition & Group Recovery Tracker Engine
 * Renders daily macros, hydration counters, and the shared group fitness feed.
 */

class NutritionEngine {
  constructor() {}

  // Render Daily Macro Bar & Stats
  renderNutritionDashboard() {
    if (!window.FitStorage) return;
    const activeUser = window.FitStorage.getActiveUser();
    const n = activeUser.nutrition || {};

    // Update Macro Values in DOM
    const calElem = document.getElementById('stat-calories');
    if (calElem) calElem.innerText = `${n.calories} / ${n.targetCalories} kcal`;

    const protElem = document.getElementById('stat-protein');
    if (protElem) protElem.innerText = `${n.protein}g / ${n.targetProtein}g`;

    const carbElem = document.getElementById('stat-carbs');
    if (carbElem) carbElem.innerText = `${n.carbs}g / ${n.targetCarbs}g`;

    const fatElem = document.getElementById('stat-fats');
    if (fatElem) fatElem.innerText = `${n.fats}g / ${n.targetFats}g`;

    const waterElem = document.getElementById('stat-water');
    if (waterElem) waterElem.innerText = `${n.waterMl} ml`;

    const sleepElem = document.getElementById('stat-sleep');
    if (sleepElem) sleepElem.innerText = `${n.sleepHours} hrs`;

    // Render Shared Group Feed
    this.renderGroupFeed('group-nutrition-feed');
  }

  // Render Shared Group Nutrition & Recovery Feed
  renderGroupFeed(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.FitStorage) return;

    const state = window.FitStorage.getState();
    const feed = state.nutritionFeed || [];

    if (feed.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No group nutrition posts yet. Log your first meal or hydration above!
        </div>
      `;
      return;
    }

    let html = '';
    feed.forEach(item => {
      let icon = '🥗';
      if (item.type === 'hydration') icon = '💧';
      if (item.type === 'sleep') icon = '😴';

      html += `
        <div class="feed-item">
          <div class="feed-icon">${icon}</div>
          <div class="feed-content">
            <div class="feed-user">
              ${item.userName}
              <span class="feed-time">• ${item.time}</span>
            </div>
            <div style="font-weight: 600; color: var(--text-main); margin-top: 2px;">
              ${item.title}
            </div>
            <div class="feed-desc">${item.desc}</div>
            
            ${item.macros ? `
              <div class="feed-tags">
                ${item.macros.calories ? `<span class="feed-tag">🔥 ${item.macros.calories} kcal</span>` : ''}
                ${item.macros.protein ? `<span class="feed-tag">🥩 ${item.macros.protein}g Protein</span>` : ''}
                ${item.macros.waterMl ? `<span class="feed-tag">💧 ${item.macros.waterMl}ml Water</span>` : ''}
                ${item.macros.sleepHours ? `<span class="feed-tag">🌙 ${item.macros.sleepHours} hrs Sleep</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
}

window.FitNutrition = new NutritionEngine();
