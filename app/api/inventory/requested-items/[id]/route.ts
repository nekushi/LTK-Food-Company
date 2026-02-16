"use server";

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = params;

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

