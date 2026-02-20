import prisma from "@/lib/db";

export type LocationEntry = {
  id: string;
  lat: number;
  lng: number;
  createdAt: Date;
};

export async function getLocations(): Promise<LocationEntry[]> {
  const rows = await prisma.location.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    createdAt: r.createdAt,
  }));
}

export async function createLocation(lat: number, lng: number): Promise<LocationEntry> {
  const row = await prisma.location.create({
    data: { lat, lng },
  });
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.createdAt,
  };
}

export async function deleteAllLocations(): Promise<number> {
  const result = await prisma.location.deleteMany({});
  return result.count;
}
