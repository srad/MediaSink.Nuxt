import { expect, describe, it } from 'vitest'
import { parseTagsString, validateTags } from './parser';

describe('validateTags', function () {

  it('valid tags return true', function () {
    expect(validateTags([])).to.be.true;
    expect(validateTags([ 'test' ])).to.be.true;
    expect(validateTags([ 'test', 'test2' ])).to.be.true;
    expect(validateTags([ 'test-0', 'test', 'test-2' ])).to.be.true;
  });

  it('invalid tags return false when whites space wrong', function () {
    expect(validateTags([ '' ])).to.be.false;
    expect(validateTags([ ' ' ])).to.be.false;
    expect(validateTags([ '  ' ])).to.be.false;
    expect(validateTags([ '', '' ])).to.be.false;
    expect(validateTags([ ' test' ])).to.be.false;
    expect(validateTags([ 't est' ])).to.be.false;
    expect(validateTags([ ' test ' ])).to.be.false;
  });

  it('invalid tags when dashes placed wrong', function () {
    expect(validateTags([ 'test-' ])).to.be.false;
    expect(validateTags([ '-test' ])).to.be.false;
    expect(validateTags([ '-test-' ])).to.be.false;
    expect(validateTags([ '-te-st-' ])).to.be.false;

    expect(validateTags([ 'test-', '-test' ])).to.be.false;
    expect(validateTags([ '-test', '-test-' ])).to.be.false;
    expect(validateTags([ '-test-', '-te-st-' ])).to.be.false;
    expect(validateTags([ '-te-st-', '-te-st-' ])).to.be.false;
  });

  it('is valid when dashes placed right', function () {
    expect(validateTags([ 't-est' ])).to.be.true;
    expect(validateTags([ 'tes-t' ])).to.be.true;
    expect(validateTags([ 't-est' ])).to.be.true;
    expect(validateTags([ 't-e-s-t' ])).to.be.true;

    expect(validateTags([ 't-est', 'tes-t' ])).to.be.true;
    expect(validateTags([ 'tes-t', 't-est' ])).to.be.true;
    expect(validateTags([ 't-est', 't-e-s-t' ])).to.be.true;
    expect(validateTags([ 't-e-s-t', 't-e-s-t' ])).to.be.true;
  });
});

describe('parseTagsString', function () {

  it('empty string generates empty array', function () {
    expect(parseTagsString('')).to.deep.equal([]);
  });

  it('only white spaces raises an error', function () {
    const parse = () => parseTagsString('          ');
    expect(parse).to.throw;
  });

  it('single valid tag', function () {
    expect(parseTagsString('a')).to.deep.equal([ 'a' ]);
  });

  it('single valid tag', function () {
    expect(parseTagsString('aa')).to.deep.equal([ 'aa' ]);
  });

  it('single valid tag', function () {
    expect(parseTagsString('aabb')).to.deep.equal([ 'aabb' ]);
  });

  it('two valid tags', function () {
    expect(parseTagsString('a,a')).to.deep.equal([ 'a', 'a' ]);
  });

  it('two valid tags', function () {
    expect(parseTagsString('aa,bb')).to.deep.equal([ 'aa', 'bb' ]);
  });

  it('single invalid tag', function () {
    const parse = () => parseTagsString('l#üp');

    expect(parse).to.throw;
  });

  it('two invalid tags raise error', function () {
    const parse = () => parseTagsString('l#üp,389äö');
    expect(parse).to.throw;
  });

});
