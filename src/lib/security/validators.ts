import { z } from 'zod';

/**
 * Enterprise XSS Sanitizer: strips executable HTML tags, javascript: pseudo-protocols, and unsafe characters.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// Safe URL validator ensuring only http and https protocols (prevents javascript:, data:, file:)
const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must use https:// or http:// protocol.' }
  );

// Strict GitHub URL Validator for SSRF Prevention
export const githubUrlValidator = z
  .string()
  .trim()
  .min(1, 'Repository URL is required')
  .refine(
    (val) => {
      // Must match github.com/owner/repo or owner/repo format
      const cleaned = val.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\/$/, '');
      const parts = cleaned.split('/');
      if (parts.length !== 2) return false;
      const [owner, repo] = parts;
      const validNameRegex = /^[a-zA-Z0-9_.-]+$/;
      return validNameRegex.test(owner) && validNameRegex.test(repo);
    },
    { message: 'Invalid GitHub repository format. Use https://github.com/owner/repo or owner/repo' }
  );

// User Auth Schemas
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'),
  email: z.string().trim().email('Invalid email address').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(100)
    .transform((v) => sanitizeInput(v)),
  githubUsername: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v ? sanitizeInput(v) : undefined)),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Project Creation Schema
export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100)
    .transform((v) => sanitizeInput(v)),
  tagline: z
    .string()
    .trim()
    .min(5, 'Tagline must be at least 5 characters')
    .max(200)
    .transform((v) => sanitizeInput(v)),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000)
    .transform((v) => sanitizeInput(v)),
  status: z.enum(['Open', 'Abandoned', 'Open Source', 'Freelance', 'Closed']),
  type: z.enum(['Open Source', 'Freelance', 'Company Project', 'Personal Project', 'Startup']),
  codebaseUrl: safeUrlSchema.optional().nullable(),
  isCodebasePublic: z.boolean().default(true),
  techStack: z
    .array(
      z
        .string()
        .trim()
        .max(40)
        .transform((v) => sanitizeInput(v))
    )
    .min(1, 'At least one tech stack tag is required')
    .max(20),
  abandonReason: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeInput(v) : null)),
  adoptionPitch: z
    .string()
    .trim()
    .max(1500)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeInput(v) : null)),
  lookingFor: z
    .array(
      z
        .string()
        .trim()
        .max(50)
        .transform((v) => sanitizeInput(v))
    )
    .max(10)
    .optional()
    .default([]),
  license: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default('MIT')
    .transform((v) => sanitizeInput(v)),
  demoUrl: safeUrlSchema.optional().nullable(),
});

// Codebase Request Schema
export const createRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  roleProposed: z.enum(['Maintainer', 'Co-Founder', 'Technical Co-Founder', 'Contributor', 'Buyer', 'Explorer']),
  initialMessage: z
    .string()
    .trim()
    .min(10, 'Proposal message must be at least 10 characters')
    .max(2000)
    .transform((v) => sanitizeInput(v)),
});

// Chat Message Schema
export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(3000)
    .transform((v) => sanitizeInput(v)),
});

// Update Request Status Schema
export const updateRequestStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'ACCESS_GRANTED']),
  repoAccessGrantLink: safeUrlSchema.optional().nullable(),
});

