-- All fixtures roll back inside a subtransaction, including auth users and roles.
do $$
declare a uuid:=gen_random_uuid(); w uuid:=gen_random_uuid(); k uuid:=gen_random_uuid(); c uuid:=gen_random_uuid();
 p uuid:=gen_random_uuid(); t uuid; y uuid; sid uuid; g jsonb; o uuid; oid2 uuid; rid uuid:=gen_random_uuid();
 item uuid; shift uuid; pay_request uuid:=gen_random_uuid(); n numeric; blocked boolean; pts integer;
begin
 begin
  insert into auth.users(id,email,aud,role) values
    (a,'porter-test-admin-'||a||'@example.invalid','authenticated','authenticated'),
    (w,'porter-test-waiter-'||w||'@example.invalid','authenticated','authenticated'),
    (k,'porter-test-kitchen-'||k||'@example.invalid','authenticated','authenticated'),
    (c,'porter-test-customer-'||c||'@example.invalid','authenticated','authenticated');
  insert into public.staff_members(user_id,role,branch_id) values(a,'admin',null),(w,'waiter','barrio-norte'),(k,'kitchen','yerba-buena');
  insert into public.products(id,name,category,price,station) values(p,'TEST TRANSACCIONAL','TEST',4000,'kitchen');
  insert into public.recipes(product_id,instructions) values(p,'TEST RECETA PRIVADA');
  insert into public.branch_products(branch_id,product_id,price_override) values('barrio-norte',p,4999.95);
  update public.branches set ordering_enabled=true where id='barrio-norte';
  update public.loyalty_settings set enabled=true,pesos_per_point=1000 where id=true;
  select id into t from public.dining_tables where branch_id='barrio-norte' limit 1;
  select id into y from public.dining_tables where branch_id='yerba-buena' limit 1;
  perform set_config('request.jwt.claim.sub',a::text,true);
  perform set_config('role','authenticated',true);
  sid:=public.open_table(t);
  if public.open_table(t)<>sid then raise exception 'FAIL: table open must be idempotent'; end if;
  perform set_config('role','postgres',true);
  select public.join_table(qr_token) into g from public.dining_tables where id=t;
  -- Associate fixture guest with the test customer, mirroring authenticated join.
  update public.guest_sessions set customer_id=c where token=(g->>'token')::uuid;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('role','anon',true);
  o:=public.submit_order(jsonb_build_array(jsonb_build_object('product_id',p,'quantity',2,'unit_price',0.01)),rid,'TEST','cash',(g->>'token')::uuid,null);
  oid2:=public.submit_order(jsonb_build_array(jsonb_build_object('product_id',p,'quantity',2)),rid,'TEST','cash',(g->>'token')::uuid,null);
  if oid2<>o then raise exception 'FAIL: request id duplicated order'; end if;
  if (public.guest_orders((g->>'token')::uuid)->0->>'total')::numeric<>9999.90 then raise exception 'FAIL: server price / branch override'; end if;
  if public.guest_orders(gen_random_uuid())<>'[]'::jsonb then raise exception 'FAIL: another guest saw orders'; end if;
  if exists(select 1 from public.orders) or exists(select 1 from public.recipes) or exists(select 1 from public.staff_members) then raise exception 'FAIL: anonymous data isolation'; end if;
  blocked:=false; begin perform public.open_shift('barrio-norte',1000); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: anonymous opened cash'; end if;
  blocked:=false; begin perform public.submit_order(jsonb_build_array(jsonb_build_object('product_id',p,'quantity',0)),gen_random_uuid(),'','cash',(g->>'token')::uuid,null); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: invalid quantity accepted'; end if;
  perform set_config('role','postgres',true);
  perform set_config('request.jwt.claim.sub',w::text,true);
  perform set_config('role','authenticated',true);
  blocked:=false; begin perform public.open_table(y); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: waiter opened another branch'; end if;
  perform public.advance_order(o,'accepted');
  select id into item from public.order_items where order_id=o;
  blocked:=false; begin perform public.prepare_item(item,'preparing'); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: waiter used kitchen role'; end if;
  perform set_config('role','postgres',true);
  perform set_config('request.jwt.claim.sub',k::text,true);
  perform set_config('role','authenticated',true);
  if exists(select 1 from public.orders where id=o) then raise exception 'FAIL: kitchen saw another branch order'; end if;
  blocked:=false; begin perform public.prepare_item(item,'preparing'); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: kitchen prepared another branch'; end if;
  perform set_config('role','postgres',true);
  perform set_config('request.jwt.claim.sub',a::text,true);
  perform set_config('role','authenticated',true);
  perform public.prepare_item(item,'preparing');
  perform public.prepare_item(item,'ready');
  perform public.advance_order(o,'delivered');
  shift:=public.open_shift('barrio-norte',1000);
  perform public.register_payment(o,500,'cash','',pay_request);
  perform public.register_payment(o,500,'cash','',pay_request);
  select sum(amount) into n from public.payments where order_id=o;
  if n<>500 then raise exception 'FAIL: duplicate payment'; end if;
  blocked:=false; begin perform public.register_payment(o,10000,'cash','',gen_random_uuid()); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: overpayment accepted'; end if;
  blocked:=false; begin perform public.close_table(sid); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: unpaid table closed'; end if;
  perform public.register_payment(o,9499.90,'transfer','TEST VERIFIED',gen_random_uuid());
  select sum(points) into pts from public.loyalty_entries where customer_id=c;
  if pts<>9 then raise exception 'FAIL: loyalty amount'; end if;
  blocked:=false; begin perform public.advance_order(o,'cancelled','TEST'); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: paid delivered order cancelled'; end if;
  perform public.add_cash_movement(shift,-100,'TEST MOVEMENT');
  n:=public.close_shift(shift,1400);
  if n<>0 then raise exception 'FAIL: cash close calculation'; end if;
  perform public.close_table(sid);
  blocked:=false; begin perform public.submit_order(jsonb_build_array(jsonb_build_object('product_id',p,'quantity',1)),gen_random_uuid(),'','cash',(g->>'token')::uuid,null); exception when others then blocked:=true; end;
  if not blocked then raise exception 'FAIL: expired table session accepted order'; end if;
  raise exception using errcode='PT001',message='TEST SUCCESS - ROLLBACK FIXTURES';
 exception when sqlstate 'PT001' then
  raise notice 'PASS: server prices, duplicate requests/payments, private data, branch/role isolation, order lifecycle, partial/over payments, loyalty and cash reconciliation. All fixtures rolled back.';
 end;
end $$;
select 'PASS - all operational assertions completed; test records rolled back' as result,
 (select count(*) from public.orders) as persistent_orders,
 (select count(*) from public.staff_members) as persistent_staff;
