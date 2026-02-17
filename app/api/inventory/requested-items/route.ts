"use server";

import { NextResponse } from "next/server";
import { getRequestedItemsWithStore } from "@/dal/inventory/get-requested-items";

export async function GET() {
  try {
    const items = await getRequestedItemsWithStore();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Failed to load requested items", error);
    return NextResponse.json(
      { success: false, error: "Failed to load requested items" },
      { status: 500 },
    );
  }
}

