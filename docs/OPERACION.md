# Operación y activación

## Antes del primer servicio

- Recibir la carta vigente y los precios por sucursal. Los productos de demo son ilustrativos y nunca se importan a producción automáticamente.
- Confirmar el **correo exacto** del primer administrador. No se deduce de la cuenta de GitHub, Supabase, Netlify o del nombre de una persona.
- Registrar esa cuenta en `/acceso`, verificar su email y asignarle el rol desde una sesión autorizada en Supabase. El script `supabase/bootstrap-staff.sql` exige reemplazar explícitamente el correo, confirma una única cuenta verificada y no se ejecuta automáticamente.
- Asignar a cada empleado su rol y sucursal: `waiter` (salón), `kitchen` (cocina/barra), `cashier` (caja). Solo `admin` puede operar ambas sucursales. Las cuentas nuevas son clientes sin acceso interno.
- Configurar URL del sitio y redirecciones de Supabase Auth para el dominio publicado: `/club` y `/recuperar`. El correo de confirmación debe apuntar al dominio correcto. No desactivar confirmación de email para evitar este paso.
- Validar recetas y videos propios/aprobados por cocina; cargar imágenes mediante su URL HTTPS. La carga directa de archivos a Storage queda pendiente.
- Revisar las mesas reales, imprimir sus QR y hacer un servicio de prueba acompañado antes de habilitar pedidos digitales.
- Confirmar alias/CBU oficial con Porter. La app solicita la referencia y caja debe verificar la acreditación antes de registrar la transferencia.

## Caja

Efectivo esperado = fondo inicial + cobros confirmados en efectivo + ingresos adicionales − egresos. Las transferencias se registran aparte y no se suman al efectivo físico. El servidor evita cobros que superen el saldo y duplicaciones por reintento. Cada cobro identifica al empleado que lo validó. El cierre conserva esperado, declarado, diferencia, fecha y responsable.

Los tickets son **constancias internas, no facturas fiscales**. No hay pagos automáticos reales ni datos de tarjetas en esta versión.

No se puede anular un pedido entregado o con cobros. Las devoluciones, reembolsos, división detallada por comensal y facturación fiscal requieren su circuito específico antes de habilitarlos.

## Integraciones pendientes

| Integración         | Implementado                                                                     | Falta para operación completa                                                                                                |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Google Maps         | Direcciones, búsqueda de sucursal, mapa y rutas desde dirección o GPS voluntario | Validar pin/Place ID exacto y recorridos de colectivos                                                                       |
| Google reviews      | Valoración y cantidad consultadas, fecha y enlace a fuente                       | Places API/autorización para autores, fotos y reseñas actualizadas; no se inventan testimonios                               |
| Uber                | Acceso externo para consultar viaje                                              | Destino precargado mediante integración verificada y cotización; la app no estima precios ficticios                          |
| Mercado Pago        | Preferencias de pago y estado pendiente visibles                                 | Credenciales del comercio en servidor, checkout, webhooks verificados e idempotentes, conciliación/reembolsos                |
| Facturación         | Caja, exportación CSV y ticket interno                                           | Datos fiscales del comercio e integración con el proveedor correspondiente                                                   |
| Club existente      | Cuenta, puntos por consumo acreditado, premios/canjes, solicitudes de reserva    | Confirmar reglas reales, migrar socios/saldos con trazabilidad, validar uso de cupones y evitar reutilización al entregarlos |
| Pedidos anticipados | Base común y solicitudes de reserva de mesa                                      | Disponibilidad/horarios, prepago, reserva de productos y cancelaciones                                                       |

El canje de puntos emite un código; **no descuenta automáticamente un pedido**. El uso/entrega de ese beneficio debe validarse por el personal hasta implementar el circuito de cupones. No activar premios que impliquen descuento automático mientras ese circuito no esté integrado.

Los dispositivos deben tener conexión. Los pedidos reales no se encolan offline. Ante fallas se informa que los datos pueden estar desactualizados; los importes finales y transiciones se vuelven a validar en PostgreSQL.

## QR y sesiones

El QR impreso identifica la mesa; el personal abre una visita nueva. Cada dispositivo obtiene un token aleatorio privado y solo ve los pedidos creados con ese token. No se envía el token privado por enlaces. Cerrar la mesa invalida nuevas compras de esa visita. Una fotografía del QR puede compartirse: el control de apertura y la confirmación de salón limitan el abuso, pero no prueban presencia física. Para una operación de mayor exigencia agregar código de visita rotativo y límites por dispositivo/IP.

Las 12 mesas por sucursal son una configuración inicial, pendiente de comparación con el salón real. Los roles y mesas se administran en Supabase en esta primera entrega; no hay un panel de altas de empleados todavía.
