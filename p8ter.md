---
p8t_version: 1
generated_at: 2026-06-06T03:14:39+00:00
base_url_env: PLAYWRIGHT_BASE_URL
default_base_url: http://localhost:3000
screenshot_mode: compare
viewport: desktop
route_command: bin/rails routes
target:
---

# p8ter.md

Sticky route tape for Playwright visual regression. Curate before playback.

| group | name | verb | path | controller_action | sample_path | state | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| app | card_statistics | GET | /cards/:card_id/statistics | statistics#show | /cards/sample-card-id/statistics | needs-data | seed route data before enabling |
| app | comment_thread | GET | /comment_threads/:id | comment_threads#show | /comment_threads/1 | needs-data | seed route data before enabling |
| app | edgenote_link_expansion | GET | /edgenotes/:edgenote_slug/link_expansion | edgenotes/link_expansions#show | /edgenotes/sample-edgenote-slug/link_expansion | needs-data | seed route data before enabling |
| app | edgenote_statistics | GET | /edgenotes/:edgenote_slug/statistics | statistics#show | /edgenotes/sample-edgenote-slug/statistics | needs-data | seed route data before enabling |
| app | podcast_statistics | GET | /podcasts/:podcast_id/statistics | statistics#show | /podcasts/sample-podcast-id/statistics | needs-data | seed route data before enabling |
| content | root | GET | / | catalog#home | / | ready | baseline captured |
| content | case_library_requests | GET | /case_library_requests | case_library_requests#index | /case_library_requests | ready | baseline captured |
| content | cases | GET | /cases | cases#index | /cases | ready | baseline captured |
| content | cases_show {react_router_location: /[^.]+/} | GET | /cases/:case_slug(/*react_router_location) | cases#show {react_router_location: /[^.]+/} | /cases/sample-case-slug(/*react_router_location) | needs-data | seed route data before enabling |
| content | case_archive | GET | /cases/:case_slug/archive | archives#show | /cases/sample-case-slug/archive | needs-data | seed route data before enabling |
| content | case_comment_threads | GET | /cases/:case_slug/comment_threads | comment_threads#index | /cases/sample-case-slug/comment_threads | needs-data | seed route data before enabling |
| content | case_confirm_deletion | GET | /cases/:case_slug/confirm_deletion | cases/deletions#new | /cases/sample-case-slug/confirm_deletion | needs-data | seed route data before enabling |
| content | new_case_editorship | GET | /cases/:case_slug/editorships/new | editorships#new | /cases/sample-case-slug/editorships/new | needs-data | seed route data before enabling |
| content | case_forums | GET | /cases/:case_slug/forums | forums#index | /cases/sample-case-slug/forums | needs-data | seed route data before enabling |
| content | case_locks | GET | /cases/:case_slug/locks | locks#index | /cases/sample-case-slug/locks | needs-data | seed route data before enabling |
| content | edit_case_settings | GET | /cases/:case_slug/settings/edit | cases/settings#edit | /cases/sample-case-slug/settings/edit | needs-data | seed route data before enabling |
| content | case_stats | GET | /cases/:case_slug/stats | cases/stats#show | /cases/sample-case-slug/stats | needs-data | seed route data before enabling |
| content | overview_case_stats | GET | /cases/:case_slug/stats/overview | cases/stats#overview | /cases/sample-case-slug/stats/overview | needs-data | seed route data before enabling |
| content | case_translation | GET | /cases/:case_slug/translations/:case_locale | translations#show | /cases/sample-case-slug/translations/sample-case-locale | needs-data | seed route data before enabling |
| content | new_case_translation | GET | /cases/:case_slug/translations/new | translations#new | /cases/sample-case-slug/translations/new | needs-data | seed route data before enabling |
| content | case | GET | /cases/:slug | cases#show | /cases/sample-case | needs-data | seed route data before enabling |
| content | copy_case | GET | /cases/:slug/copy | cases#copy | /cases/sample-case/copy | needs-data | seed route data before enabling |
| content | edit_case | GET | /cases/:slug/edit | cases#edit | /cases/sample-case/edit | needs-data | seed route data before enabling |
| content | features | GET | /cases/features | cases/features#index | /cases/features | ready | baseline captured |
| content | catalog | GET | /catalog/*react_router_location | catalog#home {react_router_location: /[^.]+/} | /catalog/*react_router_location | ready | baseline captured |
| content | catalog_languages | GET | /catalog/languages | catalog/languages#index | /catalog/languages | ready | baseline captured |
| content | my_cases | GET | /my_cases | my_cases#index | /my_cases | ready | baseline captured |
| score | case_quizzes | GET | /cases/:case_slug/quizzes | quizzes#index | /cases/sample-case-slug/quizzes | needs-data | seed route data before enabling |
| score | quiz | GET | /quizzes/:id | quizzes#show | /quizzes/1 | needs-data | seed route data before enabling |
| score | quiz_submissions | GET | /quizzes/:quiz_id/submissions | submissions#index | /quizzes/sample-quiz-id/submissions | needs-data | seed route data before enabling |
