## Project structure

- backend/assets — all app content
- public — static client files
- src — main logic (controllers, routes, etc.)
- ./scripts - administrative/maintenance scripts

scripts/bulk-add-lessons.js - Bulk lesson JSON importer
scripts/lesson-status.js - Database status checker
scripts/add-lesson.js - lesson sample

run "npm run" and command below:
"lesson:add": "node scripts/bulk-add-lessons.js",
"lesson:status": "node scripts/lesson-status.js"

 npm start to run locally
