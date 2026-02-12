// GENERAL ACCESS. TYPESAFETY FOR NORMALIZING DATA BEFORE FORMAT (STRINGIFY ALL VALUES) //
export type TypeRawData = Record<string, string>;
// END //

// SIDEBAR NAVLIST START //
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
// SIDEBAR NAVLIST END //

// GEO START //
export type TypeSchedulesGeo = Record<string, Schedule>;

export type TypeScheduleGeo = {
  week: string;
  in_out: InOut;
};

export type TypeInOutGeo = {
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

export type TypeAttendanceCardGeo = {
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
  schedules: TypeSchedulesGeo[];
  employeeSignature: string | undefined;
};

// FETCH EMPLOYEE FOR DYNAMIC ROUTE START //
export type TypeEmployeeWorkData = Awaited<ReturnType<typeof getUserWorkData>>;

export type TypeUserWorkData = {
  id: string;
  employeeId: string;
  data: JSON[];
} | null;
// FETCH EMPLOYEE FOR DYNAMIC ROUTE END //

// PILA START //
export type TypeValuesPila = {
  values: string | null;
};

export type TypeSchedulesPila = Record<string, TypeValuesPila>;

export type TypeAttendanceCardPila = {
  id: string;
  name: string;
  role: string;
  schedules: TypeSchedulesPila[];
};
// PILA END //

export type TypeExcelFileData<T> = T;
