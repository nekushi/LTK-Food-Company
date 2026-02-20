"use server";

import { NextResponse } from "next/server";
import { getStoreUsername } from "@/dal/inventory/get-requested-items";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { storeId } = await params;
    const username = await getStoreUsername(storeId);
    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error("Failed to get store username", error);
    return NextResponse.json(
      { success: false, error: "Failed to get store username" },
      { status: 500 },
    );
  }
}
