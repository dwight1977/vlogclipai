const fs = require('fs');
const path = require('path');

class UserDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'users.json');
    this.subscriptionsPath = path.join(__dirname, 'data', 'subscriptions.json');
    this.sessionsPath = path.join(__dirname, 'data', 'sessions.json');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize database files if they don't exist
    this.initializeDatabases();
  }

  initializeDatabases() {
    // Initialize users database
    if (!fs.existsSync(this.dbPath)) {
      this.saveData(this.dbPath, {
        users: {},
        nextId: 1
      });
    }
    
    // Initialize subscriptions database
    if (!fs.existsSync(this.subscriptionsPath)) {
      this.saveData(this.subscriptionsPath, {
        subscriptions: {},
        customerIds: {}
      });
    }
    
    // Initialize sessions database
    if (!fs.existsSync(this.sessionsPath)) {
      this.saveData(this.sessionsPath, {
        sessions: {}
      });
    }
  }

  loadData(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error(`Error loading data from ${filePath}:`, error);
      return {};
    }
  }

  saveData(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving data to ${filePath}:`, error);
      return false;
    }
  }

  // User management methods
  async createUser(userData) {
    try {
      const db = this.loadData(this.dbPath);
      
      // Check if user already exists
      const existingUser = Object.values(db.users || {}).find(
        user => user.email === userData.email
      );
      
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const userId = `user_${db.nextId || 1}`;
      const newUser = {
        id: userId,
        email: userData.email,
        password: userData.password, // Already hashed
        username: userData.username,
        plan: 'free',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        metadata: {
          videosGenerated: 0,
          totalUsage: 0,
          monthlyUsage: 0,
          lastResetDate: new Date().toISOString()
        }
      };

      db.users[userId] = newUser;
      db.nextId = (db.nextId || 1) + 1;
      
      if (this.saveData(this.dbPath, db)) {
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      } else {
        throw new Error('Failed to save user to database');
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const db = this.loadData(this.dbPath);
      const user = Object.values(db.users || {}).find(user => user.email === email);
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUserById(userId) {
    try {
      const db = this.loadData(this.dbPath);
      return db.users[userId] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async updateUser(userId, updates) {
    try {
      const db = this.loadData(this.dbPath);
      
      if (!db.users[userId]) {
        throw new Error('User not found');
      }

      db.users[userId] = {
        ...db.users[userId],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      if (this.saveData(this.dbPath, db)) {
        const { password, ...userWithoutPassword } = db.users[userId];
        return userWithoutPassword;
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      throw error;
    }
  }

  async updateUserPlan(userId, plan, stripeData = {}) {
    try {
      const updates = {
        plan: plan,
        stripeCustomerId: stripeData.customerId || null,
        stripeSubscriptionId: stripeData.subscriptionId || null
      };
      
      return await this.updateUser(userId, updates);
    } catch (error) {
      throw error;
    }
  }

  async incrementUserUsage(userId, type = 'video') {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentDate = new Date();
      const lastResetDate = new Date(user.metadata.lastResetDate);
      const isNewMonth = currentDate.getMonth() !== lastResetDate.getMonth() || 
                        currentDate.getFullYear() !== lastResetDate.getFullYear();

      const updates = {
        metadata: {
          ...user.metadata,
          videosGenerated: user.metadata.videosGenerated + 1,
          totalUsage: user.metadata.totalUsage + 1,
          monthlyUsage: isNewMonth ? 1 : user.metadata.monthlyUsage + 1,
          lastResetDate: isNewMonth ? currentDate.toISOString() : user.metadata.lastResetDate
        }
      };

      return await this.updateUser(userId, updates);
    } catch (error) {
      throw error;
    }
  }

  // Subscription management methods
  async saveSubscription(userId, subscriptionData) {
    try {
      const db = this.loadData(this.subscriptionsPath);
      
      db.subscriptions[userId] = {
        ...subscriptionData,
        userId: userId,
        updatedAt: new Date().toISOString()
      };

      // Also save customer ID mapping
      if (subscriptionData.customerId) {
        db.customerIds[subscriptionData.customerId] = userId;
      }

      return this.saveData(this.subscriptionsPath, db);
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  }

  async getSubscription(userId) {
    try {
      const db = this.loadData(this.subscriptionsPath);
      return db.subscriptions[userId] || null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  async getUserByCustomerId(customerId) {
    try {
      const db = this.loadData(this.subscriptionsPath);
      const userId = db.customerIds[customerId];
      if (userId) {
        return await this.getUserById(userId);
      }
      return null;
    } catch (error) {
      console.error('Error getting user by customer ID:', error);
      return null;
    }
  }

  // Session management methods
  async saveSession(sessionId, sessionData) {
    try {
      const db = this.loadData(this.sessionsPath);
      
      db.sessions[sessionId] = {
        ...sessionData,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      return this.saveData(this.sessionsPath, db);
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  async getSession(sessionId) {
    try {
      const db = this.loadData(this.sessionsPath);
      const session = db.sessions[sessionId];
      
      if (session && new Date(session.expiresAt) > new Date()) {
        return session;
      }
      
      // Clean up expired session
      if (session) {
        delete db.sessions[sessionId];
        this.saveData(this.sessionsPath, db);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    try {
      const db = this.loadData(this.sessionsPath);
      delete db.sessions[sessionId];
      return this.saveData(this.sessionsPath, db);
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Cleanup methods
  async cleanupExpiredSessions() {
    try {
      const db = this.loadData(this.sessionsPath);
      const now = new Date();
      let cleaned = false;

      for (const [sessionId, session] of Object.entries(db.sessions)) {
        if (new Date(session.expiresAt) <= now) {
          delete db.sessions[sessionId];
          cleaned = true;
        }
      }

      if (cleaned) {
        this.saveData(this.sessionsPath, db);
      }

      return cleaned;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return false;
    }
  }

  // Analytics methods
  async getUserAnalytics(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return null;
      }

      return {
        plan: user.plan,
        videosGenerated: user.metadata.videosGenerated,
        monthlyUsage: user.metadata.monthlyUsage,
        totalUsage: user.metadata.totalUsage,
        memberSince: user.createdAt,
        lastActivity: user.lastLogin || user.updatedAt
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  // Admin methods
  async getAllUsers() {
    try {
      const db = this.loadData(this.dbPath);
      return Object.values(db.users || {}).map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getUserCount() {
    try {
      const db = this.loadData(this.dbPath);
      return Object.keys(db.users || {}).length;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }
}

module.exports = UserDatabase;