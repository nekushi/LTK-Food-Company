"use server";

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.requestedItems.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete requested item", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete requested item" },
      { status: 500 },
    );
  }
}

