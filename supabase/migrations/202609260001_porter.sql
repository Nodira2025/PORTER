-- PORTER v1. Additive migration for project oeiomiobhpkujxhentbj.
begin;
create table public.branches (
 id text primary key, name text not null, address text not null, phone text,
 maps_url text not null, reservation_url text, transport_note text,
 ordering_enabled boolean not null default false
);
insert into public.branches(id,name,address,phone,maps_url,reservation_url,transport_note) values
 ('barrio-norte','Barrio Norte','Muñecas 749, San Miguel de Tucumán','0381 484-0812','https://www.google.com/maps/search/?api=1&query=Porter+Brew+House+Barrio+Norte','https://bookity.io/r/porter-barrio-norte','Recorridos y paradas pendientes de verificar.'),
 ('yerba-buena','Yerba Buena','Av. Juan Domingo Perón 1750, City Place','0381 485-8001','https://www.google.com/maps/search/?api=1&query=Porter+Brew+House+Yerba+Buena',null,'Recorridos y paradas pendientes de verificar.');
create table public.staff_members (
 user_id uuid primary key references auth.users(id), role text not null check(role in ('admin','waiter','kitchen','cashier')),
 branch_id text references public.branches(id), active boolean not null default true,
 check(role='admin' or branch_id is not null)
);
create table public.customer_profiles (
 id uuid primary key references auth.users(id), display_name text not null default '', created_at timestamptz not null default now()
);
create function public.is_staff(p_branch text default null, p_roles text[] default array['admin','waiter','kitchen','cashier']) returns boolean
 language sql stable security definer set search_path=public as $$
 select exists(select 1 from staff_members where user_id=auth.uid() and active and (role='admin' or (role=any(p_roles) and (p_branch is null or branch_id=p_branch)))); $$;
