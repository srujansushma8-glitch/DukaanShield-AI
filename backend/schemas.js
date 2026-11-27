import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({ required_error: "Email is required." }).min(1, "Email is required."),
  password: z.string({ required_error: "Password is required." }).min(1, "Password is required.")
});

export const registerSchema = z.object({
  ownerName: z.string({ required_error: "Owner name is required." }).min(1, "Owner name is required."),
  shopName: z.string({ required_error: "Shop name is required." }).min(1, "Shop name is required."),
  email: z.string({ required_error: "Email is required." }).email("A valid email address is required."),
  phone: z.string().optional(),
  password: z.string({ required_error: "Password is required." }).min(1, "Password is required.")
});

export const agentRunSchema = z.object({
  instruction: z.string({ required_error: "Instruction prompt cannot be empty." })
    .min(1, "Instruction prompt cannot be empty.")
    .max(2000, "Instruction exceeds maximum length of 2000 characters.")
});

export const approveChallengeSchema = z.object({
  challengeId: z.string({ required_error: "A valid challengeId string is required." })
    .min(1, "A valid challengeId string is required."),
  approved: z.boolean({ required_error: "Field 'approved' must be a boolean." })
});

export const attackRunSchema = z.object({
  attackId: z.union([z.string().min(1), z.number()], {
    required_error: "Field 'attackId' is required."
  })
});

export const emptyBodySchema = z.object({}).passthrough().optional();

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues || [];
      const isOversized = issues.some(
        err => err.code === 'too_big' || err.message?.includes('exceeds maximum length')
      );
      if (isOversized) {
        return res.status(413).json({
          error: "Instruction exceeds maximum length of 2000 characters.",
          code: "PAYLOAD_TOO_LARGE",
          details: issues
        });
      }
      return res.status(400).json({
        error: issues[0]?.message || "Validation failed.",
        code: "VALIDATION_ERROR",
        details: issues
      });
    }
    req.body = result.data;
    next();
  };
}
