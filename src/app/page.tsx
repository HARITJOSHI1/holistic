import LinkToAccBtn from "@/components/link-to-account-btn";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import React from "react";

const page = () => {
  return (
    <div>
      <LinkToAccBtn />
    </div>
  );
};

export default page;
