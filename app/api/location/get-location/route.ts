import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  console.log(`Fetching data`);

  const data = await prisma.location.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  console.log(`From get route:`);
  console.log(data);

  return NextResponse.json(data);
}
