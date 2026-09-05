/**
 * FitMate Interactive Anatomical Body Map Engine
 * Renders SVG front/back human muscle groups with explicit inline click handlers,
 * soreness color coding, and smart split advisory recommendations.
 */

class BodyMapEngine {
  constructor() {
    this.sorenessLevels = [
      { level: 15, label: 'Fresh', class: 'muscle-fresh', dotClass: 'dot-fresh' },
      { level: 40, label: 'Recovered', class: 'muscle-recovered', dotClass: 'dot-recovered' },
      { level: 65, label: 'Sore', class: 'muscle-sore', dotClass: 'dot-sore' },
      { level: 85, label: 'Very Sore', class: 'muscle-verysore', dotClass: 'dot-verysore' }
    ];
  }

  getSorenessClass(val) {
    if (val >= 75) return 'muscle-verysore';
    if (val >= 50) return 'muscle-sore';
    if (val >= 25) return 'muscle-recovered';
    return 'muscle-fresh';
  }

  // Render SVG Front View with explicit inline onclick
  renderFrontSVG(containerId, sorenessData) {
    const s = sorenessData || {};
    const html = `
      <svg class="human-body" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Head & Neck -->
        <ellipse cx="100" cy="35" rx="18" ry="24" fill="#e5e5ea" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
        <rect x="94" y="58" width="12" height="14" fill="#e5e5ea"/>
        
        <!-- Chest -->
        <g class="muscle-group ${this.getSorenessClass(s.chest || 0)}" data-muscle="chest" onclick="window.FitApp.openMuscleSorenessModal('chest')">
          <path d="M 75 74 C 90 74, 98 76, 100 85 C 102 76, 110 74, 125 74 C 128 98, 120 108, 100 110 C 80 108, 72 98, 75 74 Z" />
          <text x="100" y="93" font-size="7" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">CHEST</text>
        </g>
        
        <!-- Shoulders -->
        <g class="muscle-group ${this.getSorenessClass(s.shoulders || 0)}" data-muscle="shoulders" onclick="window.FitApp.openMuscleSorenessModal('shoulders')">
          <path d="M 58 75 C 65 72, 74 74, 75 80 C 72 95, 60 98, 55 88 Z" />
          <path d="M 142 75 C 135 72, 126 74, 125 80 C 128 95, 140 98, 145 88 Z" />
        </g>
        
        <!-- Biceps -->
        <g class="muscle-group ${this.getSorenessClass(s.biceps || 0)}" data-muscle="biceps" onclick="window.FitApp.openMuscleSorenessModal('biceps')">
          <path d="M 54 90 C 60 92, 65 100, 62 120 C 52 118, 48 105, 54 90 Z" />
          <path d="M 146 90 C 140 92, 135 100, 138 120 C 148 118, 152 105, 146 90 Z" />
        </g>

        <!-- Abs -->
        <g class="muscle-group ${this.getSorenessClass(s.abs || 0)}" data-muscle="abs" onclick="window.FitApp.openMuscleSorenessModal('abs')">
          <rect x="85" y="114" width="30" height="42" rx="4" />
          <text x="100" y="138" font-size="7" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">ABS</text>
        </g>

        <!-- Quads -->
        <g class="muscle-group ${this.getSorenessClass(s.quads || 0)}" data-muscle="quads" onclick="window.FitApp.openMuscleSorenessModal('quads')">
          <path d="M 72 165 C 85 165, 95 170, 95 240 C 78 240, 68 220, 72 165 Z" />
          <path d="M 128 165 C 115 165, 105 170, 105 240 C 122 240, 132 220, 128 165 Z" />
          <text x="100" y="200" font-size="7" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">QUADS</text>
        </g>

        <!-- Calves -->
        <g class="muscle-group ${this.getSorenessClass(s.calves || 0)}" data-muscle="calves" onclick="window.FitApp.openMuscleSorenessModal('calves')">
          <path d="M 74 260 C 85 260, 85 310, 78 320 C 70 310, 70 280, 74 260 Z" />
          <path d="M 126 260 C 115 260, 115 310, 122 320 C 130 310, 130 280, 126 260 Z" />
        </g>
      </svg>
    `;
    const elem = document.getElementById(containerId);
    if (elem) elem.innerHTML = html;
  }

