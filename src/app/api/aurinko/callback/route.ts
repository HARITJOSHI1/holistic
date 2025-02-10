import { env } from "@/env";
import {
  exchangeAuthCodeWithToken,
  getAccountDetails,
} from "@/lib/actions/aurinko/base";
import { unexposeSensitiveData } from "@/lib/utils";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // get auth code from aurinko
  const params = req.nextUrl.searchParams;
  if (params.get("status") != "success")
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 },
    );

  const code = params.get("code");
  if (!code)
    return NextResponse.json({ message: "No code provided" }, { status: 400 });

  // once code is set exchnage it for accessToken to get info about user
  const [token, err] = await exchangeAuthCodeWithToken({ code });
  if (err || !token)
    return NextResponse.json(
      { message: "Failed to fetch the token" },
      { status: 400 },
    );

  // ask access to the user external account
  const [accDetails, error] = await getAccountDetails({
    token: token.accessToken,
  });
  if (error || !accDetails)
    return NextResponse.json(
      { message: "Failed to fetch account details" },
      { status: 400 },
    );

  // set accessToken in a cookie
  const res = new NextResponse();

  res.cookies.set("AURINKO_ACCESS_TOKEN", token.accessToken, {
    sameSite: true,
    httpOnly: env.NODE_ENV === "production",
    secure: env.NODE_ENV === "production",
  });

  // add account details to db
  const account = await db.account.upsert({
    where: {
      accountId: token.accountId.toString(),
    },
    update: {
      accountName: accDetails.name,
      linkedAccountAddress: accDetails.email,
    },
    create: {
      accountName: accDetails.name,
      linkedAccountAddress: accDetails.email,
      accountId: token.accountId.toString(),
      userId
    },
  });

  return NextResponse.json(
    {
      message: "Account added successfully",
      data: unexposeSensitiveData(account, ["userId", "id"]),
    },
    { status: 200 },
  );
};
