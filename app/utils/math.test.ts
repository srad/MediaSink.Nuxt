import { expect, describe, it } from 'vitest';
import { randomString } from './math';

describe('randomString', function () {

  it('should generate a string of at least length 10', function () {
    expect(randomString().length).greaterThanOrEqual(10);
  });

  it('should only generate alpha-numberic strings', function () {
    const pattern = /^[a-z0-9]+$/i;

    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
    expect(randomString()).toMatch(pattern);
  });

});
