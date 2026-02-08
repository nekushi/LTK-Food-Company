export type TypeSchedules = Record<string, Schedule>;

export type Schedule = {
  week: string;
  in_out: InOut;
};

export type InOut = {
  morning: {
    morning_in: number | null;
    morning_out: number | null;
  };
  afternoon: {
    afternoon_in: number | null;
    afternoon_out: number | null;
  };
  overtime: {
    overtime_in: number | null;
    overtime_out: number | null;
  };
};

export type TypeAttendanceCard = {
  header: string;
  companyName: string;
  name: string;
  id: string;
  depart: string;
  dateRange: string;
  workingDays: number;
  attendanceDays: number;
  lateNum: number;
  earlyNum: number;
  absencesDays: number;
  overtimeHours: number;
  sickHours: number;
  leaveHours: number;
  dailySalary: number;
  overtimePay: number;
  allowances: number;
  charges: number;
  realPay: number;
  deviceId: number;
  schedules: TypeSchedules[];
  employeeSignature: boolean;
};

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
