-- schema.sql — run once against the Neon database
-- (Neon dashboard -> SQL Editor -> paste -> Run).

create table if not exists my_list (
  visitor_id  text        not null,
  movie_id    integer     not null,
  created_at  timestamptz not null default now(),
  primary key (visitor_id, movie_id)
);
