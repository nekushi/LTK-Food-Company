import { NextResponse } from "next/server";
import { setDeliveryStatus } from "@/dal/inventory/get-requested-items";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemIds, deliveryStatus } = body as {
      itemIds: string[];
      deliveryStatus: string;
    };
    if (!Array.isArray(itemIds) || typeof deliveryStatus !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid itemIds or deliveryStatus" },
        { status: 400 },
      );
    }
    const result = await setDeliveryStatus(itemIds, deliveryStatus);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("set-delivery-status", error);
    return NextResponse.json(
      { success: false, message: "Failed to update delivery status" },
      { status: 500 },
    );
  }
}
