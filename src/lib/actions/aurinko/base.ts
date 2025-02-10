"use server";

import { env } from "@/env";
import { GLOBAL_CONSTANTS } from "@/lib/constants/urls";
import {
  exchnageTokenFnValidation,
  getAccDetailsFnValidation,
} from "@/lib/validations/aurinko/schema";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { createServerActionProcedure, ZSAError } from "zsa";

const authUserProcedure = createServerActionProcedure()
  .output(
    z.object({
      user: z.custom<Awaited<ReturnType<typeof currentUser>>>(),
    }),
  )
  .handler(async () => {
    const user = await currentUser();
    if (!user) throw new ZSAError("NOT_AUTHORIZED", "Unauthrorized user!");
    return { user };
  });

export const getAurinkoAuthURL = authUserProcedure
  .createServerAction()
  .input(
    z.object({
      serviceType: z.enum(["Google", "Office365"]),
    }),
  )
  .output(
    z.object({
      url: z.string(),
    }),
  )
  .handler(async ({ input: { serviceType } }) => {
    const { aurinko } = GLOBAL_CONSTANTS;

    const params = new URLSearchParams({
      clientId: env.AURINKO_CLIENT_ID,
      serviceType,
      scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
      responseType: "code",
      returnUrl: `${env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    });

    return {
      url: `${aurinko.AURINKO_AUTH_URL}?${params.toString()}`,
    };
  });

export const exchangeAuthCodeWithToken = authUserProcedure
  .createServerAction()
  .input(
    z.object({
      code: z.string(),
    }),
  )
  .output(exchnageTokenFnValidation)
  .handler(async ({ input: { code } }) => {
    const { aurinko } = GLOBAL_CONSTANTS;

    try {
      const res = await fetch(`${aurinko.AURINKO_TOKEN_EXCHANGE_URL}/${code}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${env.AURINKO_CLIENT_ID}:${env.AURINKO_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const responseText = await res.text();
      const data = JSON.parse(responseText) as z.infer<
        typeof exchnageTokenFnValidation
      >;
      return data;
    } catch (err) {
      console.error("Error details:", err);
      throw new ZSAError(
        "ERROR",
        err instanceof Error ? err.message : "Unknown error",
      );
    }
  });

export const getAccountDetails = authUserProcedure
  .createServerAction()
  .input(
    z.object({
      token: z.string(),
    }),
  )
  .output(getAccDetailsFnValidation)
  .handler(async ({ input: { token } }) => {
    const { aurinko } = GLOBAL_CONSTANTS;

    try {
      const res = await fetch(`${aurinko.AURINKO_GET_ACCOUNT_DETAILS_URL}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const responseText = await res.text();
      const data = JSON.parse(responseText) as z.infer<
        typeof getAccDetailsFnValidation
      >;
      return data;
    } catch (err) {
      console.error(err);
      throw new ZSAError("ERROR");
    }
  });
