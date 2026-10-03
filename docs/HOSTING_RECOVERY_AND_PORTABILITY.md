# Hosting recovery and portability

## Application-level project backup
Signed-in owner: Saved projects → Export project and revisions. `/api/builder/export?id=...` uses owner-scoped SQL and downloads `smartdevices-project-backup-v1`. It contains validated project manifests and revision history, no server credentials or subject headers. Private/no-store/noindex responses prevent public caching.

Keep backups outside the hosting platform. GitHub contains schema, migrations, build scripts, storage/auth boundaries and deployment documentation. Build Pack remains a portable design export; it is not a full application/database backup.

Restore through Saved projects → Project backup JSON. The authenticated owner receives a **new** project ID. Old ownership/permissions are never imported; immutable revisions retain their content. Maximum 2 MB/100 revisions per file. Invalid order/schema is rejected. Database failures are honest; multi-revision imports currently commit one revision at a time, so an interrupted import can leave an incomplete new copy. Inspect before retrying. This is a known production-readiness limitation, not an atomic whole-database restore claim.

## Performed local recovery rehearsal
`node --import tsx tests/sites-persistence.test.ts` uses real SQLite files/schema, not browser storage or fixture reads: create two revisions as synthetic A; export; restore into another freshly migrated DB as synthetic B; verify both revisions, new ID, content, and account isolation. A separate file-backed test closes and reopens the connection and reads the original saved project. These are local database proofs, not a completed hosted recovery or redeploy test.

## Whole-database backup
The available Sites connector exposes bounded read-only database overview/rows; it does not expose full SQL dump, restore, or destructive reset. No production backup capability is assumed. Before production adoption, obtain a supported consistent full-D1 export/snapshot and a verified restore path, retention policy, recovery point objective and recovery time objective. The database viewer is inspection, not a certified backup.

A platform outage can be recovered for previously exported Builder projects using GitHub + exports + a SQLite/D1 adapter + replacement identity provider. It cannot recover unexported records. Consequently whole-platform disaster recovery is NOT yet certified.

## Reconstruct elsewhere
1. Check out the recorded GitHub SHA and install its lockfile.
2. Create a clean isolated SQLite/D1 database; apply existing migration journal order exactly once. `scripts/verify-migrations.py` rehearses fresh, registry-first and market-first histories.
3. Bind through `db/project-database.ts`; preserve transactional batches and prepared statements.
4. Replace Sites identity adapter with verified provider sessions and explicitly map old subjects only with proof. Site-scoped IDs cannot be assumed stable across Sites/hosts.
5. Import exported project histories as new private copies using the authenticated restore path; compare revisions and independent exports.
6. Restore only required server configuration, generating new secrets; run authorization/recovery suites and browser acceptance before routing users.

## Rollback
For application-only regressions, redeploy the previous saved Site version on the **same Site and DB binding**. Keep additive schema/data. Do not delete DBs, change project_id, replay historical migrations, or roll back schema destructively. Verify `/api/version`, read projects, and check error logs. An application rollback does not roll back data. Record both source commit and environment revision for each release. A rolled-back older reader must understand current schema before use.

If data corruption occurs, stop writes using a separately reviewed maintenance policy, preserve a snapshot, and restore into a new isolated database before any replacement. No reset endpoint or remote destructive operation was added here.
