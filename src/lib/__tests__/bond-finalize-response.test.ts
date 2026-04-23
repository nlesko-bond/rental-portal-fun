import { describe, it, expect } from "vitest";
import { parseFinalizeCartResponse } from "@/lib/bond-finalize-response";

describe("parseFinalizeCartResponse", () => {
  it("returns empty object for null/undefined input", () => {
    expect(parseFinalizeCartResponse(null)).toEqual({});
    expect(parseFinalizeCartResponse(undefined)).toEqual({});
  });

  it("parses numeric id as invoiceRef + invoiceNumericId", () => {
    const result = parseFinalizeCartResponse({ data: { id: 42 } });
    expect(result.invoiceRef).toBe("42");
    expect(result.invoiceNumericId).toBe(42);
  });

  it("parses invoiceId string field", () => {
    const result = parseFinalizeCartResponse({ data: { invoiceId: "99" } });
    expect(result.invoiceRef).toBe("99");
    expect(result.invoiceNumericId).toBe(99);
  });

  it("prefers numeric invoiceId over invoiceNumber string", () => {
    // When invoiceId is a digit string, it becomes invoiceNumericId → used as invoiceRef
    const result = parseFinalizeCartResponse({ data: { invoiceNumber: "INV-001", invoiceId: "123" } });
    expect(result.invoiceRef).toBe("123");
    expect(result.invoiceNumericId).toBe(123);
  });

  it("reads reservationRef from reservationId", () => {
    const result = parseFinalizeCartResponse({ data: { id: 1, reservationId: "RES-XYZ" } });
    expect(result.reservationRef).toBe("RES-XYZ");
  });

  it("falls back to data at root when no .data wrapper", () => {
    const result = parseFinalizeCartResponse({ id: 77 });
    expect(result.invoiceNumericId).toBe(77);
  });

  it("returns empty for non-object", () => {
    expect(parseFinalizeCartResponse("string")).toEqual({});
    expect(parseFinalizeCartResponse(42)).toEqual({});
  });
});
