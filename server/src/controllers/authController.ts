import { Request, Response } from 'express';
import { AuthService, UserRole } from '../auth/authService';
import { logAudit } from '../middleware/auditLogger';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required.' },
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' },
      });
      return;
    }

    const result = await AuthService.register(name, email, password, role as UserRole);

    await logAudit({
      userId: result.user.id,
      userName: result.user.name,
      action: 'USER_REGISTERED',
      resource: `user:${result.user.id}`,
      result: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: err.message },
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' },
      });
      return;
    }

    const result = await AuthService.login(email, password);

    await logAudit({
      userId: result.user.id,
      userName: result.user.name,
      action: 'USER_LOGIN',
      resource: `user:${result.user.id}`,
      result: 'SUCCESS',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_FAILED', message: err.message || 'Invalid credentials' },
    });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (req.user) {
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      action: 'USER_LOGOUT',
      resource: `user:${req.user.id}`,
      result: 'SUCCESS',
    });
  }

  res.json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' },
    });
    return;
  }

  const user = await AuthService.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User record not found.' },
    });
    return;
  }

  res.json({
    success: true,
    data: { user },
  });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await AuthService.getAllUsers();
    res.json({
      success: true,
      data: { users },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'ANALYST', 'VIEWER'].includes(role)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Role must be ADMIN, ANALYST, or VIEWER.' },
      });
      return;
    }

    await AuthService.updateUserRole(id, role as UserRole);

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'USER_ROLE_UPDATED',
      resource: `user:${id}`,
      result: 'SUCCESS',
      details: { newRole: role },
    });

    res.json({
      success: true,
      data: { message: `User role updated to ${role}.` },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}
