-- Supabase SQL Editor에서 실행하세요

-- 거래 내역 테이블
create table if not exists transactions (
  id          uuid primary key,
  type        text not null check (type in ('income', 'expense')),
  amount      integer not null check (amount > 0),
  category    text not null,
  description text not null,
  date        date not null,
  created_at  timestamptz not null default now()
);

-- 예산 테이블
create table if not exists budgets (
  id         bigserial primary key,
  category   text not null,
  amount     integer not null check (amount > 0),
  month      text not null,
  created_at timestamptz not null default now(),
  unique (category, month)
);

-- 반복 내역 테이블
create table if not exists recurring (
  id           uuid primary key,
  type         text not null check (type in ('income', 'expense')),
  amount       integer not null check (amount > 0),
  category     text not null,
  description  text not null,
  day_of_month integer not null check (day_of_month between 1 and 31),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- RLS 비활성화 (혼자 쓰는 앱)
alter table transactions disable row level security;
alter table budgets disable row level security;
alter table recurring disable row level security;
