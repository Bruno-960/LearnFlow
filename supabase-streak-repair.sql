-- Use este arquivo apenas para conferir e restaurar uma sequencia zerada por engano.
-- Primeiro rode o SELECT, encontre seu perfil e depois ajuste o UPDATE com o valor correto.

select
  id,
  name,
  streak_days,
  last_study_date,
  last_activity_at,
  updated_at
from public.profiles
order by updated_at desc;

-- Depois que o schema novo estiver aplicado, confira tambem os dias registrados no historico.
select
  activity_date,
  activity_type,
  subject_name,
  module_title,
  count(*) as activity_count
from public.user_activity_log
group by activity_date, activity_type, subject_name, module_title
order by activity_date desc, activity_type;

-- Troque <PROFILE_ID> pelo id do seu perfil e <DIAS_CORRETOS> pela sequencia anterior.
-- Exemplo de data: se voce estudou hoje, deixe current_date. Se nao, use '2026-05-27'::date.
/*
update public.profiles
set
  streak_days = <DIAS_CORRETOS>,
  last_study_date = (now() at time zone 'America/Bahia')::date,
  last_activity_at = now(),
  updated_at = now()
where id = '<PROFILE_ID>';
*/
