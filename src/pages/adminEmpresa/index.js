import React from "react";
import AdminEmpresaWrapper from "./AdminEmpresaWrapper";

const AdminEmpresa = ({
  empresaNombre = "Recicla Tech S.R.L.",
  adminNombre = "Carlos Mendoza",
  adminEmail = "admin@recicla.com",
  tenantId = "1",
}) => {
  return (
    <AdminEmpresaWrapper
      empresaNombre={empresaNombre}
      adminNombre={adminNombre}
      adminEmail={adminEmail}
      tenantId={tenantId}
    />
  );
};

export default AdminEmpresa;