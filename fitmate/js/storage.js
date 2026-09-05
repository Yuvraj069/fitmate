/**
 * FitMate Data Storage & State Integration Layer
 * Manages user state, custom exercise logging, and data persistence.
 */

const STORAGE_KEY = 'fitmate_app_state_v3';

const DEFAULT_TODAYS_WORKOUT = {
  splitName: 'Push Day A (Chest, Shoulders & Triceps)',
  exercises: [
    {
      id: 'ex-1',
      name: 'Barbell Flat Bench Press',
      muscleGroup: 'chest',
      sets: [
        { setNum: 1, targetReps: 8, targetWeight: 185 },
        { setNum: 2, targetReps: 8, targetWeight: 195 },
        { setNum: 3, targetReps: 6, targetWeight: 205 },
        { setNum: 4, targetReps: 6, targetWeight: 205 }
      ]
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      muscleGroup: 'chest',
      sets: [
        { setNum: 1, targetReps: 10, targetWeight: 75 },
        { setNum: 2, targetReps: 10, targetWeight: 80 },
        { setNum: 3, targetReps: 8, targetWeight: 85 }
      ]
    }
  ]
};

class StorageService {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveState({
        rendezvous: {
          scheduledTime: '17:30',
          formattedTime: 'Today at 5:30 PM',
          targetSplit: 'Push Day A (Chest, Shoulders & Triceps)',
          notes: 'Heavy 5x5 bench press today! Hydrate early.'
        },
        todaysWorkout: DEFAULT_TODAYS_WORKOUT,
        nutritionFeed: []
      });
    }
  }

  getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  getActiveUser() {
    return window.FitAuth ? window.FitAuth.getCurrentUser() : null;
  }

  getPartnerUser() {
    return window.FitPartners ? window.FitPartners.getSelectedPartner() : null;
  }

  // Add Custom Exercise to Today's Workout!
  addCustomExercise(name, muscleGroup, setsCount, targetReps, targetWeight) {
    const state = this.getState();
    if (!state.todaysWorkout) {
      state.todaysWorkout = { splitName: 'Custom Workout Split', exercises: [] };
    }

    const sets = [];
    const count = parseInt(setsCount) || 3;
    const reps = parseInt(targetReps) || 10;
    const weight = parseFloat(targetWeight) || 0;

    for (let i = 1; i <= count; i++) {
      sets.push({ setNum: i, targetReps: reps, targetWeight: weight });
    }

    const newExercise = {
      id: 'ex-' + Date.now(),
      name: name.trim(),
      muscleGroup: muscleGroup.toLowerCase(),
      sets: sets
    };

    state.todaysWorkout.exercises.push(newExercise);
    this.saveState(state);
  }

  updateMuscleSoreness(muscleKey, level) {
    const user = this.getActiveUser();
    if (user && window.FitRestAPI) {
      const updatedSoreness = { ...user.soreness, [muscleKey]: level };
      window.FitRestAPI.updateUserData(user.username, { soreness: updatedSoreness });
      this.notifyListeners();
    }
  }

  updateRendezvous(timeStr, splitName, noteStr) {
    const state = this.getState();
    state.rendezvous = {
      scheduledTime: timeStr,
      formattedTime: `Today at ${timeStr}`,
      targetSplit: splitName || state.rendezvous.targetSplit,
      notes: noteStr || state.rendezvous.notes
    };
    this.saveState(state);
  }

  logSet(exerciseId, setIndex, reps, weight, isCompleted) {
    const state = this.getState();
    const user = this.getActiveUser();
    if (!user) return;

    const exercise = state.todaysWorkout.exercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.sets[setIndex]) {
      const setItem = exercise.sets[setIndex];
      setItem[user.username] = {
        reps: parseInt(reps) || 0,
        weight: parseFloat(weight) || 0,
        done: !!isCompleted
      };
      this.saveState(state);
    }
  }

  addNutritionLog(mealType, title, cals, prot, carbs, fats) {
    const state = this.getState();
    const user = this.getActiveUser();
    if (!user || !window.FitRestAPI) return;

    const n = { ...user.nutrition };
    n.calories += parseInt(cals) || 0;
    n.protein += parseInt(prot) || 0;
    n.carbs += parseInt(carbs) || 0;
    n.fats += parseInt(fats) || 0;

    window.FitRestAPI.updateUserData(user.username, { nutrition: n });

    state.nutritionFeed.unshift({
      id: 'feed-' + Date.now(),
      userName: user.name,
      type: 'meal',
      title: `${mealType}: ${title}`,
      desc: `${cals} kcal | ${prot}g Protein | ${carbs}g Carbs | ${fats}g Fat`,
      macros: { calories: cals, protein: prot, carbs: carbs, fats: fats },
      time: 'Just now'
    });

    this.saveState(state);
  }

  addHydrationLog(amountMl) {
    const state = this.getState();
    const user = this.getActiveUser();
    if (!user || !window.FitRestAPI) return;

    const n = { ...user.nutrition };
    n.waterMl += parseInt(amountMl) || 250;

    window.FitRestAPI.updateUserData(user.username, { nutrition: n });

    state.nutritionFeed.unshift({
      id: 'feed-' + Date.now(),
      userName: user.name,
      type: 'hydration',
      title: 'Water Logged',
      desc: `Logged +${amountMl}ml water (Total: ${n.waterMl}ml)`,
      macros: { waterMl: amountMl },
      time: 'Just now'
    });

    this.saveState(state);
  }
}

window.FitStorage = new StorageService();
