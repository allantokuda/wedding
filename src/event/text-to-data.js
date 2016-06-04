import _ from 'lodash';
import randomKey from '../util/random-key';

export function textToLines(text) {
  let lines = text.trim().split(/\n+/);
  return _.filter(lines, line => line.length > 0);
};

export function textToData(text, maxIndex=0) {
  let data = {};

  textToLines(text).forEach(line => {
    let regex = /^\d+\s+|\s+\d+$/g
    let matches = line.match(regex);
    let count;
    if (matches && matches.length == 1) {
      line = line.replace(regex, '');
      count = parseInt(matches[0].trim(), 10);
    }
    let people = line.split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*/)
    let peopleHash = {};
    let i = 0;
    people.forEach((person) => {
      let personName = person.trim();
      peopleHash[randomKey()] = { name: personName, index: ++i };
    });
    while (i < count) {
      peopleHash[randomKey()] = { name: '', index: ++i }
    }
    data[randomKey()] = { people: peopleHash, index: ++maxIndex };
  });

  return data;
};
