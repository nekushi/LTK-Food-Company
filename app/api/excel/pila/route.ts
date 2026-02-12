import { TypeAttendanceCard } from "@/index";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    // const worksheet = workbook.Sheets[sheetName];
    const worksheet1 = workbook.Sheets[sheetName];
    const worksheet2 = workbook.Sheets["Attend. Logs"];

    const rawDataSheetName = XLSX.utils.sheet_to_json(worksheet1, {
      defval: null,
      blankrows: true,
    });
    // const rawDataWorkSheet = XLSX.utils.sheet_to_json(worksheet2, {
    //   defval: null,
    // });

    const trimmedData = rawDataSheetName.filter((row: any) =>
      Object.values(row).some((value) => value !== null),
    );

    const columnMapping: Record<string, string> = {
      "Attend. Logs": "e0",
      __EMPTY: "e1",
      __EMPTY_1: "e2",
      __EMPTY_2: "e3",
      __EMPTY_3: "e4",
      __EMPTY_4: "e5",
      __EMPTY_5: "e6",
      __EMPTY_6: "e7",
      __EMPTY_7: "e8",
      __EMPTY_8: "e9",
      __EMPTY_9: "e10",
      __EMPTY_10: "e11",
      __EMPTY_11: "e12",
      __EMPTY_12: "e13",
      __EMPTY_13: "e14",
      __EMPTY_14: "e15",
      __EMPTY_15: "e16",
      __EMPTY_16: "e17",
      __EMPTY_17: "e18",
      __EMPTY_18: "e19",
      __EMPTY_19: "e20",
      __EMPTY_20: "e21",
      __EMPTY_21: "e22",
      __EMPTY_22: "e23",
      __EMPTY_23: "e24",
      __EMPTY_24: "e25",
      __EMPTY_25: "e26",
      __EMPTY_26: "e27",
      __EMPTY_27: "e28",
      __EMPTY_28: "e29",
      __EMPTY_29: "e30",
      // "Attend. Logs": "e0",
      // __EMPTY: "e0",
      // __EMPTY_1: "e1",
      // __EMPTY_2: "e2",
      // __EMPTY_3: "e3",
      // __EMPTY_4: "e4",
      // __EMPTY_5: "e5",
      // __EMPTY_6: "e6",
      // __EMPTY_7: "e7",
      // __EMPTY_8: "e8",
      // __EMPTY_9: "e9",
      // __EMPTY_10: "e10",
      // __EMPTY_11: "e11",
      // __EMPTY_12: "e12",
      // __EMPTY_13: "e13",
      // __EMPTY_14: "e14",
      // __EMPTY_15: "e15",
      // __EMPTY_16: "e16",
      // __EMPTY_17: "e17",
      // __EMPTY_18: "e18",
      // __EMPTY_19: "e19",
      // __EMPTY_20: "e20",
      // __EMPTY_21: "e21",
      // __EMPTY_22: "e22",
      // __EMPTY_23: "e23",
      // __EMPTY_24: "e24",
      // __EMPTY_25: "e25",
      // __EMPTY_26: "e26",
      // __EMPTY_27: "e27",
      // __EMPTY_28: "e28",
      // __EMPTY_29: "e29",
    };

    // const normalizedData = rawData.map((row: any) => {
    const normalizedData = trimmedData.map((row: any) => {
      const newRow: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        newRow[columnMapping[key] || key] = value;
      });
      return newRow;
    });

    // return NextResponse.json(normalizedData)
    // if (rawDataWorkSheet.length === 0) {
    return NextResponse.json(normalizedData);
    // }
    // return NextResponse.json(rawDataWorkSheet);
  } catch (err) {
    console.error("Excel parsing error:", err);
    return NextResponse.json(
      { error: "Failed to parse Excel file" },
      { status: 500 },
    );
  }
}