create table public.products (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 120), description text not null default '',
 category text not null, price numeric(12,2) not null check(price>0), image_url text,
 station text not null default 'kitchen' check(station in ('kitchen','bar')), active boolean not null default true,
 tags text[] not null default '{}', created_at timestamptz not null default now()
);
create table public.branch_products (
 branch_id text references public.branches(id), product_id uuid references public.products(id),
 available boolean not null default true, price_override numeric(12,2) check(price_override>0), primary key(branch_id,product_id)
);
create table public.recipes (
 product_id uuid primary key references public.products(id), ingredients text not null default '', instructions text not null default '', video_url text,
 check(video_url is null or video_url ~ '^https://(www\.)?(youtube\.com/|youtu\.be/)')
);
create table public.dining_tables (
 id uuid primary key default gen_random_uuid(), branch_id text not null references public.branches(id), label text not null,
 qr_token uuid not null unique default gen_random_uuid(), active boolean not null default true, unique(branch_id,label)
);
insert into public.dining_tables(branch_id,label) select b.id, 'Mesa '||n from public.branches b cross join generate_series(1,12) n;
create table public.service_sessions (
 id uuid primary key default gen_random_uuid(), table_id uuid not null references public.dining_tables(id),
 opened_by uuid not null references auth.users(id), opened_at timestamptz not null default now(), closed_at timestamptz
);
create unique index one_open_table on public.service_sessions(table_id) where closed_at is null;
create table public.guest_sessions (
 token uuid primary key default gen_random_uuid(), service_id uuid not null references public.service_sessions(id),
 customer_id uuid references auth.users(id), created_at timestamptz not null default now()
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), number bigint generated always as identity unique,
 branch_id text not null references public.branches(id), service_id uuid not null references public.service_sessions(id),
 guest_token uuid references public.guest_sessions(token), customer_id uuid references auth.users(id),
 created_by uuid references auth.users(id), assigned_to uuid references auth.users(id),
 status text not null default 'pending' check(status in ('pending','accepted','preparing','ready','delivered','cancelled')),
 total numeric(12,2) not null check(total>0), note text not null default '',
 payment_preference text not null default 'cash' check(payment_preference in ('cash','transfer')),
 payment_reference text not null default '', request_id uuid not null unique, cancel_reason text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id), product_id uuid not null references public.products(id),
 name text not null, quantity integer not null check(quantity between 1 and 20), unit_price numeric(12,2) not null check(unit_price>0),
 station text not null check(station in ('kitchen','bar')), note text not null default '',
 status text not null default 'pending' check(status in ('pending','preparing','ready'))
);
create table public.audit_log (
 id bigint generated always as identity primary key, branch_id text references public.branches(id), actor_id uuid references auth.users(id),
 action text not null, entity_id uuid, detail jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.cash_shifts (
 id uuid primary key default gen_random_uuid(), branch_id text not null references public.branches(id), opened_by uuid not null references auth.users(id),
 opening_amount numeric(12,2) not null check(opening_amount>=0), opened_at timestamptz not null default now(),
 closed_at timestamptz, closed_by uuid references auth.users(id), declared_cash numeric(12,2), expected_cash numeric(12,2)
);
create unique index one_open_cash on public.cash_shifts(branch_id) where closed_at is null;
create table public.payments (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id), shift_id uuid not null references public.cash_shifts(id),
 amount numeric(12,2) not null check(amount>0), method text not null check(method in ('cash','transfer')),
 reference text not null default '', verified_by uuid not null references auth.users(id), request_id uuid not null unique,
 created_at timestamptz not null default now()
);
create table public.cash_movements (
 id uuid primary key default gen_random_uuid(), shift_id uuid not null references public.cash_shifts(id),
 amount numeric(12,2) not null check(amount<>0), reason text not null check(length(reason)>=3),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.loyalty_settings (id boolean primary key default true check(id), enabled boolean not null default false, pesos_per_point numeric not null default 1000 check(pesos_per_point>0));
insert into public.loyalty_settings default values;
create table public.rewards (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', cost integer not null check(cost>0), active boolean not null default true
);
create table public.loyalty_entries (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), points integer not null check(points<>0),
 order_id uuid unique references public.orders(id), reason text not null, created_at timestamptz not null default now()
);
create table public.reward_claims (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), reward_id uuid not null references public.rewards(id),
 title text not null, cost integer not null, code uuid not null unique default gen_random_uuid(), redeemed_at timestamptz, created_at timestamptz not null default now()
);
create table public.reservations (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), branch_id text not null references public.branches(id),
 scheduled_at timestamptz not null, guests integer not null check(guests between 1 and 30), note text not null default '',
 status text not null default 'requested' check(status in ('requested','confirmed','cancelled')), created_at timestamptz not null default now()
);
-- RLS: customer identity never grants access to the staff area.
alter table public.branches enable row level security;
alter table public.staff_members enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.products enable row level security;
alter table public.branch_products enable row level security;
alter table public.recipes enable row level security;
alter table public.dining_tables enable row level security;
alter table public.service_sessions enable row level security;
alter table public.guest_sessions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.audit_log enable row level security;
alter table public.cash_shifts enable row level security;
alter table public.payments enable row level security;
alter table public.cash_movements enable row level security;
alter table public.loyalty_settings enable row level security;
alter table public.rewards enable row level security;
alter table public.loyalty_entries enable row level security;
alter table public.reward_claims enable row level security;
alter table public.reservations enable row level security;
create policy branches_read on public.branches for select using(true);
create policy branches_admin on public.branches for update to authenticated using(public.is_staff(null,array['admin'])) with check(public.is_staff(null,array['admin']));
create policy staff_self on public.staff_members for select to authenticated using(user_id=auth.uid() or public.is_staff(null,array['admin']));
create policy profiles_self on public.customer_profiles for all to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy product_read on public.products for select using(active or public.is_staff());
create policy products_admin on public.products for all to authenticated using(public.is_staff(null,array['admin'])) with check(public.is_staff(null,array['admin']));
create policy availability_read on public.branch_products for select using(true);
create policy availability_admin on public.branch_products for all to authenticated using(public.is_staff(null,array['admin'])) with check(public.is_staff(null,array['admin']));
create policy recipes_read on public.recipes for select to authenticated using(public.is_staff(null,array['kitchen']));
create policy recipes_admin on public.recipes for all to authenticated using(public.is_staff(null,array['admin'])) with check(public.is_staff(null,array['admin']));
create policy tables_read on public.dining_tables for select to authenticated using(public.is_staff(branch_id));
create policy services_read on public.service_sessions for select to authenticated using(exists(select 1 from public.dining_tables t where t.id=table_id and public.is_staff(t.branch_id)));
create policy orders_read on public.orders for select to authenticated using(public.is_staff(branch_id) or customer_id=auth.uid());
create policy items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
create policy audit_read on public.audit_log for select to authenticated using(public.is_staff(branch_id,array['admin']));
create policy shifts_read on public.cash_shifts for select to authenticated using(public.is_staff(branch_id,array['cashier']));
create policy payments_read on public.payments for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (public.is_staff(o.branch_id,array['cashier']) or o.customer_id=auth.uid())));
create policy movements_read on public.cash_movements for select to authenticated using(exists(select 1 from public.cash_shifts s where s.id=shift_id and public.is_staff(s.branch_id,array['cashier'])));
create policy settings_read on public.loyalty_settings for select using(true);
create policy settings_admin on public.loyalty_settings for update to authenticated using(public.is_staff(null,array['admin'])) with check(public.is_staff(null,array['admin']));
create policy rewards_read on public.rewards for select using(active or public.is_staff(null,array['admin']));
create policy rewards_admin on public.rewards for all to authenticated using(public.is_staff(null,array['admin'])) with check(public.is_staff(null,array['admin']));
create policy points_read on public.loyalty_entries for select to authenticated using(customer_id=auth.uid() or public.is_staff(null,array['admin']));
create policy claims_read on public.reward_claims for select to authenticated using(customer_id=auth.uid() or public.is_staff(null,array['cashier']));
create policy reservations_read on public.reservations for select to authenticated using(customer_id=auth.uid() or public.is_staff(branch_id,array['waiter','cashier']));
create policy reservations_insert on public.reservations for insert to authenticated with check(customer_id=auth.uid() and status='requested' and scheduled_at>now());
create policy reservations_staff on public.reservations for update to authenticated using(public.is_staff(branch_id,array['waiter','cashier'])) with check(public.is_staff(branch_id,array['waiter','cashier']));
-- Guest tokens are capabilities. They are never readable through table endpoints.
create function public.join_table(p_qr uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare t dining_tables; s service_sessions; g guest_sessions;
begin
 select * into t from dining_tables where qr_token=p_qr and active;
 if t.id is null then raise exception 'QR no válido.'; end if;
 if not (select ordering_enabled from branches where id=t.branch_id) then raise exception 'Los pedidos digitales todavía no están habilitados en esta sucursal.'; end if;
 select * into s from service_sessions where table_id=t.id and closed_at is null;
 if s.id is null then raise exception 'Pedile al personal que abra tu mesa para comenzar.'; end if;
 insert into guest_sessions(service_id,customer_id) values(s.id,auth.uid()) returning * into g;
 return jsonb_build_object('token',g.token,'service_id',s.id,'branch_id',t.branch_id,'label',t.label);
end $$;
create function public.open_table(p_table uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare t dining_tables; sid uuid;
begin
 select * into t from dining_tables where id=p_table and active for update;
 if t.id is null or not is_staff(t.branch_id,array['waiter','cashier']) then raise exception 'Acceso denegado.'; end if;
 select id into sid from service_sessions where table_id=t.id and closed_at is null;
 if sid is null then insert into service_sessions(table_id,opened_by) values(t.id,auth.uid()) returning id into sid; end if;
 return sid;
end $$;
create function public.submit_order(p_items jsonb,p_request uuid,p_note text default '',p_payment text default 'cash',p_guest uuid default null,p_service uuid default null) returns uuid language plpgsql security definer set search_path=public as $$
declare sid uuid; bid text; uid uuid; oid uuid; entry jsonb; prod products; qty integer; price_now numeric; total_now numeric:=0; line_data jsonb:='[]'; existing orders;
begin
 if p_guest is not null then select service_id,customer_id into sid,uid from guest_sessions where token=p_guest;
 else sid:=p_service; end if;
 select t.branch_id into bid from service_sessions s join dining_tables t on t.id=s.table_id where s.id=sid and s.closed_at is null for update of s;
 if bid is null then raise exception 'La mesa no está abierta.'; end if;
 if p_guest is null and not is_staff(bid,array['waiter','cashier']) then raise exception 'Acceso denegado.'; end if;
 if not (select ordering_enabled from branches where id=bid) then raise exception 'Pedidos deshabilitados en esta sucursal.'; end if;
 select * into existing from orders where request_id=p_request;
 if existing.id is not null then
   if existing.guest_token is not distinct from p_guest and existing.service_id=sid and (p_guest is not null or existing.created_by=auth.uid()) then return existing.id; end if;
   raise exception 'Identificador de pedido en uso.';
 end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 40 or length(p_note)>1000 or p_payment not in ('cash','transfer') then raise exception 'Pedido inválido.'; end if;
 if (select count(*) from orders where service_id=sid and created_at>now()-interval '1 minute')>=20 then raise exception 'Esperá un momento antes de enviar otro pedido.'; end if;
 for entry in select * from jsonb_array_elements(p_items) loop
   qty:=(entry->>'quantity')::integer;
   if qty is null or qty not between 1 and 20 or length(coalesce(entry->>'note',''))>500 then raise exception 'Cantidad u observación inválida.'; end if;
   select * into prod from products where id=(entry->>'product_id')::uuid and active;
   if prod.id is null then raise exception 'Producto no disponible.'; end if;
   if exists(select 1 from branch_products where branch_id=bid and product_id=prod.id and not available) then raise exception '% ya no está disponible.',prod.name; end if;
   select coalesce((select price_override from branch_products where branch_id=bid and product_id=prod.id),prod.price) into price_now;
   total_now:=total_now+price_now*qty;
   line_data:=line_data||jsonb_build_array(jsonb_build_object('product_id',prod.id,'name',prod.name,'quantity',qty,'unit_price',price_now,'station',prod.station,'note',coalesce(entry->>'note','')));
 end loop;
 insert into orders(branch_id,service_id,guest_token,customer_id,created_by,total,note,payment_preference,request_id)
 values(bid,sid,p_guest,uid,auth.uid(),total_now,p_note,p_payment,p_request) returning id into oid;
 insert into order_items(order_id,product_id,name,quantity,unit_price,station,note)
 select oid,(x->>'product_id')::uuid,x->>'name',(x->>'quantity')::int,(x->>'unit_price')::numeric,x->>'station',x->>'note' from jsonb_array_elements(line_data) x;
 insert into audit_log(branch_id,actor_id,action,entity_id) values(bid,auth.uid(),'order.created',oid);
 return oid;
end $$;
create function public.guest_orders(p_guest uuid) returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'number',o.number,'status',o.status,'total',o.total,'note',o.note,'created_at',o.created_at,'payment_reference',o.payment_reference,'payment_preference',o.payment_preference,
 'paid',coalesce((select sum(amount) from payments where order_id=o.id),0),'order_items',(select jsonb_agg(to_jsonb(i)-'order_id') from order_items i where i.order_id=o.id)) order by o.created_at desc),'[]'::jsonb)
 from orders o where o.guest_token=p_guest; $$;
