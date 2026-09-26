-- Ejecutar exclusivamente después de confirmar la identidad y autorización.
-- El usuario debe registrarse y confirmar su email antes de este paso.
-- Cambiar el correo exacto; role/branch según corresponda. No usar un email supuesto.
do $$
declare
 target_email text := 'REEMPLAZAR_POR_CORREO_CONFIRMADO';
 target_role text := 'admin';
 target_branch text := null; -- waiter/kitchen/cashier: barrio-norte o yerba-buena
 account_id uuid;
 verified timestamptz;
 matches integer;
begin
 if target_email='REEMPLAZAR_POR_CORREO_CONFIRMADO' then
  raise exception 'Falta el correo exacto confirmado por el responsable.';
 end if;
 select count(*) into matches from auth.users where lower(email)=lower(trim(target_email));
 if matches<>1 then raise exception 'Debe existir exactamente una cuenta con ese correo.'; end if;
 select id,email_confirmed_at into account_id,verified from auth.users where lower(email)=lower(trim(target_email));
 if verified is null then raise exception 'La cuenta todavía no confirmó su email.'; end if;
 if exists(select 1 from public.staff_members where user_id=account_id) then
  raise exception 'La cuenta ya tiene un rol. Revisarlo antes de cambiar sus permisos.';
 end if;
 insert into public.staff_members(user_id,role,branch_id) values(account_id,target_role,target_branch);
 raise notice 'Rol asignado a la cuenta exacta confirmada.';
end $$;
