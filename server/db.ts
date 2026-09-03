import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashPassword } from './auth';

export interface UserRecord {
  id: string;
  fullName: string;
  hallTicket: string;
  rank: number;
  category: string;
  gender: string;
  mobile: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface AdminRecord {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  role: 'student' | 'admin';
  createdAt: string;
  expiresAt: string;
}

export interface CounsellingItem {
  id: string;
  record: any;
  closingRank: number | null;
  studentRank: number;
  chance: string;
  priority: number;
  addedAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  admins?: AdminRecord[];
  sessions: SessionRecord[];
  counselling: Record<string, CounsellingItem[]>; // userId -> preferences
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

class DatabaseManager {
  private data: DatabaseSchema = {
    users: [],
    admins: [],
    sessions: [],
    counselling: {},
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.admins) this.data.admins = [];
        if (!this.data.sessions) this.data.sessions = [];
        if (!this.data.counselling) this.data.counselling = {};
      } else {
        this.data.admins = [];
        this.persist();
      }

      // Ensure default authorized administrator account exists in database
      this.ensureAdminAccount();
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }

  private ensureAdminAccount() {
    if (!this.data.admins) {
      this.data.admins = [];
    }

    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Eapcet2025!';

    let existingAdmin = this.data.admins.find(
      (a) => a.username.toLowerCase() === adminUsername
    );

    if (!existingAdmin) {
      // Create hashed admin record securely using scrypt
      const { salt, hash } = hashPassword(adminPassword);
      const newAdmin: AdminRecord = {
        id: `adm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        username: adminUsername,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString(),
      };
      this.data.admins.push(newAdmin);
      this.persist();
      console.log(`[ADMIN SETUP] Admin account verified: ${adminUsername}`);
    } else if (process.env.ADMIN_PASSWORD) {
      // If environment variable explicitly overrides the password, update hash
      const { salt, hash } = hashPassword(adminPassword);
      existingAdmin.passwordHash = hash;
      existingAdmin.salt = salt;
      this.persist();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Database persistence error:', err);
    }
  }

  // Users
  getAllUsers(): UserRecord[] {
    return [...this.data.users];
  }

  getUserByMobile(mobile: string): UserRecord | undefined {
    const cleanMobile = mobile.trim();
    return this.data.users.find((u) => u.mobile === cleanMobile);
  }

  getUserByHallTicket(hallTicket: string): UserRecord | undefined {
    const cleanHt = hallTicket.trim().toUpperCase();
    return this.data.users.find((u) => u.hallTicket.toUpperCase() === cleanHt);
  }

  getUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(params: {
    fullName: string;
    hallTicket: string;
    rank: number;
    category: string;
    gender: string;
    mobile: string;
    passwordHash: string;
    salt: string;
  }): UserRecord {
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      fullName: params.fullName.trim(),
      hallTicket: params.hallTicket.trim().toUpperCase(),
      rank: params.rank,
      category: params.category,
      gender: params.gender,
      mobile: params.mobile.trim(),
      passwordHash: params.passwordHash,
      salt: params.salt,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    // Initialize empty counselling list for user
    if (!this.data.counselling[newUser.id]) {
      this.data.counselling[newUser.id] = [];
    }
    this.persist();
    return newUser;
  }

  // Admins
  getAdminByUsername(username: string): AdminRecord | undefined {
    if (!username || !this.data.admins) return undefined;
    const clean = username.trim().toLowerCase();
    return this.data.admins.find((a) => a.username.toLowerCase() === clean);
  }

  getAdminById(id: string): AdminRecord | undefined {
    if (!this.data.admins) return undefined;
    return this.data.admins.find((a) => a.id === id);
  }

  // Sessions
  createSession(userId: string, token: string, role: 'student' | 'admin' = 'student'): SessionRecord {
    // 7 days expiration
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: SessionRecord = {
      token,
      userId,
      role,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    // Remove any expired sessions
    const now = new Date().toISOString();
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  getSession(token: string): SessionRecord | undefined {
    if (!token) return undefined;
    const now = new Date().toISOString();
    const session = this.data.sessions.find((s) => s.token === token && s.expiresAt > now);
    return session;
  }

  deleteSession(token: string): boolean {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    if (this.data.sessions.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Counselling list specific to user
  getCounselling(userId: string): CounsellingItem[] {
    return this.data.counselling[userId] || [];
  }

  saveCounselling(userId: string, items: CounsellingItem[]): CounsellingItem[] {
    this.data.counselling[userId] = items;
    this.persist();
    return items;
  }
}

export const db = new DatabaseManager();
