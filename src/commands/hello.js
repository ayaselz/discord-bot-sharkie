export const name = "hello";
export const description = "Say hello";

export function handle() {
  return {
    type: 4,
    data: { content: "Hello from Agent Sharkie 🦈" }
  };
}