import { z } from "zod";

// Cognito still enforces the full password policy (uppercase, lowercase, number).
// These rules just catch obviously bad input before we bother calling Cognito.
export const signupSchema = z.object({
    email: z.email("Must be a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
}).strict();

export const confirmSignupSchema = z.object({
    email: z.email("Must be a valid email"),
    confirmationCode: z.string().regex(/^\d{6}$/, "Code must be 6 digits")
}).strict();

export const loginSchema = z.object({
    email: z.email("Must be a valid email"),
    password: z.string().min(1, "Password is required")
}).strict();

export const forgotPasswordSchema = z.object({
    email: z.email("Must be a valid email")
}).strict();

export const resetPasswordSchema = z.object({
    email: z.email("Must be a valid email"),
    confirmationCode: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
}).strict();
