export const getRedirectByRole = (rol) => {
  switch (rol) {
    case "SUPERADMIN":
      return "/admin-servicio";

    case "ADMIN_TENANT":
      return "/admin-empresa";

    case "ADMIN_LOGISTICA":
      return "/admin";

    case "DESPACHADOR":
      return "/despachador";

    case "INSPECTOR":
      return "/inspector";

    case "CONDUCTOR":
      return "/conductor";

    case "CLIENTE":
      return "/admin-usuario-final";

    default:
      return "/";
  }
};