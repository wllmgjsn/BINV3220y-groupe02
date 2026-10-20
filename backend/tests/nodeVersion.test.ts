import { describe, expect, it } from "vitest";
import { unsupportedNodeMessage } from "../src/nodeVersion.ts";

describe("version de Node", () => {
  it.each(["22.14.0", "22.23.3", "23.6.0", "24.0.0", "25.1.0", "26.12.0"])(
    "accepte Node %s",
    (version) => {
      expect(unsupportedNodeMessage(version)).toBeUndefined();
    },
  );

  it.each(["18.20.0", "20.19.0", "22.12.0", "22.13.1", "23.5.0"])(
    "refuse Node %s avec un message clair",
    (version) => {
      expect(unsupportedNodeMessage(version)).toMatch(`Node ${version} est trop ancien`);
    },
  );
});
