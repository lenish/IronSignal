import { describe, it, expect } from "vitest";
import { classifyCommodity } from "@/lib/config";

describe("classifyCommodity", () => {
  it('should classify "iron ore prices surge" as iron', () => {
    const result = classifyCommodity("iron ore prices surge");
    expect(result).toBe("iron");
  });

  it('should classify "copper cathode demand rises" as copper', () => {
    const result = classifyCommodity("copper cathode demand rises");
    expect(result).toBe("copper");
  });

  it('should classify "gold bullion rally" as gold', () => {
    const result = classifyCommodity("gold bullion rally");
    expect(result).toBe("gold");
  });

  it('should classify "Apple releases new iPhone" as general (no commodity keyword)', () => {
    const result = classifyCommodity("Apple releases new iPhone");
    expect(result).toBe("general");
  });

  it('should classify "Silver Lake Technology raises $2B" - may return silver due to keyword match in company name', () => {
    // NOTE: This is a known edge case. The word "silver" appears in the company name "Silver Lake Technology",
    // so the current implementation returns "silver" even though this is not about the commodity.
    // This is acceptable behavior for now and documents the limitation.
    const result = classifyCommodity("Silver Lake Technology raises $2B");
    expect(result).toBe("silver");
  });

  it("should handle description parameter in classification", () => {
    const result = classifyCommodity(
      "Market Update",
      "Copper prices hit new highs today"
    );
    expect(result).toBe("copper");
  });

  it("should be case-insensitive", () => {
    const result = classifyCommodity("IRON ORE PRICES SURGE");
    expect(result).toBe("iron");
  });

  it("should classify aluminium correctly", () => {
    const result = classifyCommodity("Aluminium smelter production increases");
    expect(result).toBe("aluminium");
  });
});
