import { NextResponse } from "next/server";
import {
  getLocations,
  createLocation,
  deleteAllLocations,
} from "@/dal/location";

export async function GET() {
  try {
    const locations = await getLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error("GET /api/location", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lng } = body as { lat?: number; lng?: number };
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "lat and lng must be numbers" },
        { status: 400 },
      );
    }
    const location = await createLocation(lat, lng);
    return NextResponse.json(location);
  } catch (error) {
    console.error("POST /api/location", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const count = await deleteAllLocations();
    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error("DELETE /api/location", error);
    return NextResponse.json(
      { error: "Failed to delete locations" },
      { status: 500 },
    );
  }
}
