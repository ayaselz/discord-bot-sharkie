export const name = "hello";
export const description = "Say hello";

export interface CommandResponse {
  type: 4;
  data: {
    content: string;
  };
}

export function handle(): CommandResponse {
  return {
    type: 4,
    data: { content: "Hello from Agent Sharkie 🦈" }
  };
}