create function public.report_transfer(p_order uuid,p_guest uuid,p_reference text) returns void language plpgsql security definer set search_path=public as $$
begin
 if length(trim(p_reference)) not between 3 and 250 then raise exception 'Ingresá una referencia válida.'; end if;
 update orders set payment_reference=trim(p_reference) where id=p_order and guest_token=p_guest and status<>'cancelled';
 if not found then raise exception 'Pedido no encontrado.'; end if;
end $$;
create function public.advance_order(p_order uuid,p_status text,p_reason text default '') returns void language plpgsql security definer set search_path=public as $$
declare o orders;
begin
 select * into o from orders where id=p_order for update;
 if not is_staff(o.branch_id,array['waiter','cashier']) then raise exception 'Acceso denegado.'; end if;
 if p_status='cancelled' then
   if o.status in ('delivered','cancelled') or length(trim(p_reason))<3 or exists(select 1 from payments where order_id=o.id) then raise exception 'La anulación requiere motivo y un pedido sin cobros ni entrega.'; end if;
 elsif not ((o.status='pending' and p_status='accepted') or (o.status='ready' and p_status='delivered')) then raise exception 'Cambio de estado no permitido.'; end if;
 update orders set status=p_status,assigned_to=coalesce(assigned_to,auth.uid()),cancel_reason=case when p_status='cancelled' then p_reason end,updated_at=now() where id=o.id;
 insert into audit_log(branch_id,actor_id,action,entity_id,detail) values(o.branch_id,auth.uid(),'order.'||p_status,o.id,jsonb_build_object('reason',p_reason));
