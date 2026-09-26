# Porter Brew House

Primera versión funcional del ecosistema Porter: sitio público, pedidos por QR, operación de salón/cocina/barra, caja y Club. Interfaz en español, responsive, React + TypeScript + Vite; base PostgreSQL de Supabase compartida con separación por sucursal y políticas RLS.

## Estado

- Web: https://porter-brew-house-tucuman.netlify.app
- Demo del equipo: https://porter-brew-house-tucuman.netlify.app/equipo?demo=1
- Código: https://github.com/Nodira2025/PORTER

La migración inicial se aplicó con autorización expresa al proyecto **porter**, `oeiomiobhpkujxhentbj`, main/producción, el 25/09/2026 (26/09 UTC). Las pruebas de base de datos pasaron y revirtieron sus datos. Quedaron dos sucursales y 12 mesas iniciales por sucursal. **Los pedidos digitales y los puntos reales están desactivados**, sin productos, ventas ni administradores ficticios.

La demo usa exclusivamente almacenamiento local del navegador. Abrir `/equipo?demo=1` para recorrer todos los módulos o `/carta?demo=1` para probar como comensal. No genera cobros ni pedidos en Supabase. “Reiniciar demo” vuelve a los datos de ejemplo.

## Desarrollo

Requiere Node.js 24 y npm. En PowerShell usar `npm.cmd` si la política bloquea scripts `.ps1`.

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Completar VITE_SUPABASE_PUBLISHABLE_KEY con la clave pública del proyecto
npm.cmd run dev
```

```powershell
npm.cmd test
npm.cmd run build
```

La URL y la clave **publicable** de Supabase pueden estar en el frontend; la seguridad reside en RLS y funciones transaccionales. Nunca colocar `service_role`, claves de Mercado Pago ni contraseñas en variables `VITE_*`. `.env.local` está ignorado por Git.

## Recorrido

1. Administración carga productos, precios, disponibilidad por sucursal y recetas privadas; luego habilita pedidos en la sucursal.
2. Salón abre una mesa. Su QR permite una sesión invitada sin registro, válida para esa visita.
3. El cliente agrega productos y observaciones. El servidor verifica disponibilidad y calcula el total con los precios vigentes. El personal también puede tomar pedidos desde el celular.
4. Salón confirma el pedido; cocina/barra toma cada preparación, consulta receta/video y marca listo. Salón registra la entrega.
5. Caja abre turno, valida efectivo o transferencia y registra cobros parciales. Informar una transferencia desde el cliente nunca acredita dinero por sí solo.
6. La mesa cierra cuando todos los pedidos están entregados y pagados, o anulados sin cobros. El arqueo compara efectivo contado con fondo inicial, cobros en efectivo y movimientos.
7. Un cliente identificado al ingresar a su mesa puede acumular puntos cuando su pedido queda completamente pagado. Las reglas y premios son configurables; su activación debe respetar el Club Porter existente.

## Rutas

| Ruta                                        | Uso                                                                |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `/`                                         | Historia, sucursales, contacto, ubicación, Google y acceso al Club |
| `/carta`                                    | Catálogo y carrito                                                 |
| `/mesa/:qr`                                 | Entrada a la mesa por QR                                           |
| `/mis-pedidos`                              | Seguimiento de la sesión invitada                                  |
| `/acceso`, `/recuperar`                     | Cuenta, registro y recuperación                                    |
| `/club`                                     | Puntos, canjes y solicitudes de reserva                            |
| `/equipo`                                   | Resumen del equipo                                                 |
| `/equipo/mesas`, `/equipo/pedidos`          | Salón y pedidos                                                    |
| `/equipo/cocina`                            | Preparación y recetas                                              |
| `/equipo/caja`                              | Cobros, movimientos, cierre, CSV y ticket interno                  |
| `/equipo/catalogo`, `/equipo/configuracion` | Administración                                                     |
| `/equipo/reservas`                          | Solicitudes de reserva                                             |

## Activación y documentación

- [Operación, primer administrador y pendientes](docs/OPERACION.md)
- [Arquitectura, respaldo y evolución](docs/ARQUITECTURA.md)
- [Fuentes públicas y recursos visuales](docs/FUENTES.md)
- [Validaciones realizadas](docs/VALIDACION.md)
- [Migración inicial](supabase/migrations/202609260001_porter.sql)
- [Pruebas operativas transaccionales](supabase/tests/test_operations.sql)

`netlify.toml` contiene build, redirección SPA y encabezados. El despliegue inicial se realiza desde `dist`; conectar el repositorio en Netlify y configurar las dos variables públicas si se desea build automático en cada push. El repositorio no contiene tokens de despliegue.
