import { NextResponse } from "next/server";
import { getAdminStores } from "@/dal/admin/manage-branch";

export async function GET() {
  const result = await getAdminStores();
  return NextResponse.json(result);
}

