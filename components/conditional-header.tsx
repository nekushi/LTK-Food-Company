"use client";

import { usePathname } from "next/navigation";
import Header from "@/template/header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return <Header />;
}
