/**
 * FitMate Workout & Exercise Suite Engine
 * Handles live exercise logging, sets/reps syncing between partners,
 * and integrated rest timer.
 */

class WorkoutEngine {
  constructor() {
    this.restTimerSeconds = 0;
    this.restTimerInterval = null;
  }

  // Render Todays Workout Exercises
  renderWorkoutExercises(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.FitStorage) return;

    const state = window.FitStorage.getState();
    const activeUser = window.FitStorage.getActiveUser();
    const partnerUser = window.FitStorage.getPartnerUser();
    const exercises = state.todaysWorkout ? state.todaysWorkout.exercises : [];

    if (!activeUser || exercises.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No exercises scheduled for this split yet.
        </div>
      `;
      return;
    }

    let html = '';
    exercises.forEach((ex) => {
      html += `
        <div class="exercise-card" id="card-${ex.id}">
          <div class="exercise-header">
            <div class="exercise-name">
              ${ex.name}
              <span class="muscle-tag">${ex.muscleGroup.toUpperCase()}</span>
            </div>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 4px 8px;" onclick="window.FitWorkout.startRestTimer(90)">
              ⏱️ 90s Rest
            </button>
          </div>

          <table class="set-table">
            <thead>
              <tr>
                <th style="width: 50px;">SET</th>
                <th>TARGET REPS</th>
                <th>WEIGHT (LBS)</th>
                <th>${activeUser.name.split(' ')[0]} (YOU)</th>
                <th>${partnerUser ? partnerUser.name.split(' ')[0] : 'PARTNER'}</th>
                <th style="width: 50px; text-align: center;">LOG</th>
              </tr>
            </thead>
            <tbody>
      `;

      ex.sets.forEach((setItem, index) => {
        const myLog = setItem[activeUser.username] || { reps: setItem.targetReps, weight: setItem.targetWeight, done: false };
        const partnerLog = partnerUser && setItem[partnerUser.username] ? setItem[partnerUser.username] : { reps: 0, weight: 0, done: false };

        html += `
          <tr>
            <td style="font-weight: 700; color: var(--apple-blue);">#${setItem.setNum}</td>
            <td style="color: var(--text-muted);">${setItem.targetReps} reps</td>
            <td style="color: var(--text-muted);">${setItem.targetWeight} lbs</td>
            <td>
              <div style="display: flex; gap: 4px;">
                <input type="number" class="input-num" id="reps-${ex.id}-${index}" value="${myLog.reps}" placeholder="Reps">
                <input type="number" class="input-num" id="weight-${ex.id}-${index}" value="${myLog.weight}" placeholder="Lbs">
              </div>
            </td>
            <td>
              ${partnerLog.done 
                ? `<span class="partner-log-badge">✓ ${partnerLog.reps}x @ ${partnerLog.weight}lbs</span>`
                : `<span style="font-size: 0.75rem; color: var(--text-subtle);">Pending</span>`
              }
            </td>
            <td style="text-align: center;">
              <button class="check-btn ${myLog.done ? 'completed' : ''}" 
                onclick="window.FitWorkout.toggleSetDone('${ex.id}', ${index})">
                ✓
              </button>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Toggle Set Done
  toggleSetDone(exerciseId, setIndex) {
    const activeUser = window.FitStorage.getActiveUser();
    const state = window.FitStorage.getState();
    const exercise = state.todaysWorkout.exercises.find(e => e.id === exerciseId);
    
    if (exercise && exercise.sets[setIndex]) {
      const setItem = exercise.sets[setIndex];
      const myLog = setItem[activeUser.username] || {};
      const newDoneState = !myLog.done;

      const repsVal = document.getElementById(`reps-${exerciseId}-${setIndex}`)?.value || setItem.targetReps;
      const weightVal = document.getElementById(`weight-${exerciseId}-${setIndex}`)?.value || setItem.targetWeight;

      window.FitStorage.logSet(exerciseId, setIndex, repsVal, weightVal, newDoneState);

      if (newDoneState) {
        this.startRestTimer(90);
      }
    }
  }

  startRestTimer(seconds) {
    clearInterval(this.restTimerInterval);
    this.restTimerSeconds = seconds;
    this.updateTimerUI();

    const banner = document.getElementById('rest-timer-banner');
    if (banner) banner.style.display = 'flex';

    this.restTimerInterval = setInterval(() => {
      this.restTimerSeconds--;
      this.updateTimerUI();

      if (this.restTimerSeconds <= 0) {
        clearInterval(this.restTimerInterval);
        if (banner) banner.style.display = 'none';
        if (window.FitApp) window.FitApp.showToast('⏱️ Rest Over!', 'Time to hit the next set with maximum force!');
      }
    }, 1000);
  }

  updateTimerUI() {
    const elem = document.getElementById('rest-timer-display');
    if (elem) {
      const mins = Math.floor(this.restTimerSeconds / 60);
      const secs = this.restTimerSeconds % 60;
      elem.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }

  stopRestTimer() {
    clearInterval(this.restTimerInterval);
    const banner = document.getElementById('rest-timer-banner');
    if (banner) banner.style.display = 'none';
  }
}

window.FitWorkout = new WorkoutEngine();
