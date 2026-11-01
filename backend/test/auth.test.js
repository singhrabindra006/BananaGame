const { describe, it } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

describe("Authentication & User Validation Suite", () => {
  it("should securely hash passwords and verify matching hashes", async () => {
    const rawPassword = "securePassword123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    assert.notStrictEqual(hashedPassword, rawPassword);
    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await bcrypt.compare("wrongPassword", hashedPassword);
    assert.strictEqual(isWrongMatch, false);
  });

  it("should validate username length requirements (3 to 20 chars)", () => {
    const validateUsername = (name) => {
      if (!name) return false;
      const clean = name.trim();
      return clean.length >= 3 && clean.length <= 20;
    };

    assert.strictEqual(validateUsername("ab"), false);
    assert.strictEqual(validateUsername("   "), false);
    assert.strictEqual(validateUsername("bananaMaster"), true);
    assert.strictEqual(validateUsername("thisUsernameIsWayTooLongForTheSystem"), false);
  });

  it("should enforce minimum password length of 6 characters", () => {
    const validatePassword = (pw) => Boolean(pw && pw.length >= 6);

    assert.strictEqual(validatePassword("12345"), false);
    assert.strictEqual(validatePassword("123456"), true);
    assert.strictEqual(validatePassword("strongBananaPass"), true);
  });

  it("should generate cryptographically secure hex session tokens", () => {
    const token1 = crypto.randomBytes(32).toString("hex");
    const token2 = crypto.randomBytes(32).toString("hex");

    assert.strictEqual(typeof token1, "string");
    assert.strictEqual(token1.length, 64);
    assert.notStrictEqual(token1, token2);
  });

  it("should correctly classify score tiers", () => {
    const getTier = (score) => {
      if (score >= 10) return "Grand Master";
      if (score >= 8) return "Clever Monkey";
      if (score >= 5) return "Adventurer";
      return "Sprout";
    };

    assert.strictEqual(getTier(10), "Grand Master");
    assert.strictEqual(getTier(9), "Clever Monkey");
    assert.strictEqual(getTier(6), "Adventurer");
    assert.strictEqual(getTier(3), "Sprout");
  });
});