  // Render SVG Back View
  renderBackSVG(containerId, sorenessData) {
    const s = sorenessData || {};
    const html = `
      <svg class="human-body" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Head & Neck Back -->
        <ellipse cx="100" cy="35" rx="18" ry="24" fill="#e5e5ea" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
        <rect x="94" y="58" width="12" height="14" fill="#e5e5ea"/>
        
        <!-- Upper Back -->
        <g class="muscle-group ${this.getSorenessClass(s.upperBack || 0)}" data-muscle="upperBack" onclick="window.FitApp.openMuscleSorenessModal('upperBack')">
          <path d="M 80 65 L 120 65 L 135 85 L 100 100 L 65 85 Z" />
          <text x="100" y="82" font-size="6.5" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">UPPER BACK</text>
        </g>
        
        <!-- Lats -->
        <g class="muscle-group ${this.getSorenessClass(s.lats || 0)}" data-muscle="lats" onclick="window.FitApp.openMuscleSorenessModal('lats')">
          <path d="M 66 86 C 85 95, 95 105, 95 135 C 75 135, 60 115, 66 86 Z" />
          <path d="M 134 86 C 115 95, 105 105, 105 135 C 125 135, 140 115, 134 86 Z" />
          <text x="100" y="115" font-size="7" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">LATS</text>
        </g>
        
        <!-- Triceps -->
        <g class="muscle-group ${this.getSorenessClass(s.triceps || 0)}" data-muscle="triceps" onclick="window.FitApp.openMuscleSorenessModal('triceps')">
          <path d="M 52 85 C 60 88, 62 100, 58 118 C 48 110, 46 95, 52 85 Z" />
          <path d="M 148 85 C 140 88, 138 100, 142 118 C 152 110, 154 95, 148 85 Z" />
        </g>

        <!-- Lower Back -->
        <g class="muscle-group ${this.getSorenessClass(s.lowerBack || 0)}" data-muscle="lowerBack" onclick="window.FitApp.openMuscleSorenessModal('lowerBack')">
          <rect x="85" y="136" width="30" height="24" rx="4" />
          <text x="100" y="150" font-size="6" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">LOWER BACK</text>
        </g>

        <!-- Glutes -->
        <g class="muscle-group ${this.getSorenessClass(s.glutes || 0)}" data-muscle="glutes" onclick="window.FitApp.openMuscleSorenessModal('glutes')">
          <ellipse cx="83" cy="180" rx="16" ry="18" />
          <ellipse cx="117" cy="180" rx="16" ry="18" />
          <text x="100" y="183" font-size="7" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">GLUTES</text>
        </g>

        <!-- Hamstrings -->
        <g class="muscle-group ${this.getSorenessClass(s.hamstrings || 0)}" data-muscle="hamstrings" onclick="window.FitApp.openMuscleSorenessModal('hamstrings')">
          <path d="M 70 200 C 85 200, 95 205, 95 255 C 78 255, 68 240, 70 200 Z" />
          <path d="M 130 200 C 115 200, 105 205, 105 255 C 122 255, 132 240, 130 200 Z" />
          <text x="100" y="230" font-size="6" fill="#1c1c1e" font-weight="bold" text-anchor="middle" pointer-events="none">HAMSTRINGS</text>
        </g>
      </svg>
    `;
    const elem = document.getElementById(containerId);
    if (elem) elem.innerHTML = html;
  }

  attachMapListeners(frontContainerId, backContainerId, onMuscleClick) {
    const handleContainerClick = (e) => {
      const group = e.target.closest('.muscle-group');
      if (group) {
        const muscleKey = group.getAttribute('data-muscle');
        if (muscleKey && onMuscleClick) {
          onMuscleClick(muscleKey);
        }
      }
    };

    const frontElem = document.getElementById(frontContainerId);
    const backElem = document.getElementById(backContainerId);

    if (frontElem) frontElem.onclick = handleContainerClick;
    if (backElem) backElem.onclick = handleContainerClick;
  }

  generateSmartSplitAdvisory(userASoreness, userBSoreness, userAName, userBName) {
    const combinedSoreness = {};
    const muscleKeys = ['chest', 'shoulders', 'biceps', 'triceps', 'abs', 'quads', 'hamstrings', 'lats', 'upperBack', 'lowerBack', 'glutes', 'calves'];

    muscleKeys.forEach(key => {
      const scoreA = (userASoreness && userASoreness[key]) || 0;
      const scoreB = (userBSoreness && userBSoreness[key]) || 0;
      combinedSoreness[key] = Math.max(scoreA, scoreB);
    });

    const pushSoreness = Math.max(combinedSoreness.chest, combinedSoreness.triceps, combinedSoreness.shoulders);
    const pullSoreness = Math.max(combinedSoreness.lats, combinedSoreness.biceps, combinedSoreness.upperBack);

    let recommendedSplit = 'Push Day A';
    let warningMsg = '';

    if (pushSoreness >= 75) {
      if (pullSoreness < 60) {
        recommendedSplit = 'Pull Day B (Lats, Upper Back & Biceps)';
        warningMsg = `⚠️ High Push fatigue detected. Recommended: Pivot to Pull Day today.`;
      } else {
        recommendedSplit = 'Legs & Core Hypertrophy';
        warningMsg = `⚠️ Upper body fatigued. Pivot to Legs & Core today.`;
      }
    } else {
      recommendedSplit = 'Push Day A (Chest & Arms)';
      warningMsg = `✅ Muscles are fresh & recovered for Push Day!`;
    }

    return { recommendedSplit, warningMsg };
  }
}

window.FitBodyMap = new BodyMapEngine();
