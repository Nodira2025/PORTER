# Validación de la primera entrega

Fecha: 25/09/2026 Argentina (26/09 UTC).

## Automatizada

- TypeScript estricto y build Vite: aprobado.
- Vitest: 5 pruebas aprobadas (precios/cantidades, cálculo monetario, disponibilidad/precio por sucursal, URLs de imágenes y YouTube).
- `supabase/tests/test_operations.sql` ejecutado en el proyecto correcto después de aplicar la migración autorizada. Resultado: `PASS - all operational assertions completed; test records rolled back`.

La prueba SQL crea fixtures temporales en una subtransacción y los revierte deliberadamente, incluidos usuarios sintéticos. Se verificaron:

- Precio del servidor frente a importe adulterado por cliente; precio específico de sucursal.
- Reintento del mismo pedido y cobro sin duplicación.
- Aislamiento de sesiones invitadas, personal, cocina y otra sucursal.
- Cantidad inválida y funciones no permitidas según rol.
- Confirmación, preparación de ítems, listo, entrega.
- Pago parcial, rechazo de sobrepago, transferencia validada.
- Acreditación de puntos una sola vez al completar el pago.
- Rechazo de cierre de mesa pendiente y de anulación con cobros.
- Arqueo: fondo 1.000 + efectivo 500 − egreso 100 = 1.400; transferencia excluida.
- Rechazo de compras después de cerrar la sesión de mesa.

Al terminar: 0 pedidos persistentes y 0 miembros de personal persistentes. No se dejaron ventas ni administradores de prueba.

## API publicada de Supabase

Con clave publicable: sucursales devuelven las dos sedes con pedidos desactivados. Productos, órdenes, recetas, caja y personal no exponen filas privadas al visitante. `guest_sessions` devuelve acceso denegado.

## Interfaz en navegador

Recorrido demo verificado: abrir mesa, pedido de bebida y burger con observación, confirmar, tomar preparación, abrir automáticamente receta, marcar ambos ítems listos, entregar, abrir caja con 1.000, cobrar 16.800, cerrar caja con 17.800 sin diferencia y cerrar mesa. El QR de una mesa cerrada rechaza el inicio. Un pedido posterior como comensal aparece en Mis pedidos sin mostrar el anterior del personal.

La demo guarda todo en este navegador, separada del proyecto Supabase. La prueba no simula aceptación de pagos externos ni emisión fiscal.

Portada, carta y panel se revisaron también con pantalla angosta: navegación móvil accesible y sin desborde horizontal del documento (ancho CSS observado 433 px, contenido 416 px). La captura en esa emulación falló por tiempo de espera del navegador; la revisión móvil se verificó mediante el árbol de accesibilidad y medidas del DOM. Las capturas de escritorio sí estuvieron disponibles.

## Límites de la validación

Publicación inicial verificada en `https://porter-brew-house-tucuman.netlify.app`: HTML, CSS y JS respondieron 200, el bundle apunta a `oeiomiobhpkujxhentbj`, la portada y carta real se abren, y la demo de equipo se inicia separada. Las URLs de Auth quedaron guardadas para ese dominio, `/club` y `/recuperar`. No se creó un usuario real para probar la recepción de correos; espera la identidad del administrador.

No se probó aún un turno con empleados reales, carta real, pagos Mercado Pago, reembolsos, facturación fiscal, hardware de impresión ni recuperación completa de backup. Se requiere piloto acompañado antes de habilitar ventas.
