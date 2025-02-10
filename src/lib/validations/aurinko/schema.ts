import { z } from "zod";

export const exchnageTokenFnValidation = z.object({
  accountId: z.number().int(),
  accessToken: z.string(),
});

export const getAccDetailsFnValidation = z.object({
  id: z.number(),
  serviceType: z.enum(["Google", "Office365"]),
  active: z.boolean(),
  tokenStatus: z.string(),
  type: z.string(),
  daemon: z.boolean(),
  loginString: z.string().email(),
  email: z.string().email(),
  mailboxAddress: z.string().email(),
  name: z.string(),
  authUserId: z.string(),
  tokenIssuedAt: z.string().datetime(),
  authScopes: z.array(z.string()),
  authNativeScopes: z.array(z.string()),
  authObtainedAt: z.string().datetime(),
  authExpiresAt: z.string().datetime()
});
