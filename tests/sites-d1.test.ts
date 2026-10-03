import assert from "node:assert/strict";
import test from "node:test";
import { Miniflare } from "miniflare";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { projectStore } from "../app/lib/builder-store";
import { createDeviceProject, selectProjectArchitecture } from "../app/lib/builder-engine";
import { devices } from "../app/lib/data";
import type { ProjectDatabase } from "../db/project-database";

test("actual local D1: batch persistence, restart, owner isolation and restore",async()=>{
 const directory=mkdtempSync(join(tmpdir(),"smartdevices-local-d1-"));
 const options={modules:true,script:'export default { fetch() { return new Response("local-test"); } }',compatibilityDate:"2026-05-15",d1Databases:{DB:"isolated-test-db"},d1Persist:directory};
 let runtime=new Miniflare(options);
 try {
  let database=await runtime.getD1Database("DB");
  const journal=JSON.parse(readFileSync("drizzle/meta/_journal.json","utf8"));
  for(const migration of journal.entries)for(const statement of readFileSync(`drizzle/${migration.tag}.sql`,"utf8").split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await database.prepare(statement).run();
  let store=projectStore(database as unknown as ProjectDatabase);
  const original=createDeviceProject("SYNTHETIC D1 TEST: monitor freezer temperature",{environment:"indoor",power:"usb",connectivity:"wifi",deploymentIntent:"auto",quantity:1,goal:"functional-prototype",budget:"30-75"},devices);
  const saved=await store.save(original,"sites:synthetic-a");
  assert.equal((await store.list("sites:synthetic-a"))[0].id,saved.id);
  assert.equal(await store.read(saved.id,"sites:synthetic-b"),null);
  await assert.rejects(store.save({...saved,revision:2},"sites:synthetic-b",true),/NOT_FOUND/);
  const revised=await store.save(selectProjectArchitecture(saved,"production-minded"),"sites:synthetic-a",true);
  await runtime.dispose();
  runtime=new Miniflare(options);database=await runtime.getD1Database("DB");store=projectStore(database as unknown as ProjectDatabase);
  assert.deepEqual(await store.read(saved.id,"sites:synthetic-a"),revised);
  const backup=await store.exportProject(saved.id,"sites:synthetic-a");
  const restored=await store.restoreProject(backup,"sites:synthetic-b");
  assert.notEqual(restored.id,saved.id);assert.equal(restored.revision,revised.revision);
  assert.equal(await store.read(restored.id,"sites:synthetic-a"),null);
 } finally {await runtime.dispose();rmSync(directory,{recursive:true,force:true});}
});
