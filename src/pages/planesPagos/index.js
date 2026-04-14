import PlanesPago from './components/planesPagos';

const PlanesPagos = ({
    clienteNombre = "María García López",
    clienteEmail  = "maria.garcia@email.com",
    clienteId = "12",
    tenantId = "1",
  }) => {
  return (
    <>

      <PlanesPago
      />

      
    </>
  );
}; export default PlanesPagos;