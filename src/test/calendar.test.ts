import { describe, it, expect } from "vitest";

describe("calendar category colors", () => {
  const CATEGORY_COLORS = {
    grant_deadline: "bg-orange-500",
    event: "bg-blue-500",
    application: "bg-emerald-500",
    platform: "bg-violet-500",
  };

  it("defines a color for each category", () => {
    expect(Object.keys(CATEGORY_COLORS)).toHaveLength(4);
    expect(CATEGORY_COLORS.grant_deadline).toBeTruthy();
  });
});

describe("env configuration pattern", () => {
  it("requires explicit secrets in production", () => {
    const isProduction = true;
    const getEnv = (name: string, fallback?: string) => {
      const value = process.env[name];
      if (value && value.trim()) return value;
      if (isProduction) throw new Error(`${name} is required in production`);
      return fallback;
    };

    expect(() => getEnv("JWT_SECRET")).toThrow("JWT_SECRET is required in production");
  });

  it("allows dev fallbacks outside production", () => {
    const isProduction = false;
    const getEnv = (name: string, fallback?: string) => {
      const value = process.env[name];
      if (value && value.trim()) return value;
      if (isProduction) throw new Error(`${name} is required in production`);
      return fallback;
    };

    expect(getEnv("JWT_SECRET", "dev-jwt-secret")).toBe("dev-jwt-secret");
  });
});
