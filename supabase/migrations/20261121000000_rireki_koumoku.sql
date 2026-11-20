-- =====================================================================
-- Livo: 変更履歴(上書きしない) と 追加項目(自分で足せる項目)
-- Supabase の SQL Editor にこのファイルの中身を丸ごと貼って「Run」する。
-- 何度実行しても壊れないように書いてある。
-- =====================================================================

-- ---------------------------------------------------------------
-- 0. 共通: ログイン中の人の組織ID・権限を返す
-- ---------------------------------------------------------------
create or replace function public.livo_my_org()
returns text
language sql stable security definer set search_path = public
as $$
  select org_id::text from public.m110_account
  where auth_user_id = auth.uid() and mukou_kbn = 0
  limit 1
$$;

create or replace function public.livo_my_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.m110_account
  where auth_user_id = auth.uid() and mukou_kbn = 0
  limit 1
$$;

-- ---------------------------------------------------------------
-- 1. 変更履歴テーブル(追記専用。更新・削除はできない)
-- ---------------------------------------------------------------
create table if not exists public.t900_change_history (
  history_id  uuid primary key default gen_random_uuid(),
  org_id      text,
  table_name  text not null,
  record_id   text not null,
  operation   text not null,          -- INSERT / UPDATE / DELETE
  old_data    jsonb,
  new_data    jsonb,
  changed_by  text,
  changed_at  timestamptz not null default now()
);
create index if not exists t900_record_idx on public.t900_change_history (record_id, changed_at desc);
create index if not exists t900_org_idx on public.t900_change_history (org_id, changed_at desc);

alter table public.t900_change_history enable row level security;

drop policy if exists t900_select_own_org on public.t900_change_history;
create policy t900_select_own_org on public.t900_change_history
  for select to authenticated
  using (org_id = public.livo_my_org());
-- insert/update/delete のポリシーは作らない = 画面からは書き換え不可。
-- 書き込みは下のトリガー(security definer)だけが行う。

-- 記録用トリガー関数
--   TG_ARGV[0] = 主キーの列名
--   TG_ARGV[1] = (任意) org_id を持たない詳細テーブルの場合の親テーブル名
create or replace function public.livo_record_history()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  pk_col     text := TG_ARGV[0];
  parent_tbl text := case when TG_NARGS > 1 then TG_ARGV[1] else null end;
  old_j      jsonb := case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) else null end;
  new_j      jsonb := case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) else null end;
  base_j     jsonb := coalesce(new_j, old_j);
  rec_id     text  := base_j ->> pk_col;
  v_org      text  := base_j ->> 'org_id';
  who        text;
begin
  -- 日時の列以外に何も変わっていなければ記録しない
  if TG_OP = 'UPDATE' and
     (old_j - 'update_date' - 'update_at' - 'updated_at')
       = (new_j - 'update_date' - 'update_at' - 'updated_at') then
    return NEW;
  end if;

  if v_org is null and parent_tbl is not null then
    begin
      execute format('select org_id::text from public.%I where %I::text = $1', parent_tbl, pk_col)
        into v_org using (base_j ->> pk_col);
    exception when others then
      v_org := null;
    end;
  end if;

  who := coalesce(new_j ->> 'update_account', new_j ->> 'create_account',
                  old_j ->> 'update_account', old_j ->> 'create_account');
  if TG_OP = 'INSERT' then
    who := coalesce(new_j ->> 'create_account', who);
  end if;

  insert into public.t900_change_history
    (org_id, table_name, record_id, operation, old_data, new_data, changed_by)
  values
    (v_org, TG_TABLE_NAME, rec_id, TG_OP, old_j, new_j, who);

  return coalesce(NEW, OLD);
end;
$$;

-- 対象テーブルにトリガーを付ける
do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('m200_rent_bukken',            'bukken_id', null),
      ('m210_rent_room',              'room_id',   null),
      ('t250_rent_room_tenancy',      'tenancy_id',null),
      ('m300_sale_bukken',            'bukken_id', null),
      ('m301_sale_bukken_mansion',    'bukken_id', 'm300_sale_bukken'),
      ('m302_sale_bukken_apartment',  'bukken_id', 'm300_sale_bukken'),
      ('m303_sale_bukken_house',      'bukken_id', 'm300_sale_bukken'),
      ('m304_sale_bukken_land',       'bukken_id', 'm300_sale_bukken'),
      ('t500_taiou_rireki',           'taiou_id',  null)
    ) as v(tbl, pk, parent)
  loop
    if to_regclass('public.' || t.tbl) is null then
      raise notice 'skip: % が見つからない', t.tbl;
      continue;
    end if;
    execute format('drop trigger if exists livo_history on public.%I', t.tbl);
    if t.parent is null then
      execute format(
        'create trigger livo_history after insert or update or delete on public.%I
           for each row execute function public.livo_record_history(%L)', t.tbl, t.pk);
    else
      execute format(
        'create trigger livo_history after insert or update or delete on public.%I
           for each row execute function public.livo_record_history(%L, %L)', t.tbl, t.pk, t.parent);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------
-- 2. 追加項目(会社ごとに自分で項目を足せる)
-- ---------------------------------------------------------------
create table if not exists public.m950_custom_field (
  field_id       uuid primary key default gen_random_uuid(),
  org_id         text not null,
  target         text not null check (target in ('rental','room','sale')),
  label          text not null,
  field_type     text not null default 'text' check (field_type in ('text','number','date','textarea')),
  sort_order     int  not null default 0,
  mukou_kbn      int  not null default 0,
  create_date    timestamptz not null default now(),
  create_account text
);
create index if not exists m950_org_target_idx on public.m950_custom_field (org_id, target, sort_order);

alter table public.m950_custom_field enable row level security;

drop policy if exists m950_select_own_org on public.m950_custom_field;
create policy m950_select_own_org on public.m950_custom_field
  for select to authenticated
  using (org_id = public.livo_my_org());

drop policy if exists m950_insert_admin on public.m950_custom_field;
create policy m950_insert_admin on public.m950_custom_field
  for insert to authenticated
  with check (org_id = public.livo_my_org() and public.livo_my_role() in ('admin','system'));

drop policy if exists m950_update_admin on public.m950_custom_field;
create policy m950_update_admin on public.m950_custom_field
  for update to authenticated
  using (org_id = public.livo_my_org() and public.livo_my_role() in ('admin','system'))
  with check (org_id = public.livo_my_org());

-- 追加項目の値を入れる箱(項目ID → 値)
alter table public.m200_rent_bukken add column if not exists custom_fields jsonb not null default '{}'::jsonb;
alter table public.m210_rent_room   add column if not exists custom_fields jsonb not null default '{}'::jsonb;
alter table public.m300_sale_bukken add column if not exists custom_fields jsonb not null default '{}'::jsonb;
