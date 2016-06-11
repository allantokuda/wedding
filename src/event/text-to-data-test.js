import _ from 'lodash';
import { textToData } from './text-to-data';

function expect_keys(object, count, itemsName) {
  let keys = _.keys(object);
  expect(keys.length).toBe(count, "Expected " + count + " " + itemsName + ". Keys: " + keys);
  return _.toArray(object);
}

describe('textToData', () => {
  it('for an empty string: returns an empty object', () => {
    expect(textToData('')).toEqual({});
  });

  it('when string is a single name: returns one invitation containing one person', () => {
    let data = textToData('allan');
    let invitations = expect_keys(data, 1, 'invitation');
    expect(invitations[0].email).toBeUndefined();
    let people = expect_keys(invitations[0].people, 1, 'person');
    expect(people[0].name).toBe('allan');
  });

  it('trims whitespace', () => {
    let data = textToData("  Allan   \n\n");
    let invitations = expect_keys(data, 1, 'invitation');
    expect(invitations[0].email).toBeUndefined();
    let people = expect_keys(invitations[0].people, 1, 'person');
    expect(people[0].name).toBe('Allan');
  });

  it('when string is two names separated by a comma and space: returns one invitation containing two people', () => {
    let data = textToData('Allan T, Stacy E');
    let invitations = expect_keys(data, 1, 'invitation');
    let people = expect_keys(invitations[0].people, 2, 'people');
    expect(people[0].name).toBe('Allan T');
    expect(people[1].name).toBe('Stacy E');
  });

  it('when string is two names separated by "and": returns one invitation containing two people', () => {
    let data = textToData('caitlin and prescott');
    let invitations = expect_keys(data, 1, 'invitation');
    let people = expect_keys(invitations[0].people, 2, 'people');
    expect(people[0].name).toBe('caitlin');
    expect(people[1].name).toBe('prescott');
  });

  it('when string is two names separated by "&": returns one invitation containing two people', () => {
    let data = textToData('Tom & Jerry');
    let invitations = expect_keys(data, 1, 'invitation');
    let people = expect_keys(invitations[0].people, 2, 'people');
    expect(people[0].name).toBe('Tom');
    expect(people[1].name).toBe('Jerry');
  });

  it('when string is three names: returns one invitation containing two people', () => {
    let data = textToData('bart,lisa,maggie');
    let invitations = expect_keys(data, 1, 'invitation');
    let people = expect_keys(invitations[0].people, 3, 'people');
    expect(people[0].name).toBe('bart');
    expect(people[1].name).toBe('lisa');
    expect(people[2].name).toBe('maggie');
  });

  it('when string is two names and another name on a separate line: returns two invitations', () => {
    let data = textToData("homer,marge\nbart, lisa, and maggie");
    let invitations = expect_keys(data, 2, 'invitations');
    let people = expect_keys(invitations[0].people, 2, 'people');
    expect(people[0].name).toBe('homer');
    expect(people[1].name).toBe('marge');

    people = expect_keys(invitations[1].people, 3, 'people');
    expect(people[0].name).toBe('bart');
    expect(people[1].name).toBe('lisa');
    expect(people[2].name).toBe('maggie');
  });

  it('when a number is specified at the beginning or end, fills in extra slots on the invitation', () => {
    let data = textToData("5 a,b\nc 2");
    let invitations = expect_keys(data, 2, 'invitations');
    let people = expect_keys(invitations[0].people, 5, 'people');
    expect(people[0].name).toBe('a');
    expect(people[1].name).toBe('b');
    expect(people[2].name).toBe('');
    expect(people[2].name).toBe('');
    expect(people[3].name).toBe('');

    people = expect_keys(invitations[1].people, 2, 'people');
    expect(people[0].name).toBe('c');
    expect(people[1].name).toBe('');
  });

  it('detects email addresses, even with misspelled domains', () => {
    let data = textToData("Jack Johnson and Jill Jameson jj@example.com\nZach zach@gmail");
    let invitations = expect_keys(data, 2, 'invitations');

    let people = expect_keys(invitations[0].people, 2, 'people');
    expect(people[0].name).toBe('Jack Johnson');
    expect(people[1].name).toBe('Jill Jameson');
    expect(invitations[0].email).toBe('jj@example.com');

    people = expect_keys(invitations[1].people, 1, 'person');
    expect(people[0].name).toBe('Zach');
    expect(invitations[1].email).toBe('zach@gmail');
  });
});
