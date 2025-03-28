export type Runtime = "CloudRun/FastApi" | "AgentEngine";
export type Framework = "langchain_agent" | "langgraph_agent" | "llamaindex_agent";
export type Industry = "finance" | "healthcare" | "retail";
export type Model = "claude-3-7-sonnet" | "claude-3-5-sonnet-v2" | "gemini-2.0-flash" | "gemini-1.5-pro" | "llama-3.3-70b-instruct-maas" | "llama-3.1-405b-instruct-maas";

export type AgentConfiguration = {
    name: string,
    description: string,
    runTime: Runtime,
    framework: Framework,
    industry: Industry,
    model: Model,
}