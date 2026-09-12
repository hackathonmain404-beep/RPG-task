import { z } from 'zod';

export const sendMagicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, 'Email or identifier must be at least 3 characters')
    .refine((val) => {
      // Allow valid email format OR the special admin identifier 'Achiever_admin_4.com'
      if (val.toLowerCase() === 'achiever_admin_4.com') return true;
      return z.string().email().safeParse(val).success;
    }, {
      message: 'Please provide a valid email address or administrator identifier.',
    }),
});

export const verifyMagicLinkSchema = z.object({
  token: z.string().trim().min(8, 'Invalid or malformed verification token.'),
});

export type SendMagicLinkInput = z.infer<typeof sendMagicLinkSchema>;
export type VerifyMagicLinkInput = z.infer<typeof verifyMagicLinkSchema>;
