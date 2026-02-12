import { TypeAttendanceCardPila, TypeRawData } from "@/index";
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

    const rawDataSheetName: TypeRawData[] = XLSX.utils.sheet_to_json(
      worksheet1,
      {
        defval: null,
        blankrows: true,
      },
    );
    // const rawDataWorkSheet = XLSX.utils.sheet_to_json(worksheet2, {
    //   defval: null,
    // });

    // const trimmedData = rawDataSheetName.filter((row: any) =>
    //   Object.values(row).some((value) => value === null),
    // );

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
    };

    // const normalizedData = trimmedData.map((row: any) => {
    const normalizedData = rawDataSheetName.map((row: TypeRawData) => {
      const newRow: TypeRawData = {};
      Object.entries(row).forEach(([key, value]) => {
        newRow[columnMapping[key] || key] = value;
      });
      return newRow;
    });

    const normalizedDataFirstRow = normalizedData[1];
    const normalizedDataRestRow = normalizedData.slice(2);

    const pilaAttendanceCard: TypeAttendanceCardPila[] = [];

    const CHUNK_SIZE = 3;
    for (
      let i = 0, j = 0;
      i < normalizedDataRestRow.length;
      i += CHUNK_SIZE, j += 1
    ) {
      const cardSet = normalizedDataRestRow.slice(i, i + CHUNK_SIZE);

      const data: TypeAttendanceCardPila = {
        id: cardSet[1]["e2"],
        name: cardSet[1]["e9"],
        role: cardSet[1]["e17"],
        schedules: [
          {
            // 01
            [cardSet[0]["e0"]]: {
              values: cardSet[2]["e0"],
            },
          },
          {
            // 02
            [cardSet[0]["e1"]]: {
              values: cardSet[2]["e1"],
            },
          },
          {
            // 03
            [cardSet[0]["e2"]]: {
              values: cardSet[2]["e2"],
            },
          },
          {
            // 04
            [cardSet[0]["e3"]]: {
              values: cardSet[2]["e3"],
            },
          },
          {
            // 05
            [cardSet[0]["e4"]]: {
              values: cardSet[2]["e4"],
            },
          },
          {
            // 06
            [cardSet[0]["e5"]]: {
              values: cardSet[2]["e5"],
            },
          },
          {
            // 07
            [cardSet[0]["e6"]]: {
              values: cardSet[2]["e6"],
            },
          },
          {
            // 08
            [cardSet[0]["e7"]]: {
              values: cardSet[2]["e7"],
            },
          },
          {
            // 09
            [cardSet[0]["e8"]]: {
              values: cardSet[2]["e8"],
            },
          },
          {
            // 10
            [cardSet[0]["e9"]]: {
              values: cardSet[2]["e9"],
            },
          },
          {
            // 11
            [cardSet[0]["e10"]]: {
              values: cardSet[2]["e10"],
            },
          },
          {
            // 12
            [cardSet[0]["e11"]]: {
              values: cardSet[2]["e11"],
            },
          },
          {
            // 13
            [cardSet[0]["e12"]]: {
              values: cardSet[2]["e12"],
            },
          },
          {
            // 14
            [cardSet[0]["e13"]]: {
              values: cardSet[2]["e13"],
            },
          },
          {
            // 15
            [cardSet[0]["e14"]]: {
              values: cardSet[2]["e14"],
            },
          },
          {
            // 16
            [cardSet[0]["e15"]]: {
              values: cardSet[2]["e15"],
            },
          },
          {
            // 17
            [cardSet[0]["e16"]]: {
              values: cardSet[2]["e16"],
            },
          },
          {
            // 18
            [cardSet[0]["e17"]]: {
              values: cardSet[2]["e17"],
            },
          },
          {
            // 19
            [cardSet[0]["e18"]]: {
              values: cardSet[2]["e18"],
            },
          },
          {
            // 20
            [cardSet[0]["e19"]]: {
              values: cardSet[2]["e19"],
            },
          },
          {
            // 21
            [cardSet[0]["e20"]]: {
              values: cardSet[2]["e20"],
            },
          },
          {
            // 22
            [cardSet[0]["e21"]]: {
              values: cardSet[2]["e21"],
            },
          },
          {
            // 23
            [cardSet[0]["e22"]]: {
              values: cardSet[2]["e22"],
            },
          },
          {
            // 24
            [cardSet[0]["e23"]]: {
              values: cardSet[2]["e23"],
            },
          },
          {
            // 25
            [cardSet[0]["e24"]]: {
              values: cardSet[2]["e24"],
            },
          },
          {
            // 26
            [cardSet[0]["e25"]]: {
              values: cardSet[2]["e25"],
            },
          },
          {
            // 27
            [cardSet[0]["e26"]]: {
              values: cardSet[2]["e26"],
            },
          },
          {
            // 28
            [cardSet[0]["e27"]]: {
              values: cardSet[2]["e27"],
            },
          },
          {
            // 29
            [cardSet[0]["e28"]]: {
              values: cardSet[2]["e28"],
            },
          },
          {
            // 30
            [cardSet[0]["e29"]]: {
              values: cardSet[2]["e29"],
            },
          },
          {
            // 31
            [cardSet[0]["e30"]]: {
              values: cardSet[2]["e30"],
            },
          },
        ],
      };

      pilaAttendanceCard.push(data);
    }

    return NextResponse.json({
      date: `${normalizedDataFirstRow["e0"]}${normalizedDataFirstRow["e2"]}`,
      pilaAttendanceCard,
    });
  } catch (err) {
    console.error("Excel parsing error:", err);
    return NextResponse.json(
      { error: "Failed to parse Excel file" },
      { status: 500 },
    );
  }
}
