import { textToData } from './text-to-data';

describe('textToData', () => {
  it('returns an empty object for an empty string', () => {
    expect(textToData('')).toEqual({});
  });
});
