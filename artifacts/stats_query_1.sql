 WITH params(case_slug, from_ts, to_ts) AS (
   VALUES ($1::text, $2::timestamp, $3::timestamp)
 )
 SELECT
   v.country                                                       AS country,
   MIN(e."time")                                                   AS first_event,
   MAX(e."time")                                                   AS last_event,
   MAX(c.published_at)                                             AS case_published_at,
   COUNT(DISTINCT v.visitor_token)                                 AS unique_visits,
   COUNT(DISTINCT e.user_id)                                       AS unique_users,
   COUNT(*)                                                        AS events_count,
   COUNT(DISTINCT d.id)                                            AS deployments_count,
   COUNT(CASE WHEN e.name = 'visit_podcast' THEN 1 END)            AS visit_podcast_count,
   COUNT(CASE WHEN e.name = 'visit_edgenote' THEN 1 END)           AS visit_edgenote_count,
   COUNT(CASE WHEN e.name = 'visit_page' THEN 1 END)               AS visit_page_count,
   COUNT(CASE WHEN e.name = 'visit_element' THEN 1 END)            AS visit_element_count,
   COUNT(CASE WHEN e.name = 'read_quiz' THEN 1 END)                AS read_quiz_count,
   COUNT(CASE WHEN e.name = 'read_overview' THEN 1 END)            AS read_overview_count,
   COUNT(CASE WHEN e.name = 'read_card' THEN 1 END)                AS read_card_count,
   COUNT(CASE WHEN e.name = 'write_comment' THEN 1 END)            AS write_comment_count,
   COUNT(CASE WHEN e.name = 'write_comment_thread' THEN 1 END)     AS write_comment_thread_count,
   COUNT(CASE WHEN e.name = 'write_quiz_submission' THEN 1 END)    AS write_quiz_submission_count
 FROM ahoy_events e
 INNER JOIN cases c ON c.slug = e.properties ->> 'case_slug'
 LEFT JOIN deployments d ON d.case_id = c.id
 INNER JOIN params p ON TRUE
 INNER JOIN visits v ON v.id = e.visit_id
 WHERE (e.properties ->> 'case_slug') = p.case_slug
   AND e."time" BETWEEN p.from_ts AND p.to_ts
   AND NOT EXISTS (
     SELECT 1
     FROM readers_roles rr
     JOIN roles ro ON ro.id = rr.role_id
     WHERE rr.reader_id = e.user_id AND ro.name = 'invisible'
   )
 GROUP BY v.country
 ORDER BY unique_visits DESC NULLS LAST
   [["case_slug", "echoes-of-elevation"], ["from_ts", "2025-07-29 00:00:00"], ["to_ts", "2025-10-19 00:00:00"]]