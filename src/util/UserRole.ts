export enum UserRole {
  ProjectManager = "PM",
  Comercial = "CM",
  DigitalLead = "DL",
  LeadPresales = "LP",
  GDM = "GDM",
  Admin = "ADMIN",
  Unauthorized = "UNAUTH",
}

export function readableRole(role: UserRole) {
  switch (role) {
    case UserRole.ProjectManager:
      return "Project Manager";
    case UserRole.Comercial:
      return "Comercial";
    case UserRole.DigitalLead:
      return "Digital Lead";
    case UserRole.LeadPresales:
      return "Lead Presales";
    case UserRole.GDM:
      return "GDM";
    case UserRole.Admin:
      return "Admin";
    case UserRole.Unauthorized:
      return "Unauthorized";
  }
}
