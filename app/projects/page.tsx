import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { BuilderAccount } from "@/app/components/BuilderAccount";
import { SiteHeader } from "@/app/components/SiteHeader";
import { listHostedProjects } from "@/app/lib/builder-store";
import { RestoreProject } from "@/app/components/RestoreProject";
export const dynamic="force-dynamic";
export const metadata={title:"Saved Builder projects",robots:{index:false,follow:false}};
export default async function ProjectsPage() {
 const user=await requireChatGPTUser("/projects");
 const projects=await listHostedProjects(user.subject!).catch(()=>null);
 return <><SiteHeader /><main className="page-main narrow-page"><BuilderAccount /><h1>Saved projects</h1><p>Synthetic test projects saved to this environment. Only your account can access them.</p><a href="/build">Create a project</a>{projects===null?<p role="alert">Project storage is unavailable. No empty-state success is implied; please retry.</p>:<ul className="saved-project-list">{projects.map(project=><li key={project.id}><a href={`/project/${project.id}`}>{project.title}</a><p>{project.idea}</p><a href={`/api/builder/export?id=${encodeURIComponent(project.id)}`} download>Export project and revisions</a></li>)}</ul>}{projects?.length===0?<p>No saved projects yet.</p>:null}<RestoreProject /></main></>;
}