end $$;
create function public.prepare_item(p_item uuid,p_status text) returns void language plpgsql security definer set search_path=public as $$
declare i order_items; o orders;
begin
 select * into i from order_items where id=p_item;
 select * into o from orders where id=i.order_id for update;
 select * into i from order_items where id=p_item;
 if o.id is null or not is_staff(o.branch_id,array['kitchen']) then raise exception 'Acceso denegado.'; end if;
 if o.status not in ('accepted','preparing') or not ((i.status='pending' and p_status='preparing') or (i.status='preparing' and p_status='ready')) then raise exception 'Cambio de preparación no permitido.'; end if;
 update order_items set status=p_status where id=i.id;
 update orders set status=case when not exists(select 1 from order_items where order_id=o.id and status<>'ready') then 'ready' else 'preparing' end,updated_at=now() where id=o.id;
 insert into audit_log(branch_id,actor_id,action,entity_id) values(o.branch_id,auth.uid(),'item.'||p_status,i.id);
end $$;
create function public.open_shift(p_branch text,p_amount numeric) returns uuid language plpgsql security definer set search_path=public as $$
declare sid uuid;
begin
 if not is_staff(p_branch,array['cashier']) or p_amount is null or p_amount<0 then raise exception 'Acceso o importe inválido.'; end if;
 insert into cash_shifts(branch_id,opened_by,opening_amount) values(p_branch,auth.uid(),p_amount) returning id into sid; return sid;
