import { describe, it, expect } from "vitest";
import { formatNaira } from "../src/lib/types";

describe("formatNaira", () => {
  it("formats kobo to NGN", () => {
    const s = formatNaira(450000);
    expect(s).toContain("4,500");
  });

  it("handles zero", () => {
    const s = formatNaira(0);
    expect(s).toMatch(/0/);
  });
});
