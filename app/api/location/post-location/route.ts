import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const receivedDataLocation = await req.json();

  console.log("Received:", receivedDataLocation);

  const data = await prisma.location.create({
    data: {
      lat: receivedDataLocation.lat,
      lng: receivedDataLocation.lng,
    },
  });

  console.log(`Data from supabase:`);
  console.log(data);

  return NextResponse.json({ success: true, data });
}
