-- Grip On: Round 2 contact details and copy cleanup.

alter table public.settings
  add column if not exists contact_phone text not null default '0660488468';

alter table public.settings
  alter column contact_email set default 'grip.on.za@gmail.com';

alter table public.settings
  alter column instagram_url set default 'https://instagram.com/griponza';

alter table public.settings
  alter column contact_phone set default '0660488468';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'settings_contact_phone_format'
      and conrelid = 'public.settings'::regclass
  ) then
    alter table public.settings
      add constraint settings_contact_phone_format
      check (contact_phone ~ '^0[0-9]{9}$');
  end if;
end
$$;

update public.settings
set
  contact_email = 'grip.on.za@gmail.com',
  contact_phone = '0660488468',
  instagram_url = 'https://instagram.com/griponza',
  announcement_text = regexp_replace(announcement_text, '\s*' || chr(8212) || '\s*', ', ', 'g'),
  maintenance_message = regexp_replace(maintenance_message, '\s*' || chr(8212) || '\s*', ', ', 'g'),
  updated_at = now()
where id = true;

update public.admin_settings
set whatsapp_number = '+27660488468', updated_at = now()
where id = true and whatsapp_number is null;

update public.products
set
  tagline = nullif(regexp_replace(tagline, '\s*' || chr(8212) || '\s*', ', ', 'g'), ''),
  description = nullif(regexp_replace(description, '\s*' || chr(8212) || '\s*', ', ', 'g'), ''),
  details = (
    select coalesce(array_agg(regexp_replace(detail, '\s*' || chr(8212) || '\s*', ', ', 'g') order by position), '{}'::text[])
    from unnest(details) with ordinality as entry(detail, position)
  )
where tagline like '%' || chr(8212) || '%'
   or description like '%' || chr(8212) || '%'
   or exists (select 1 from unnest(details) as entry(detail) where detail like '%' || chr(8212) || '%');

update public.collections
set description = nullif(regexp_replace(description, '\s*' || chr(8212) || '\s*', ', ', 'g'), '')
where description like '%' || chr(8212) || '%';

update public.discount_codes
set description = nullif(regexp_replace(description, '\s*' || chr(8212) || '\s*', ', ', 'g'), '')
where description like '%' || chr(8212) || '%';
