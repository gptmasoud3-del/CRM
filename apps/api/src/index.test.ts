import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./index.js";

describe("CRM API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it("rejects protected endpoints without authentication", async () => {
    const response = await request(app).get("/api/customers");
    expect(response.status).toBe(401);
  });
});
