import { describe, it, expect } from "vitest";
import {
  isRelevantToCommodities,
  calculateRelevanceScore,
} from "@/lib/config";

describe("isRelevantToCommodities", () => {
  it("filters NFL article (sports negative keyword)", () => {
    expect(
      isRelevantToCommodities("NFL Dolphins paying $99M to get player off team")
    ).toBe(false);
  });

  it("filters iPhone article (consumer tech negative keyword)", () => {
    expect(
      isRelevantToCommodities(
        "Apple tracking rules rejected as iPhone sales surge"
      )
    ).toBe(false);
  });

  it("filters Bitcoin article (crypto negative)", () => {
    expect(
      isRelevantToCommodities("Bitcoin surges above $100k amid ETF approval")
    ).toBe(false);
  });

  it("passes iron ore article", () => {
    expect(
      isRelevantToCommodities("Iron ore price rally on China demand")
    ).toBe(true);
  });

  it("passes gold mine article", () => {
    expect(isRelevantToCommodities("Gold mine discovery in Nevada")).toBe(true);
  });

  it("commodity keyword overrides negative (Goldman copper fund)", () => {
    expect(
      isRelevantToCommodities("Goldman Sachs launches copper hedge fund")
    ).toBe(true);
  });

  it("passes general financial news (no commodity, no negative)", () => {
    expect(isRelevantToCommodities("US GDP growth slows to 1.2% in Q4")).toBe(
      true
    );
  });
});

describe("calculateRelevanceScore", () => {
  it("iron ore article from Mining.com scores high", () => {
    const score = calculateRelevanceScore(
      "Iron ore price rally on China demand",
      "",
      "Mining.com"
    );
    expect(score).toBeGreaterThan(0.7);
  });

  it("gold article scores above base", () => {
    const score = calculateRelevanceScore("Gold bullion rally", "");
    expect(score).toBeGreaterThan(0.5);
  });

  it("NFL article scores below base", () => {
    const score = calculateRelevanceScore("NFL Dolphins paying $99M", "");
    expect(score).toBeLessThan(0.3);
  });
});
