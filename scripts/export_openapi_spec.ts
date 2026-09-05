/**
 * OpenAPI 3.1.0 Exporter
 */
export function generateOpenAPISpec() {
  return {
    openapi: "3.1.0",
    info: { title: "Kridge Gateway API", version: "1.0.0" },
    paths: {
      "/api/proxy/v1/chat/completions": { post: { summary: "Chat completions" } },
      "/api/agent/listings": { get: { summary: "List active offers" } }
    }
  };
}
