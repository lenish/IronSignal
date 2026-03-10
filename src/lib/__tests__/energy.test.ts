import { describe, it, expect } from "vitest";
import { fetchEnergyPrices } from "../energy";

describe("fetchEnergyPrices", () => {
  it("should return an array of energy prices with required fields", async () => {
    const prices = await fetchEnergyPrices();

    expect(Array.isArray(prices)).toBe(true);
    expect(prices.length).toBeGreaterThan(0);

    prices.forEach((price) => {
      expect(price).toHaveProperty("symbol");
      expect(price).toHaveProperty("name");
      expect(price).toHaveProperty("price");
      expect(price).toHaveProperty("change");
      expect(price).toHaveProperty("changePercent");
      expect(price).toHaveProperty("unit");
      expect(price).toHaveProperty("fetchedAt");

      expect(typeof price.symbol).toBe("string");
      expect(typeof price.name).toBe("string");
      expect(typeof price.price).toBe("number");
      expect(typeof price.change).toBe("number");
      expect(typeof price.changePercent).toBe("number");
      expect(typeof price.unit).toBe("string");
      expect(typeof price.fetchedAt).toBe("string");
    });
  });
});
