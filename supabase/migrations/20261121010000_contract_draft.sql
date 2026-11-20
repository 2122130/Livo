-- =====================================================================
-- Livo: 契約書(頭書)の書きかけを保存する
-- Supabase の SQL Editor にこのファイルの中身を丸ごと貼って「Run」する。
-- (先に 20261121000000_rireki_koumoku.sql を実行してあること)
-- =====================================================================

create table if not exists public.t600_contract_draft (
  draft_id        uuid primary key default gen_random_uuid(),
  org_id          text not null,
  room_id         text not null,
  tenancy_key     text not null default '',      -- 入居ID(入居が無いときは空)
  sheet_type      text not null check (sheet_type in ('house','store')),
  layout_version  text not null,
  values          jsonb not null default '{}'::jsonb,
  update_account  text,
  update_date     timestamptz not null default now()
);

create unique index if not exists t600_room_tenancy_type_uq
  on public.t600_contract_draft (room_id, tenancy_key, sheet_type);

alter table public.t600_contract_draft enable row level security;

drop policy if exists t600_select_own_org on public.t600_contract_draft;
create policy t600_select_own_org on public.t600_contract_draft
  for select to authenticated using (org_id = public.livo_my_org());

drop policy if exists t600_insert_own_org on public.t600_contract_draft;
create policy t600_insert_own_org on public.t600_contract_draft
  for insert to authenticated with check (org_id = public.livo_my_org());

drop policy if exists t600_update_own_org on public.t600_contract_draft;
create policy t600_update_own_org on public.t600_contract_draft
  for update to authenticated
  using (org_id = public.livo_my_org())
  with check (org_id = public.livo_my_org());

drop policy if exists t600_delete_own_org on public.t600_contract_draft;
create policy t600_delete_own_org on public.t600_contract_draft
  for delete to authenticated using (org_id = public.livo_my_org());
