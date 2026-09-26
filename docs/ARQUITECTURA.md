# Arquitectura de Porter

Una aplicación con áreas separadas y una base compartida mantiene el recorrido mesa → pedido → preparación → cobro → puntos consistente. Las sucursales comparten productos y recetas, y tienen mesas, disponibilidad/precio, empleados, pedidos y turnos propios. No hace falta clonar la base para separar negocios; `branch_id` y RLS realizan ese aislamiento.

## Autoridad y datos

- React presenta el catálogo y el estado de operación. No decide permisos ni acredita pagos.
- Supabase Auth identifica clientes y empleados. Un registro no crea privilegios internos.
- PostgreSQL aplica RLS en las 20 tablas y funciones con permisos explícitos. `SECURITY DEFINER` usa `search_path` controlado, valida identidad/rol/sucursal y rechaza cambios de estado inválidos.
- `submit_order` calcula precios y crea cabecera/detalle en la misma transacción. Identificadores de solicitud evitan duplicar pedidos por reintento.
- El pedido conserva nombre y precio de cada producto al comprar; editar la carta no modifica consumos anteriores.
- Cobros y cierres usan bloqueos de filas. Las confirmaciones de pagos exigen cajero/administrador; referencia informada ≠ pago.
- `loyalty_entries` es un registro de movimientos. La acreditación por pedido es única y el canje usa un bloqueo por cliente.
- `audit_log` conserva acciones operativas relevantes. No se permite modificar ventas con un `upsert` público.
- `recipes` es información interna. Las sesiones invitadas no se exponen por endpoints de tablas.

La interfaz consulta novedades cada 10 segundos (6 segundos en pedidos del comensal). La carga del equipo pagina los registros para no truncar cobros silenciosamente. Antes de escalar a grandes volúmenes, reemplazar las lecturas completas por consultas por turno/servicio, resúmenes SQL y actualización incremental o Realtime. El cálculo de cierre en servidor sigue siendo la autoridad.

## Estructura

`src/Public.tsx`: sitio, catálogo, invitado, autenticación y Club. `src/Staff.tsx`: operación. `src/store.tsx`: conexión, autorización visible, lectura y demo aislada. `src/domain.ts`: cálculos y validaciones reutilizables. `supabase/migrations`: versión del esquema. `supabase/tests`: pruebas transaccionales de permisos y negocio.

La migración inicial ya está aplicada al proyecto indicado. **No volver a ejecutarla sobre la misma base**: crea tablas sin `IF NOT EXISTS` y corre dentro de una transacción. Las modificaciones posteriores deben ser nuevas migraciones, manteniendo la historia.

## Respaldo y traslado

1. Definir frecuencia y retención de respaldos según la operación; no asumir que el plan de Supabase incluye recuperación a un punto en el tiempo.
2. Obtener un respaldo consistente de esquema y datos con un acceso autorizado, además de usuarios/Auth, configuración y archivos de Storage cuando se incorporen.
3. Restaurar primero en un proyecto separado; verificar conteos, relaciones, roles, funciones, secuencias y permisos.
4. Ejecutar pruebas de negocio y acceso en esa restauración antes de cambiar las variables del frontend.
5. Separar configuración de servicios externos, secretos, URLs de Auth y Storage del código; no quedan replicados solo por copiar tablas.

No se realizó una copia de respaldo ni simulacro de restauración en esta entrega. Se entrega esquema versionado y una prueba reproducible; clonar producción completa requerirá el procedimiento anterior.
