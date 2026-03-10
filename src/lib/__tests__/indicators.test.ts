import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchIndicators } from "../indicators";

describe("fetchIndicators", () => {
  const originalEnv = process.env.FRED_API_KEY;

  beforeEach(() => {
    delete process.env.FRED_API_KEY;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.FRED_API_KEY = originalEnv;
    }
  });

  it("returns available: false when FRED_API_KEY is not set", async () => {
    const result = await fetchIndicators();

    expect(result.available).toBe(false);
    expect(result.fedRate).toBeNull();
    expect(result.cpi).toBeNull();
    expect(result.dollarIndex).toBeNull();
    expect(result.fetchedAt).toBeDefined();
  });

  it("returns object with indicator values when FRED_API_KEY is set and fetch succeeds", async () => {
    process.env.FRED_API_KEY = "test-key";

    global.fetch = vi.fn((input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("FEDFUNDS")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              observations: [{ value: "4.33" }],
            }),
        } as Response);
      }
      if (url.includes("CPIAUCSL")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              observations: [{ value: "3.25" }],
            }),
        } as Response);
      }
      if (url.includes("DTWEXBGS")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              observations: [{ value: "105.42" }],
            }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown series"));
    });

    const result = await fetchIndicators();

    expect(result.available).toBe(true);
    expect(result.fedRate).toBe(4.33);
    expect(result.cpi).toBe(3.25);
    expect(result.dollarIndex).toBe(105.42);
    expect(result.fetchedAt).toBeDefined();
  });

  it("returns null for failed series while keeping available: true", async () => {
    process.env.FRED_API_KEY = "test-key";

    global.fetch = vi.fn((input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("FEDFUNDS")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              observations: [{ value: "4.33" }],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
      } as Response);
    });

    const result = await fetchIndicators();

    expect(result.available).toBe(true);
    expect(result.fedRate).toBe(4.33);
    expect(result.cpi).toBeNull();
    expect(result.dollarIndex).toBeNull();
    expect(result.fetchedAt).toBeDefined();
  });
});
