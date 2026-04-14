import React from 'react';
import FooterTwo from '../../components/Footer/FooterTwo';
import HeaderFive from '../../components/Header/HeaderFive';

import Logo from '../../assets/img/logo/logo-white-2.png';
import ClientOffersWrapper from './Clientofferswrapper';

const Inspector = ({
    inspectorNombre = "María García López",
    inspectorEmail  = "maria.garcia@email.com",
    inspectorId = "12",
    tenantId = "1",
  }) => {
  return (
    <>

      <ClientOffersWrapper
        inspectorNombre={inspectorNombre}
        inspectorEmail={inspectorEmail}
        inspectorId={inspectorId}
        tenantId={tenantId}
      />

      
    </>
  );
}; export default Inspector;