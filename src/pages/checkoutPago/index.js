import CheckoutPagos from './components/CheckoutPago';

const CheckoutPago = ({
    clienteNombre = "María García López",
    clienteEmail  = "maria.garcia@email.com",
    clienteId = "12",
    tenantId = "1",
  }) => {
  return (
    <>

      <CheckoutPagos
      />

      
    </>
  );
}; export default CheckoutPago;