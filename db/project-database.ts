/** Minimal D1 SQL contract; portable to a transactional SQLite adapter. */
export interface ProjectStatement {
  bind(...values: (string|number|null)[]): ProjectStatement;
  first<T>(): Promise<T|null>;
  all<T>(): Promise<{results:T[]}>;
}
export interface ProjectDatabase {
  prepare(sql:string): ProjectStatement;
  batch(statements:ProjectStatement[]): Promise<{meta:{changes:number}}[]>;
}
export async function getProjectDatabase(): Promise<ProjectDatabase> {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("D1_UNAVAILABLE");
  return env.DB as unknown as ProjectDatabase;
}
