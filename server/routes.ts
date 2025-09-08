import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUserSchema, insertCategorySchema, insertArticleSchema } from "@shared/schema";

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || "news-portal-secret-key";

// File upload configuration
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await storage.validateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Don't store password in session
      const { password: _, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Public API routes
  
  // Get all published articles
  app.get('/api/articles', async (req, res) => {
    try {
      const { category, limit = '10', offset = '0', search } = req.query;
      
      const filters: any = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      if (category) {
        const categoryRecord = await storage.getCategoryBySlug(category as string);
        if (categoryRecord) {
          filters.categoryId = categoryRecord.id;
        }
      }

      if (search) {
        filters.search = search as string;
      }

      const result = await storage.getPublishedArticles(filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  // Get single article by slug
  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      if (article.status !== 'published') {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ message: 'Failed to fetch article' });
    }
  });

  // Get featured article
  app.get('/api/articles/featured/latest', async (req, res) => {
    try {
      const article = await storage.getFeaturedArticle();
      res.json(article);
    } catch (error) {
      console.error('Error fetching featured article:', error);
      res.status(500).json({ message: 'Failed to fetch featured article' });
    }
  });

  // Get related articles
  app.get('/api/articles/:id/related', async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const related = await storage.getRelatedArticles(article.id, article.categoryId);
      res.json(related);
    } catch (error) {
      console.error('Error fetching related articles:', error);
      res.status(500).json({ message: 'Failed to fetch related articles' });
    }
  });

  // Get all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategoriesWithCount();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Get category by slug
  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });

  // Admin API routes

  // Dashboard stats
  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Articles management
  app.get('/api/admin/articles', requireAuth, async (req, res) => {
    try {
      const { status, category, author, search, limit = '10', offset = '0', orderBy } = req.query;
      
      const filters: any = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        orderBy: orderBy as any,
      };

      if (status) filters.status = status as string;
      if (category) filters.categoryId = category as string;
      if (author) filters.authorId = author as string;
      if (search) filters.search = search as string;

      const result = await storage.getAllArticles(filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching admin articles:', error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  app.get('/api/admin/articles/:id', requireAuth, async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ message: 'Failed to fetch article' });
    }
  });

  app.post('/api/admin/articles', requireAuth, async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      
      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = generateSlug(validatedData.title);
      }

      // Set author to current user
      validatedData.authorId = req.session.user.id;

      // Set published date if publishing
      if (validatedData.status === 'published') {
        validatedData.publishedAt = new Date();
      }

      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Failed to create article' });
    }
  });

  app.put('/api/admin/articles/:id', requireAuth, async (req, res) => {
    try {
      const existingArticle = await storage.getArticle(req.params.id);
      if (!existingArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const validatedData = insertArticleSchema.partial().parse(req.body);
      
      // Generate slug if title changed
      if (validatedData.title && !validatedData.slug) {
        validatedData.slug = generateSlug(validatedData.title);
      }

      // Set published date if publishing for the first time
      if (validatedData.status === 'published' && existingArticle.status !== 'published') {
        validatedData.publishedAt = new Date();
      }

      const article = await storage.updateArticle(req.params.id, validatedData);
      res.json(article);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ message: 'Failed to update article' });
    }
  });

  app.delete('/api/admin/articles/:id', requireAuth, async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      await storage.deleteArticle(req.params.id);
      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ message: 'Failed to delete article' });
    }
  });

  // Categories management
  app.get('/api/admin/categories', requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategoriesWithCount();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.post('/api/admin/categories', requireAuth, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      
      if (!validatedData.slug) {
        validatedData.slug = generateSlug(validatedData.name);
      }

      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  app.put('/api/admin/categories/:id', requireAuth, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.partial().parse(req.body);
      
      if (validatedData.name && !validatedData.slug) {
        validatedData.slug = generateSlug(validatedData.name);
      }

      const category = await storage.updateCategory(req.params.id, validatedData);
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Failed to update category' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  });

  // Users management (admin only)
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, validatedData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      if (req.params.id === req.session.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      await storage.deleteUser(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // File upload
  app.post('/api/admin/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const uploadRecord = await storage.createUpload({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.session.user.id,
      });

      res.json(uploadRecord);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Get user uploads
  app.get('/api/admin/uploads', requireAuth, async (req, res) => {
    try {
      const uploads = await storage.getUserUploads(req.session.user.id);
      res.json(uploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      res.status(500).json({ message: 'Failed to fetch uploads' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
