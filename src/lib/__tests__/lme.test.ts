import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchLMEInventory } from "../lme";

describe("fetchLMEInventory", () => {
  const originalEnv = process.env.NASDAQ_DATA_LINK_KEY;

  beforeEach(() => {
    delete process.env.NASDAQ_DATA_LINK_KEY;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.NASDAQ_DATA_LINK_KEY = originalEnv;
    }
  });

  it("should return unavailable when NASDAQ_DATA_LINK_KEY is not set", async () => {
    const result = await fetchLMEInventory();

    expect(result.available).toBe(false);
    expect(result.reason).toContain("Nasdaq Data Link subscription required");
    expect(result.fetchedAt).toBeDefined();
    expect(result.items).toBeUndefined();
  });

  it("should return unavailable when fetch fails", async () => {
    process.env.NASDAQ_DATA_LINK_KEY = "test-key";

    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchLMEInventory();

    expect(result.available).toBe(false);
    expect(result.reason).toContain("Failed to fetch LME inventory data");
    expect(result.fetchedAt).toBeDefined();
  });
});
