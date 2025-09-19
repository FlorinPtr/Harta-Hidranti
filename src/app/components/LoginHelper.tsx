// 1. Define enum of operators
export enum Operator {
  ISU = "I.S.U.",
  APASERV_VJ = "Apaserv VJ",
}

// 2. Map usernames to {password, operator}
const credentials: Record<
  string,
  { password: string; operator: Operator }
> = {
  adminH: { password: "adminH123", operator: Operator.ISU },
  apaservVJ: { password: "apaservVJpass", operator: Operator.APASERV_VJ },
};

// 3. Login validator
export function isValidUser(username: string, password: string): boolean {
  const user = credentials[username];
  if (user && user.password === password) {
    // Save operator to localStorage
    localStorage.setItem("operator", user.operator);
    return true;
  }
  return false;
}
