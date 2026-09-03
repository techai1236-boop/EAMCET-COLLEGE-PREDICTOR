import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { hashPassword, verifyPassword, generateSessionToken } from './server/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Helper auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please login.' });
    }

    const token = authHeader.substring(7).trim();
    const session = db.getSession(token);

    if (!session) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid. Please login again.' });
    }

    const user = db.getUserById(session.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Account not found.' });
    }

    // Attach user & session to request
    (req as any).user = user;
    (req as any).session = session;
    next();
  };

  // Helper admin authorization middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Administrator authentication required.' });
    }

    const token = authHeader.substring(7).trim();
    const session = db.getSession(token);

    if (!session) {
      return res.status(401).json({ success: false, error: 'Admin session expired or invalid. Please login again.' });
    }

    if (session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Administrator privileges required.' });
    }

    const admin = db.getAdminById(session.userId);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Admin account not found.' });
    }

    // Attach admin & session to request
    (req as any).admin = admin;
    (req as any).session = session;
    next();
  };

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. REGISTER
  app.post('/api/auth/register', (req, res) => {
    try {
      const {
        fullName,
        hallTicket,
        rank,
        category,
        gender,
        mobile,
        password,
        confirmPassword,
      } = req.body;

      // Validate required fields
      if (
        !fullName ||
        typeof fullName !== 'string' ||
        !fullName.trim() ||
        !hallTicket ||
        typeof hallTicket !== 'string' ||
        !hallTicket.trim() ||
        rank === undefined ||
        rank === null ||
        !category ||
        !gender ||
        !mobile ||
        typeof mobile !== 'string' ||
        !mobile.trim() ||
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          error: 'Please enter all required details.',
        });
      }

      // Rank validation
      const numericRank = typeof rank === 'number' ? rank : parseInt(String(rank).replace(/,/g, '').trim(), 10);
      if (isNaN(numericRank) || numericRank <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Rank must be a valid positive number.',
        });
      }

      // Password matching validation
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match.',
        });
      }

      // Mobile number format validation (clean numeric, minimum 10 digits)
      const cleanMobile = mobile.replace(/\s+/g, '').replace(/[-+]/g, '').trim();
      if (!/^\d{10}$/.test(cleanMobile)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 10-digit mobile number.',
        });
      }

      // Check duplicate Hall Ticket Number
      const existingHt = db.getUserByHallTicket(hallTicket);
      if (existingHt) {
        return res.status(409).json({
          success: false,
          error: 'An account with this Hall Ticket Number already exists. Please login.',
        });
      }

      // Check duplicate Mobile Number
      const existingMobile = db.getUserByMobile(cleanMobile);
      if (existingMobile) {
        return res.status(409).json({
          success: false,
          error: 'An account with this mobile number already exists. Please login.',
        });
      }

      // Secure password hashing
      const { salt, hash } = hashPassword(password);

      // Create new user in persistent database
      const user = db.createUser({
        fullName: fullName.trim(),
        hallTicket: hallTicket.trim().toUpperCase(),
        rank: numericRank,
        category: String(category).trim().toUpperCase(),
        gender: String(gender).trim().toUpperCase() === 'GIRLS' ? 'GIRLS' : 'BOYS',
        mobile: cleanMobile,
        passwordHash: hash,
        salt,
      });

      console.log(`[AUTH] Student registered successfully: ${user.fullName} (${user.mobile}, ${user.hallTicket})`);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Please login with your registered mobile number and password.',
        user: {
          id: user.id,
          fullName: user.fullName,
          hallTicket: user.hallTicket,
          mobile: user.mobile,
        },
      });
    } catch (err) {
      console.error('[AUTH REGISTER ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during registration. Please try again.',
      });
    }
  });

  // 2. LOGIN
  app.post('/api/auth/login', (req, res) => {
    try {
      const { mobile, password } = req.body;

      if (!mobile || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please enter both mobile number and password.',
        });
      }

      const cleanMobile = String(mobile).replace(/\s+/g, '').replace(/[-+]/g, '').trim();

      // Search database for registered mobile number
      const user = db.getUserByMobile(cleanMobile);

      if (!user) {
        // Must show exact message: "Account not found. Please register first."
        return res.status(404).json({
          success: false,
          error: 'Account not found. Please register first.',
        });
      }

      // Verify password against stored hash + salt
      const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);

      if (!isPasswordValid) {
        // Must show exact message: "Incorrect mobile number or password."
        return res.status(401).json({
          success: false,
          error: 'Incorrect mobile number or password.',
        });
      }

      // Both mobile and password are correct: Generate session token
      const token = generateSessionToken();
      db.createSession(user.id, token, 'student');

      console.log(`[AUTH] Student logged in: ${user.fullName} (${user.mobile})`);

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          hallTicket: user.hallTicket,
          rank: user.rank,
          category: user.category,
          gender: user.gender,
          mobile: user.mobile,
        },
      });
    } catch (err) {
      console.error('[AUTH LOGIN ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during login. Please try again.',
      });
    }
  });

  // 3. ME (SESSION VERIFICATION)
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    return res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        hallTicket: user.hallTicket,
        rank: user.rank,
        category: user.category,
        gender: user.gender,
        mobile: user.mobile,
      },
    });
  });

  // 4. LOGOUT
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      db.deleteSession(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // 5. GET COUNSELLING LIST FOR LOGGED-IN STUDENT
  app.get('/api/counselling', requireAuth, (req, res) => {
    const user = (req as any).user;
    const preferences = db.getCounselling(user.id);
    return res.json({ success: true, preferences });
  });

  // 6. SAVE/UPDATE COUNSELLING LIST FOR LOGGED-IN STUDENT
  app.post('/api/counselling', requireAuth, (req, res) => {
    const user = (req as any).user;
    const preferences = req.body.preferences || [];
    db.saveCounselling(user.id, preferences);
    return res.json({ success: true, preferences });
  });

  // ----------------------------------------------------
  // ADMIN API ROUTES (STRICTLY RESTRICTED TO ADMINISTRATOR)
  // ----------------------------------------------------

  // 7. ADMIN LOGIN
  app.post('/api/admin/login', (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please enter both administrator username and password.',
        });
      }

      const admin = db.getAdminByUsername(String(username).trim());
      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Invalid administrator username or password.',
        });
      }

      const isMatch = verifyPassword(String(password), admin.salt, admin.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid administrator username or password.',
        });
      }

      const token = generateSessionToken();
      db.createSession(admin.id, token, 'admin');

      console.log(`[ADMIN AUTH] Administrator logged in: ${admin.username}`);

      return res.json({
        success: true,
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: 'admin',
        },
      });
    } catch (err) {
      console.error('[ADMIN LOGIN ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during admin authentication.',
      });
    }
  });

  // 8. ADMIN ME (VERIFY ADMIN SESSION)
  app.get('/api/admin/me', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: 'admin',
      },
    });
  });

  // 9. ADMIN LOGOUT
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      db.deleteSession(token);
    }
    return res.json({ success: true, message: 'Admin logged out successfully.' });
  });

  // 10. ADMIN GET ALL REGISTERED STUDENTS
  app.get('/api/admin/students', requireAdmin, (req, res) => {
    try {
      const users = db.getAllUsers();
      // Strictly sanitize student data: NEVER expose passwordHash or salt
      const students = users.map((u) => {
        const preferences = db.getCounselling(u.id);
        return {
          id: u.id,
          fullName: u.fullName,
          hallTicket: u.hallTicket,
          rank: u.rank,
          category: u.category,
          gender: u.gender,
          mobile: u.mobile,
          createdAt: u.createdAt,
          counsellingCount: preferences.length,
        };
      });

      return res.json({
        success: true,
        total: students.length,
        students,
      });
    } catch (err) {
      console.error('[ADMIN GET STUDENTS ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve registered students.',
      });
    }
  });

  // 11. ADMIN GET SPECIFIC STUDENT DETAILS & COUNSELLING LIST
  app.get('/api/admin/students/:id', requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const user = db.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Student account not found.',
        });
      }

      const counsellingList = db.getCounselling(user.id);

      // Strictly sanitize student data: NEVER expose passwordHash or salt
      const student = {
        id: user.id,
        fullName: user.fullName,
        hallTicket: user.hallTicket,
        rank: user.rank,
        category: user.category,
        gender: user.gender,
        mobile: user.mobile,
        createdAt: user.createdAt,
        counsellingCount: counsellingList.length,
      };

      return res.json({
        success: true,
        student,
        counsellingList,
      });
    } catch (err) {
      console.error('[ADMIN GET STUDENT DETAILS ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve student details.',
      });
    }
  });

  // ----------------------------------------------------
  // CATCH-ALL FOR UNMATCHED API ROUTES
  // Explicitly returns JSON 404 so /api/* never falls through to HTML index
  // ----------------------------------------------------
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route ${req.method} ${req.path} not found.`,
    });
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE & SPA FALLBACK
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TG EAPCET Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
