"use client";

import { getAurinkoAuthURL } from "@/lib/actions/aurinko/base";
import React from "react";
import { useServerAction } from "zsa-react";
import { Button } from "./ui/button";

const LinkToAccBtn = () => {
  const { isPending, execute, data } = useServerAction(getAurinkoAuthURL);
  if (data?.url) window.location.href = data.url;

  return (
    <Button
      disabled={isPending}
      onClick={async () => {
        const [, err] = await execute({ serviceType: "Google" });
        if (err) return;
      }}
    >
      Link Account
    </Button>
  );
};

export default LinkToAccBtn;
