export type TypeSchedules = Record<string, Schedule>;

export type Schedule = {
  week: string;
  in_out: InOut;
};

export type InOut = {
  morning: {
    morning_in: string | null;
    morning_out: string | null;
  };
  afternoon: {
    afternoon_in: string | null;
    afternoon_out: string | null;
  };
  overtime: {
    overtime_in: string | null;
    overtime_out: string | null;
  };
};

export type TypeAttendanceCard = {
  header: string | undefined;
  companyName: string | undefined;
  name: string | undefined;
  id: string | undefined;
  depart: string | undefined;
  dateRange: string | undefined;
  workingDays: string | undefined;
  attendanceDays: string | undefined;
  lateNum: string | undefined;
  earlyNum: string | undefined;
  absencesDays: string | undefined;
  overtimeHours: string | undefined;
  sickHours: string | undefined;
  leaveHours: string | undefined;
  dailySalary: string | undefined;
  overtimePay: string | undefined;
  allowances: string | undefined;
  charges: string | undefined;
  realPay: string | undefined;
  deviceId: string | undefined;
  schedules: TypeSchedules[];
  employeeSignature: string | undefined;
};
// export type TypeAttendanceCard = {
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

export type TypeNamedAttendanceCard = Record<string, TypeAttendanceCard>;

export type TypeOriginalGeoData = {
  e0: string;
  e1: string;
  e2: string;
  e3: string;
  e4: string;
  e5: string;
  e6: string;
  e7: string;
  e8: string;
  e9: string;
  e10: string;
  e11: string;
  e12: string;
  e13: string;
  e14: string;
  e15: string;
  e16: string;
};

export type TypeNavList = {
  name: string;
  href: string;
  icon: JSX.Element;
};

export type TypeUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TypeEmployeeWorkData = Awaited<ReturnType<typeof getUserWorkData>>;

export type TypeUserWorkData = {
  id: string;
  employeeId: string;
  data: JSON[];
} | null;

// export type TypeRawData = Record<string, string | number | null>;
export type TypeRawData = Record<string, string>;
