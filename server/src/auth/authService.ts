import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDatabase } from '../models/db';
import { config } from '../config/env';

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch {
      return null;
    }
  }

  static async register(name: string, email: string, password: string, role?: UserRole): Promise<AuthResponse> {
    const db = getDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.get<UserWithPassword>('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    // Check if this is the first user; if so, make them ADMIN
    const userCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const assignedRole = role || ((userCount?.count || 0) === 0 ? 'ADMIN' : 'ANALYST');

    const passwordHash = await this.hashPassword(password);
    const userId = crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, normalizedEmail, passwordHash, name.trim(), assignedRole, now, now]
    );

    const user: User = {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      role: assignedRole,
      created_at: now,
      updated_at: now,
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const db = getDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const userRecord = await db.get<UserWithPassword>('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!userRecord) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await this.comparePassword(password, userRecord.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      created_at: userRecord.created_at,
      updated_at: userRecord.updated_at,
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  static async getUserById(id: string): Promise<User | null> {
    const db = getDatabase();
    const userRecord = await db.get<User>('SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    return userRecord || null;
  }

  static async getAllUsers(): Promise<User[]> {
    const db = getDatabase();
    return db.query<User>('SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC');
  }

  static async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const db = getDatabase();
    await db.run('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [newRole, new Date().toISOString(), userId]);
  }
}
