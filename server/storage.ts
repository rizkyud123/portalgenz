import {
  users,
  categories,
  articles,
  uploads,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Article,
  type InsertArticle,
  type ArticleWithRelations,
  type Upload,
  type InsertUpload,
  type CategoryWithCount,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  validateUser(username: string, password: string): Promise<User | null>;

  // Category operations
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  getAllCategories(): Promise<Category[]>;
  getCategoriesWithCount(): Promise<CategoryWithCount[]>;

  // Article operations
  getArticle(id: string): Promise<ArticleWithRelations | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getAllArticles(filters?: {
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'newest' | 'oldest' | 'title';
  }): Promise<{ articles: ArticleWithRelations[]; total: number }>;
  getPublishedArticles(filters?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ articles: ArticleWithRelations[]; total: number }>;
  getFeaturedArticle(): Promise<ArticleWithRelations | undefined>;
  getRelatedArticles(articleId: string, categoryId: string, limit?: number): Promise<ArticleWithRelations[]>;

  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUserUploads(userId: string): Promise<Upload[]>;
  deleteUpload(id: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalUsers: number;
    totalCategories: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User> {
    const updateData = { ...updateUser };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Category operations
  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, updateCategory: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...updateCategory, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        articleCount: count(articles.id),
      })
      .from(categories)
      .leftJoin(articles, eq(categories.id, articles.categoryId))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));

    return result;
  }

  // Article operations
  async getArticle(id: string): Promise<ArticleWithRelations | undefined> {
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        authorId: articles.authorId,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        },
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id));

    return article as ArticleWithRelations;
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined> {
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        authorId: articles.authorId,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        },
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug));

    return article as ArticleWithRelations;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async updateArticle(id: string, updateArticle: Partial<InsertArticle>): Promise<Article> {
    const [article] = await db
      .update(articles)
      .set({ ...updateArticle, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getAllArticles(filters: {
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'newest' | 'oldest' | 'title';
  } = {}): Promise<{ articles: ArticleWithRelations[]; total: number }> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(articles.status, filters.status as any));
    }
    if (filters.categoryId) {
      conditions.push(eq(articles.categoryId, filters.categoryId));
    }
    if (filters.authorId) {
      conditions.push(eq(articles.authorId, filters.authorId));
    }
    if (filters.search) {
      conditions.push(
        sql`(${articles.title} ILIKE ${'%' + filters.search + '%'} OR ${articles.content} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(articles)
      .where(whereClause);

    // Get articles with relations
    let query = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        authorId: articles.authorId,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        },
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(whereClause);

    // Apply ordering
    const orderBy = filters.orderBy || 'newest';
    if (orderBy === 'newest') {
      query = query.orderBy(desc(articles.createdAt));
    } else if (orderBy === 'oldest') {
      query = query.orderBy(asc(articles.createdAt));
    } else if (orderBy === 'title') {
      query = query.orderBy(asc(articles.title));
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const articleResults = await query;

    return {
      articles: articleResults as ArticleWithRelations[],
      total: total,
    };
  }

  async getPublishedArticles(filters: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ articles: ArticleWithRelations[]; total: number }> {
    return this.getAllArticles({
      status: 'published',
      ...filters,
      orderBy: 'newest',
    });
  }

  async getFeaturedArticle(): Promise<ArticleWithRelations | undefined> {
    const result = await this.getPublishedArticles({ limit: 1 });
    return result.articles[0];
  }

  async getRelatedArticles(articleId: string, categoryId: string, limit = 4): Promise<ArticleWithRelations[]> {
    const articleResults = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        authorId: articles.authorId,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        },
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.status, 'published'),
          eq(articles.categoryId, categoryId),
          sql`${articles.id} != ${articleId}`
        )
      )
      .orderBy(desc(articles.createdAt))
      .limit(limit);

    return articleResults as ArticleWithRelations[];
  }

  // Upload operations
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  async getUserUploads(userId: string): Promise<Upload[]> {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.uploadedBy, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async deleteUpload(id: string): Promise<void> {
    await db.delete(uploads).where(eq(uploads.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalUsers: number;
    totalCategories: number;
  }> {
    const [totalArticles] = await db.select({ count: count() }).from(articles);
    const [publishedArticles] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.status, 'published'));
    const [draftArticles] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.status, 'draft'));
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalCategories] = await db.select({ count: count() }).from(categories);

    return {
      totalArticles: totalArticles.count,
      publishedArticles: publishedArticles.count,
      draftArticles: draftArticles.count,
      totalUsers: totalUsers.count,
      totalCategories: totalCategories.count,
    };
  }
}

export const storage = new DatabaseStorage();
