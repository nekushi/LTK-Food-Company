export type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  employeeId: string;
  branch: string;
  dateHired: string;
  sss: string;
  pagIbig: string;
  philhealth: string;
  tin: string;
  contactNo: string;
  email: string;
  address: string;
};

export type EmployeeRow = Omit<
  EmployeeFormValues,
  "includeInPayroll" | "linkAttendanceCard"
> & {
  id: string;
  includeInPayroll: boolean;
  linkAttendanceCard: boolean;
};
