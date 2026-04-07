import React from 'react';
import FooterTwo from '../../components/Footer/FooterTwo';
import HeaderFive from '../../components/Header/HeaderFive';

import Logo from '../../assets/img/logo/logo-white-2.png';
import ClientOffersWrapper from './Clientofferswrapper';

const AdminUsuarioFinal = ({
    clienteNombre = "María García López",
    clienteEmail  = "maria.garcia@email.com",
    clienteId = "12",
    tenantId = "1",
  }) => {
  return (
    <>

      <ClientOffersWrapper
        clienteNombre={clienteNombre}
        clienteEmail={clienteEmail}
        clienteId={clienteId}
        tenantId={tenantId}
      />

      
    </>
  );
}; export default AdminUsuarioFinal;