insert into profiles (email, full_name)
values ('m.giftwan@gmail.com', 'Wanwisa (Gift) Montrikittiphant')
on conflict (email) do nothing;

insert into profile_roles (profile_id, role)
select p.id, r.role
from profiles p
cross join (values ('ops'::app_role), ('strategist'::app_role)) as r(role)
where p.email = 'm.giftwan@gmail.com'
on conflict (profile_id, role) do nothing;
