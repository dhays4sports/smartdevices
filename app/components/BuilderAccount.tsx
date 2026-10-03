import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
export async function BuilderAccount() {
  const user = await getChatGPTUser();
  return <nav className="builder-account" aria-label="Builder account">{user ? <><span>Signed in as {user.displayName}</span><a href="/projects">Saved projects</a><a href={chatGPTSignOutPath("/build")} target="_top">Sign out</a></> : <a href={chatGPTSignInPath("/build")} target="_top">Sign in with ChatGPT to save projects</a>}</nav>;
}
