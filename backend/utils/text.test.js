const test = require("node:test");
const assert = require("node:assert");
const { escapeRegex, findBestMatch } = require("./text");

test("findBestMatch matches whole words inside the spoken query", () => {
  const items = [{ trigger: "hi" }, { trigger: "hello" }, { trigger: "pricing plans" }];
  const byTrigger = (item) => [item.trigger];

  assert.strictEqual(findBestMatch("Hello there!", items, byTrigger).trigger, "hello");
  assert.strictEqual(findBestMatch("Tell me about your pricing plans?", items, byTrigger).trigger, "pricing plans");
  assert.strictEqual(findBestMatch("what is this", items, byTrigger), null);
  assert.strictEqual(findBestMatch("anything", [{ trigger: "  " }], byTrigger), null);
});

test("findBestMatch prefers the longest phrase", () => {
  const faqs = [
    { id: 1, keywords: ["price"] },
    { id: 2, keywords: ["price list"] },
  ];

  assert.strictEqual(findBestMatch("send me the price list", faqs, (f) => f.keywords).id, 2);
});

test("escapeRegex neutralises regex syntax", () => {
  assert.ok(new RegExp(escapeRegex("(a+)+$")).test("x(a+)+$"));
});