end $$;
create function public.register_payment(p_order uuid,p_amount numeric,p_method text,p_reference text,p_request uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare o orders; s cash_shifts; pid uuid; paid numeric; cfg loyalty_settings;
begin
 select * into o from orders where id=p_order for update;
 if o.id is null or not is_staff(o.branch_id,array['cashier']) then raise exception 'Acceso denegado.'; end if;
 select id into pid from payments where request_id=p_request and order_id=o.id;
 if pid is not null then return pid; end if;
 if o.status='cancelled' or p_amount is null or p_amount<=0 or p_method not in ('cash','transfer') or (p_method='transfer' and length(trim(p_reference))<3) then raise exception 'Cobro inválido.'; end if;
 select * into s from cash_shifts where branch_id=o.branch_id and closed_at is null for update;
 if s.id is null then raise exception 'Abrí la caja antes de registrar cobros.'; end if;
 select coalesce(sum(amount),0) into paid from payments where order_id=o.id;
 if round(p_amount,2)>o.total-paid then raise exception 'El importe supera el saldo pendiente.'; end if;
 insert into payments(order_id,shift_id,amount,method,reference,verified_by,request_id) values(o.id,s.id,round(p_amount,2),p_method,p_reference,auth.uid(),p_request) returning id into pid;
 select * into cfg from loyalty_settings where id;
 if cfg.enabled and o.customer_id is not null and paid+round(p_amount,2)=o.total and floor(o.total/cfg.pesos_per_point)>0 then
   insert into loyalty_entries(customer_id,points,order_id,reason) values(o.customer_id,floor(o.total/cfg.pesos_per_point),o.id,'Consumo pagado') on conflict(order_id) do nothing;
 end if;
 insert into audit_log(branch_id,actor_id,action,entity_id,detail) values(o.branch_id,auth.uid(),'payment.verified',pid,jsonb_build_object('amount',round(p_amount,2),'method',p_method));
 return pid;
end $$;
create function public.add_cash_movement(p_shift uuid,p_amount numeric,p_reason text) returns void language plpgsql security definer set search_path=public as $$
declare s cash_shifts;
begin
 select * into s from cash_shifts where id=p_shift and closed_at is null for update;
 if s.id is null or not is_staff(s.branch_id,array['cashier']) then raise exception 'Caja no disponible.'; end if;
 insert into cash_movements(shift_id,amount,reason,created_by) values(s.id,p_amount,p_reason,auth.uid());
end $$;
create function public.close_shift(p_shift uuid,p_declared numeric) returns numeric language plpgsql security definer set search_path=public as $$
declare s cash_shifts; expected numeric;
begin
 select * into s from cash_shifts where id=p_shift and closed_at is null for update;
 if s.id is null or not is_staff(s.branch_id,array['cashier']) or p_declared is null or p_declared<0 then raise exception 'Caja o importe no válido.'; end if;
 expected:=s.opening_amount+coalesce((select sum(amount) from payments where shift_id=s.id and method='cash'),0)+coalesce((select sum(amount) from cash_movements where shift_id=s.id),0);
 update cash_shifts set closed_at=now(),closed_by=auth.uid(),declared_cash=round(p_declared,2),expected_cash=expected where id=s.id;
 return round(p_declared,2)-expected;
end $$;
create function public.close_table(p_service uuid) returns void language plpgsql security definer set search_path=public as $$
declare bid text;
begin
 select t.branch_id into bid from service_sessions s join dining_tables t on t.id=s.table_id where s.id=p_service and s.closed_at is null for update of s;
 if bid is null or not is_staff(bid,array['waiter','cashier']) then raise exception 'Mesa no disponible.'; end if;
 if exists(select 1 from orders o where service_id=p_service and status<>'cancelled' and (status<>'delivered' or total>coalesce((select sum(amount) from payments where order_id=o.id),0))) then raise exception 'Hay pedidos sin entregar o saldos pendientes.'; end if;
 update service_sessions set closed_at=now() where id=p_service;
end $$;
create function public.redeem_reward(p_reward uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare r rewards; balance integer; cid uuid;
begin
 if auth.uid() is null or not (select enabled from loyalty_settings where id) then raise exception 'Club todavía no habilitado.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into r from rewards where id=p_reward and active;
 select coalesce(sum(points),0) into balance from loyalty_entries where customer_id=auth.uid();
 if r.id is null or balance<r.cost then raise exception 'No tenés puntos suficientes para este beneficio.'; end if;
 insert into loyalty_entries(customer_id,points,reason) values(auth.uid(),-r.cost,'Canje: '||r.title);
 insert into reward_claims(customer_id,reward_id,title,cost) values(auth.uid(),r.id,r.title,r.cost) returning id into cid; return cid;
end $$;
-- Only deliberate RPCs can mutate operational records. Default PostgreSQL EXECUTE is revoked.
revoke all on function public.is_staff(text,text[]) from public;
grant execute on function public.is_staff(text,text[]) to anon,authenticated;
revoke all on function public.join_table(uuid),public.submit_order(jsonb,uuid,text,text,uuid,uuid),public.guest_orders(uuid),public.report_transfer(uuid,uuid,text) from public;
grant execute on function public.join_table(uuid),public.submit_order(jsonb,uuid,text,text,uuid,uuid),public.guest_orders(uuid),public.report_transfer(uuid,uuid,text) to anon,authenticated;
revoke all on function public.open_table(uuid),public.advance_order(uuid,text,text),public.prepare_item(uuid,text),public.open_shift(text,numeric),public.register_payment(uuid,numeric,text,text,uuid),public.add_cash_movement(uuid,numeric,text),public.close_shift(uuid,numeric),public.close_table(uuid),public.redeem_reward(uuid) from public;
grant execute on function public.open_table(uuid),public.advance_order(uuid,text,text),public.prepare_item(uuid,text),public.open_shift(text,numeric),public.register_payment(uuid,numeric,text,text,uuid),public.add_cash_movement(uuid,numeric,text),public.close_shift(uuid,numeric),public.close_table(uuid),public.redeem_reward(uuid) to authenticated;
grant select on public.branches,public.products,public.branch_products,public.loyalty_settings,public.rewards to anon,authenticated;
grant select on public.staff_members,public.customer_profiles,public.recipes,public.dining_tables,public.service_sessions,public.orders,public.order_items,public.audit_log,public.cash_shifts,public.payments,public.cash_movements,public.loyalty_entries,public.reward_claims,public.reservations to authenticated;
grant insert,update,delete on public.products,public.branch_products,public.recipes,public.rewards,public.customer_profiles to authenticated;
grant update on public.branches,public.loyalty_settings to authenticated;
grant insert,update on public.reservations to authenticated;
revoke all on public.guest_sessions from anon,authenticated;
create index orders_service on public.orders(service_id);
create index orders_branch_date on public.orders(branch_id,created_at desc);
create index items_order on public.order_items(order_id);
create index payments_order on public.payments(order_id);
create index payments_shift on public.payments(shift_id);
create index points_customer on public.loyalty_entries(customer_id);
notify pgrst,'reload schema';
commit;
