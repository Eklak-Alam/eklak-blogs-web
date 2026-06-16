/**
 * Centralized Role-Based Routing Logic
 * This ensures that redirection is consistent across Login, Register, and Session Restoration.
 */
export const getRedirectPath = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "AUTHOR":
      return "/author/dashboard";
    case "WRITER":
      return "/writer/dashboard";
    case "USER":
    default:
      return "/dashboard";
  }
};
