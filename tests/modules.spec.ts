import { DecodeHexEscapes } from "../src/modules/decodeHexEscapes";

describe("Decoding hex escapes", () => {
  it('should decode to ["hello world"]', () => {
    const want = '"hello world"';
    const input = '"\\x68\\x65\\x6c\\x6c\\x6f\\x20\\x77\\x6f\\x72\\x6c\\x64"';
    const got = new DecodeHexEscapes().process(input);
    expect(got).toBe(want);
  });

  it('should decode to ["heLLo wOrLD"]', () => {
    const want = '"heLLo wOrLD"';
    const input = '"\\x68\\x65\\x4c\\x4c\\x6f\\x20\\x77\\x4f\\x72\\x4c\\x44"';
    const got = new DecodeHexEscapes().process(input);
    expect(got).toBe(want);
  });

  it("should decode to ['hello world']", () => {
    const want = "'hello world'";
    const input = "'\\x68\\x65\\x6c\\x6c\\x6f\\x20\\x77\\x6f\\x72\\x6c\\x64'";
    const got = new DecodeHexEscapes().process(input);
    expect(got).toBe(want);
  });

  it('should decode to [const str = "hello world"]', () => {
    const want = 'const str = "hello world"';
    const input = 'const str = "\\x68\\x65\\x6c\\x6c\\x6f\\x20\\x77\\x6f\\x72\\x6c\\x64"';
    const got = new DecodeHexEscapes().process(input);
    expect(got).toBe(want);
  });
});
