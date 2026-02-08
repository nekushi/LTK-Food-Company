"use client";

import Link from "next/link";
import { addUser } from "@/dal/user";
import { useActionState, useState } from "react";

export default function LoginPage() {
  return (
    <div className="p-4">
      <div className="p-4">
        <p>This is login page.</p>
        <Link href={"/dashboard/"} className="border py-1 px-2 rounded">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
