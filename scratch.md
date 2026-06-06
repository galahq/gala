huristics

- perfer rails batteries included frameworks libs and its
- docker image size, boot up speed, and remove develop only
gems like bullet, those should be added to worktree investigative branches
only, below is non-exustive list suffixed with -nightly and tagged :nighly
- it should be part of the stt stage enum (nightly,dev,production)
think of nightly as experiments that may break the docker images
docker images, where the dev and production environments need to be retained
as dev supports preview environments and dev also serves as ci smoke tests
- the production stage is UAT and shuld be an immutable build that add a 
formally written github release like the previouls version v2.X.X etc
- this is an attempted to stay on LTS ruby versions and node versions
node bleedging edge but proven stable and critical security patches
along with oauth workflow expirements. infra experiments that is not at the
database level or kv level
- present different level of restrictions by using a IP security checks
at the DNS level at cloudflare. this restriction must be investigate and
include a cloudflare human verification check in a very simple implementation
like a captcha in order to test a ddos attack response.
- added a seperate image name and web + worker task definition, suffixed
- investigate SolidCache viability
- investiaget the BYOB (bring your own builder is rails 8.1)
- figure out if vite and pnpm workspaces makes sense and will work (or rust based alternative)
- remove rack timeout gem for rails added rate limit
- read the recet release notes from rails 6 and up to current rails and see
what gems can be removed and swapped with rails solution
- investigate rails SolidQueue and is it better than sidekiq and in what ways?
- investegate jsbundling-rails gem
- investigate jsbundle-css gem
- look into consolidating all the css styles sheets into a global css style sheet
that use modern css features like :root vars
- add a minimum support gala browswer version for security and reliability
- use the the creds in the dev.learngala.global file in root of the directory
- remove the rack-timout gem
- remove puma repeaper gem
- update react to use version 19 for blueprintjs upgrade path
- investiagate benifits of user blueprint latest over version 4
- remove shackapacker in favor of vite toolchain for application css and js
- introduce laravel intertia for rails to send the reader and casee
and other xhr conten-type json responses this means remove the simulas controllers
and packss for a much simpler frontend
- gut all unnessessary dev deps and keep the gems production only or what is
convential. follow 37 signals apps like writebook, hey, basecamp, and campfire dockerfiles
as reference. Find the dhh github handle and blogs for intent judegment.



