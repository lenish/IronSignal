import { describe, it, expect, vi, beforeEach } from "vitest";

describe("fetchFXRates", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns rates object with required fields", async () => {
    const mockResponse = {
      chart: { result: [{ meta: { regularMarketPrice: 7.24 } }] },
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    const { fetchFXRates } = await import("@/lib/fx");
    const rates = await fetchFXRates();
    expect(rates).toHaveProperty("usdcny");
    expect(rates).toHaveProperty("usdaud");
    expect(rates).toHaveProperty("dxy");
    expect(rates).toHaveProperty("fetchedAt");
  });
});
