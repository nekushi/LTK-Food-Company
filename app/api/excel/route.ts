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
    const worksheet = workbook.Sheets[sheetName];

    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const columnMapping: Record<string, string> = {
      __EMPTY: "e0",
      __EMPTY_1: "e1",
      __EMPTY_2: "e2",
      __EMPTY_3: "e3",
      __EMPTY_4: "e4",
      __EMPTY_5: "e5",
      __EMPTY_6: "e6",
      __EMPTY_7: "e7",
      __EMPTY_8: "e8",
      __EMPTY_9: "e9",
      __EMPTY_10: "e10",
      __EMPTY_11: "e11",
      __EMPTY_12: "e12",
      __EMPTY_13: "e13",
      __EMPTY_14: "e14",
      __EMPTY_15: "e15",
      __EMPTY_16: "e16",
    };

    const normalizedData = rawData.map((row: any) => {
      const newRow: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        newRow[columnMapping[key] || key] = value;
      });
      return newRow;
    });

    // const attendanceCard: TypeNamedAttendanceCard = {};
    const attendanceCard: TypeAttendanceCard[] = [];

    const CHUNK_SIZE = 23;
    for (let i = 0, j = 0; i < normalizedData.length; i += CHUNK_SIZE, j += 1) {
      const cardSet = normalizedData.slice(i, i + CHUNK_SIZE);
      // attendanceCard.push(cardSet[1]); // [6]["e0"] == "10.01"
      // console.log(cardSet[0]);
      // attendanceCard[i].header = cardSet[0]["e0"];
      // attendanceCard[i].companyName = cardSet[1]["e0"];

      const data: TypeAttendanceCard = {
        header: cardSet[0]["e0"],
        companyName: cardSet[1]["e0"].split(":").at(-1),
        name: cardSet[1]["e4"].split(":").at(-1),
        id: cardSet[1]["e7"].split(":").at(-1),
        depart: cardSet[1]["e9"].split(":").at(-1),
        dateRange: cardSet[1]["e12"].split(":").at(-1),
        workingDays: cardSet[2]["e0"].split(":").at(-1),
        attendanceDays: cardSet[2]["e3"].split(":").at(-1),
        lateNum: cardSet[2]["e6"].split(":").at(-1),
        earlyNum: cardSet[2]["e8"].split(":").at(-1),
        absencesDays: cardSet[2]["e10"].split(":").at(-1),
        overtimeHours: cardSet[2]["e13"].split(":").at(-1),
        sickHours: cardSet[3]["e0"].split(":").at(-1),
        leaveHours: cardSet[3]["e3"].split(":").at(-1),
        dailySalary: cardSet[3]["e5"].split(":").at(-1),
        overtimePay: cardSet[3]["e7"].split(":").at(-1),
        allowances: cardSet[3]["e9"].split(":").at(-1),
        charges: cardSet[3]["e11"].split(":").at(-1),
        realPay: cardSet[3]["e13"].split("：").at(-1),
        deviceId: cardSet[4]["e0"].split(":").at(-1),
        schedules: [
          {
            [cardSet[6]["e0"]]: {
              week: cardSet[6]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[6]["e2"],
                  morning_out: cardSet[6]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[6]["e4"],
                  afternoon_out: cardSet[6]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[6]["e6"],
                  overtime_out: cardSet[6]["e7"],
                },
              },
            },
          },
          {
            [cardSet[7]["e0"]]: {
              week: cardSet[7]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[7]["e2"],
                  morning_out: cardSet[7]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[7]["e4"],
                  afternoon_out: cardSet[7]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[7]["e6"],
                  overtime_out: cardSet[7]["e7"],
                },
              },
            },
          },
          {
            [cardSet[8]["e0"]]: {
              week: cardSet[8]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[8]["e2"],
                  morning_out: cardSet[8]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[8]["e4"],
                  afternoon_out: cardSet[8]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[8]["e6"],
                  overtime_out: cardSet[8]["e7"],
                },
              },
            },
          },
          {
            [cardSet[9]["e0"]]: {
              week: cardSet[9]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[9]["e2"],
                  morning_out: cardSet[9]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[9]["e4"],
                  afternoon_out: cardSet[9]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[9]["e6"],
                  overtime_out: cardSet[9]["e7"],
                },
              },
            },
          },
          {
            [cardSet[10]["e0"]]: {
              week: cardSet[10]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[10]["e2"],
                  morning_out: cardSet[10]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[10]["e4"],
                  afternoon_out: cardSet[10]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[10]["e6"],
                  overtime_out: cardSet[10]["e7"],
                },
              },
            },
          },
          {
            [cardSet[11]["e0"]]: {
              week: cardSet[11]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[11]["e2"],
                  morning_out: cardSet[11]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[11]["e4"],
                  afternoon_out: cardSet[11]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[11]["e6"],
                  overtime_out: cardSet[11]["e7"],
                },
              },
            },
          },
          {
            [cardSet[12]["e0"]]: {
              week: cardSet[12]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[12]["e2"],
                  morning_out: cardSet[12]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[12]["e4"],
                  afternoon_out: cardSet[12]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[12]["e6"],
                  overtime_out: cardSet[12]["e7"],
                },
              },
            },
          },
          {
            [cardSet[13]["e0"]]: {
              week: cardSet[13]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[13]["e2"],
                  morning_out: cardSet[13]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[13]["e4"],
                  afternoon_out: cardSet[13]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[13]["e6"],
                  overtime_out: cardSet[13]["e7"],
                },
              },
            },
          },
          {
            [cardSet[14]["e0"]]: {
              week: cardSet[14]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[14]["e2"],
                  morning_out: cardSet[14]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[14]["e4"],
                  afternoon_out: cardSet[14]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[14]["e6"],
                  overtime_out: cardSet[14]["e7"],
                },
              },
            },
          },
          {
            [cardSet[15]["e0"]]: {
              week: cardSet[15]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[15]["e2"],
                  morning_out: cardSet[15]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[15]["e4"],
                  afternoon_out: cardSet[15]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[15]["e6"],
                  overtime_out: cardSet[15]["e7"],
                },
              },
            },
          },
          {
            [cardSet[16]["e0"]]: {
              week: cardSet[16]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[16]["e2"],
                  morning_out: cardSet[16]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[16]["e4"],
                  afternoon_out: cardSet[16]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[16]["e6"],
                  overtime_out: cardSet[16]["e7"],
                },
              },
            },
          },
          {
            [cardSet[17]["e0"]]: {
              week: cardSet[17]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[17]["e2"],
                  morning_out: cardSet[17]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[17]["e4"],
                  afternoon_out: cardSet[17]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[17]["e6"],
                  overtime_out: cardSet[17]["e7"],
                },
              },
            },
          },
          {
            [cardSet[18]["e0"]]: {
              week: cardSet[18]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[18]["e2"],
                  morning_out: cardSet[18]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[18]["e4"],
                  afternoon_out: cardSet[18]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[18]["e6"],
                  overtime_out: cardSet[18]["e7"],
                },
              },
            },
          },
          {
            [cardSet[19]["e0"]]: {
              week: cardSet[19]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[19]["e2"],
                  morning_out: cardSet[19]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[19]["e4"],
                  afternoon_out: cardSet[19]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[19]["e6"],
                  overtime_out: cardSet[19]["e7"],
                },
              },
            },
          },
          {
            [cardSet[20]["e0"]]: {
              week: cardSet[20]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[20]["e2"],
                  morning_out: cardSet[20]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[20]["e4"],
                  afternoon_out: cardSet[20]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[20]["e6"],
                  overtime_out: cardSet[20]["e7"],
                },
              },
            },
          },
          {
            [cardSet[21]["e0"]]: {
              week: cardSet[21]["e1"],
              in_out: {
                morning: {
                  morning_in: cardSet[21]["e2"],
                  morning_out: cardSet[21]["e3"],
                },
                afternoon: {
                  afternoon_in: cardSet[21]["e4"],
                  afternoon_out: cardSet[21]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[21]["e6"],
                  overtime_out: cardSet[21]["e7"],
                },
              },
            },
          },
          {
            [cardSet[6]["e8"]]: {
              week: cardSet[6]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[6]["e10"],
                  morning_out: cardSet[6]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[6]["e4"],
                  afternoon_out: cardSet[6]["e5"],
                },
                overtime: {
                  overtime_in: cardSet[6]["e6"],
                  overtime_out: cardSet[6]["e7"],
                },
              },
            },
          },
          {
            [cardSet[7]["e8"]]: {
              week: cardSet[7]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[7]["e10"],
                  morning_out: cardSet[7]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[7]["e12"],
                  afternoon_out: cardSet[7]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[7]["e14"],
                  overtime_out: cardSet[7]["e7"],
                },
              },
            },
          },
          {
            [cardSet[8]["e8"]]: {
              week: cardSet[8]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[8]["e10"],
                  morning_out: cardSet[8]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[8]["e12"],
                  afternoon_out: cardSet[8]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[8]["e14"],
                  overtime_out: cardSet[8]["e7"],
                },
              },
            },
          },
          {
            [cardSet[9]["e8"]]: {
              week: cardSet[9]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[9]["e10"],
                  morning_out: cardSet[9]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[9]["e12"],
                  afternoon_out: cardSet[9]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[9]["e14"],
                  overtime_out: cardSet[9]["e15"],
                },
              },
            },
          },
          {
            [cardSet[10]["e8"]]: {
              week: cardSet[10]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[10]["e10"],
                  morning_out: cardSet[10]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[10]["e12"],
                  afternoon_out: cardSet[10]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[10]["e14"],
                  overtime_out: cardSet[10]["e15"],
                },
              },
            },
          },
          {
            [cardSet[11]["e8"]]: {
              week: cardSet[11]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[11]["e10"],
                  morning_out: cardSet[11]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[11]["e12"],
                  afternoon_out: cardSet[11]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[11]["e14"],
                  overtime_out: cardSet[11]["e15"],
                },
              },
            },
          },
          {
            [cardSet[12]["e8"]]: {
              week: cardSet[12]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[12]["e10"],
                  morning_out: cardSet[12]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[12]["e12"],
                  afternoon_out: cardSet[12]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[12]["e14"],
                  overtime_out: cardSet[12]["e15"],
                },
              },
            },
          },
          {
            [cardSet[13]["e8"]]: {
              week: cardSet[13]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[13]["e10"],
                  morning_out: cardSet[13]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[13]["e12"],
                  afternoon_out: cardSet[13]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[13]["e14"],
                  overtime_out: cardSet[13]["e15"],
                },
              },
            },
          },
          {
            [cardSet[14]["e8"]]: {
              week: cardSet[14]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[14]["e10"],
                  morning_out: cardSet[14]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[14]["e12"],
                  afternoon_out: cardSet[14]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[14]["e14"],
                  overtime_out: cardSet[14]["e15"],
                },
              },
            },
          },
          {
            [cardSet[15]["e8"]]: {
              week: cardSet[15]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[15]["e10"],
                  morning_out: cardSet[15]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[15]["e12"],
                  afternoon_out: cardSet[15]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[15]["e14"],
                  overtime_out: cardSet[15]["e15"],
                },
              },
            },
          },
          {
            [cardSet[16]["e8"]]: {
              week: cardSet[16]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[16]["e10"],
                  morning_out: cardSet[16]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[16]["e12"],
                  afternoon_out: cardSet[16]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[16]["e14"],
                  overtime_out: cardSet[16]["e15"],
                },
              },
            },
          },
          {
            [cardSet[17]["e8"]]: {
              week: cardSet[17]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[17]["e10"],
                  morning_out: cardSet[17]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[17]["e12"],
                  afternoon_out: cardSet[17]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[17]["e14"],
                  overtime_out: cardSet[17]["e15"],
                },
              },
            },
          },
          {
            [cardSet[18]["e8"]]: {
              week: cardSet[18]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[18]["e10"],
                  morning_out: cardSet[18]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[18]["e12"],
                  afternoon_out: cardSet[18]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[18]["e14"],
                  overtime_out: cardSet[18]["e15"],
                },
              },
            },
          },
          {
            [cardSet[19]["e8"]]: {
              week: cardSet[19]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[19]["e10"],
                  morning_out: cardSet[19]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[19]["e12"],
                  afternoon_out: cardSet[19]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[19]["e14"],
                  overtime_out: cardSet[19]["e15"],
                },
              },
            },
          },
          {
            [cardSet[20]["e8"]]: {
              week: cardSet[20]["e9"],
              in_out: {
                morning: {
                  morning_in: cardSet[20]["e10"],
                  morning_out: cardSet[20]["e11"],
                },
                afternoon: {
                  afternoon_in: cardSet[20]["e12"],
                  afternoon_out: cardSet[20]["e13"],
                },
                overtime: {
                  overtime_in: cardSet[20]["e14"],
                  overtime_out: cardSet[20]["e15"],
                },
              },
            },
          },
        ],
        employeeSignature: cardSet[22]["e12"].split(":").at(-1),
      };

      // attendanceCard[cardSet[1]["e7"].split(":").at(-1)] = data; // id: { ... } || "e4" for name as key
      attendanceCard.push(data);

      // // break;
      // if (i == 2 * 23) break;
    }

    // return NextResponse.json(attendanceCard);
    return NextResponse.json(attendanceCard);
  } catch (err) {
    console.error("Excel parsing error:", err);
    return NextResponse.json(
      { error: "Failed to parse Excel file" },
      { status: 500 },
    );
  }
}

// type TypeSchedules = Record<string, Schedule>;

// type Schedule = {
//   week: string;
//   in_out: InOut;
// };

// type InOut = {
//   morning: {
//     morning_in: number;
//     morning_out: number;
//   };
//   afternoon: {
//     afternoon_in: number;
//     afternoon_out: number;
//   };
//   overtime: {
//     overtime_in: number;
//     overtime_out: number;
//   };
// };

// type TypeAttendanceCard = {
//   header: string;
//   companyName: string;
//   name: string;
//   id: string;
//   depart: string;
//   dateRange: string;
//   workingDays: number;
//   attendanceDays: number;
//   lateNum: number;
//   earlyNum: number;
//   absencesDays: number;
//   overtimeHours: number;
//   sickHours: number;
//   leaveHours: number;
//   dailySalary: number;
//   overtimePay: number;
//   allowances: number;
//   charges: number;
//   realPay: number;
//   deviceId: number;
//   schedules: TypeSchedules[];
//   employeeSignature: boolean;
// };

// type TypeNamedAttendanceCard = Record<string, TypeAttendanceCard>;
