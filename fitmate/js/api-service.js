/**
 * FitMate REST API Service Client & Network Backend
 * Clean REST API data store with zero hardcoded sandbox users.
 */

const API_STORAGE_KEY = 'fitmate_rest_api_db_v3';
const API_DELAY_MS = 80;

class RestApiService {
  constructor() {
    this.init();
  }

  init() {
    const raw = localStorage.getItem(API_STORAGE_KEY);
    if (!raw) {
      this.saveDB({}); // Start 100% clean - NO hardcoded demo users!
    }
  }

  getDB() {
    try {
      const raw = localStorage.getItem(API_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveDB(db) {
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(db));
  }

  async _delay() {
    return new Promise(res => setTimeout(res, API_DELAY_MS));
  }

  // 1. POST /api/auth/register
  async register(data) {
    await this._delay();
    const db = this.getDB();
    const cleanUsername = data.username.trim().toLowerCase().replace(/^@/, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: "FitMate ID must be at least 3 characters long." };
    }

    if (db[cleanUsername]) {
      return { success: false, message: `FitMate ID @${cleanUsername} is already registered.` };
    }

    const newUser = {
      id: "usr_" + Date.now(),
      username: cleanUsername,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      avatar: data.name.trim().charAt(0).toUpperCase(),
      status: "confirmed",
      privacySetting: "friends",
      height: data.height || "178 cm",
      weight: data.weight || "75 kg",
      split: data.split || "Push Day A (Chest, Shoulders & Triceps)",
      prs: { bench: data.benchPr || "225 lbs" },
      partners: [],
      pendingRequests: [],
      sentRequests: [],
      isFirstRegister: true,
      soreness: { chest: 10, shoulders: 10, biceps: 10, triceps: 10, abs: 10, quads: 10, hamstrings: 10, lats: 10, upperBack: 10, lowerBack: 10, glutes: 10, calves: 10 },
      nutrition: {
        calories: 0, targetCalories: parseInt(data.targetCalories) || 2800,
        protein: 0, targetProtein: 180,
        carbs: 0, targetCarbs: 280,
        fats: 0, targetFats: 75,
        waterMl: 0, sleepHours: 8.0
      }
    };

    db[cleanUsername] = newUser;
    this.saveDB(db);

    return { success: true, user: newUser };
  }

  // 2. POST /api/auth/login
  async login(usernameOrEmail, password) {
    await this._delay();
    const db = this.getDB();
    const input = usernameOrEmail.trim().toLowerCase().replace(/^@/, '');

    let matchedUser = db[input];
    if (!matchedUser) {
      matchedUser = Object.values(db).find(u => u.email.toLowerCase() === input);
    }

    if (!matchedUser) {
      return { success: false, message: "User account not found. Please register first." };
    }

    if (matchedUser.password !== password) {
      return { success: false, message: "Incorrect password." };
    }

    return { success: true, user: matchedUser };
  }

  // 3. GET /api/users/search?q=...
  async searchUsers(query) {
    await this._delay();
    const db = this.getDB();
    const q = query.trim().toLowerCase().replace(/^@/, '');

    if (!q) return [];

    return Object.values(db)
      .filter(u => u.username.includes(q) || u.name.toLowerCase().includes(q))
      .map(u => ({ id: u.id, username: u.username, name: u.name, avatar: u.avatar, privacySetting: u.privacySetting || 'friends' }));
  }

  // 4. POST /api/partners/request
  async sendPartnerRequest(senderUsername, targetUsername) {
    await this._delay();
    const db = this.getDB();
    const sender = db[senderUsername];
    const target = db[targetUsername];

    if (!sender || !target) return { success: false, message: "User not found." };
    if (senderUsername === targetUsername) return { success: false, message: "Cannot send request to yourself." };
    if (sender.partners.includes(targetUsername)) return { success: false, message: `Already partners with @${targetUsername}.` };
    if (sender.sentRequests.includes(targetUsername)) return { success: false, message: `Request already sent to @${targetUsername}.` };

    sender.sentRequests.push(targetUsername);
    target.pendingRequests.push({
      fromUsername: sender.username,
      fromName: sender.name,
      fromAvatar: sender.avatar,
      sentAt: new Date().toISOString()
    });

    this.saveDB(db);
    return { success: true, message: `Partner request sent to @${targetUsername}!` };
  }

  // 5. POST /api/partners/accept
  async acceptPartnerRequest(currentUsername, fromUsername) {
    await this._delay();
    const db = this.getDB();
    const user = db[currentUsername];
    const partner = db[fromUsername];

    if (!user || !partner) return { success: false, message: "User not found." };

    user.pendingRequests = user.pendingRequests.filter(req => req.fromUsername !== fromUsername);
    partner.sentRequests = partner.sentRequests.filter(uname => uname !== currentUsername);

    if (!user.partners.includes(fromUsername)) user.partners.push(fromUsername);
    if (!partner.partners.includes(currentUsername)) partner.partners.push(currentUsername);

    this.saveDB(db);
    return { success: true, message: `You and @${fromUsername} are now connected workout partners!` };
  }

  async updateUserData(username, partialUserData) {
    const db = this.getDB();
    if (db[username]) {
      db[username] = { ...db[username], ...partialUserData };
      this.saveDB(db);
    }
  }

  async completeWalkthrough(username) {
    const db = this.getDB();
    if (db[username]) {
      db[username].isFirstRegister = false;
      this.saveDB(db);
    }
  }
}

window.FitRestAPI = new RestApiService();
