import _ from 'lodash';
import randomKey from '../util/random-key';
import emailRegex from '../util/email-regex';

export function textToLines(text) {
  let lines = text.trim().split(/\n+/);
  return _.filter(lines, line => line.length > 0);
};

export function textToData(text, maxIndex=0) {
  let data = {};

  textToLines(text).forEach(line => {
    // Look for a count of people who should be each the invitation, including fill-ins (blank names)
    let countRegex = /\b\d+\b/
    let countMatches = line.match(countRegex);
    let count;
    if (countMatches && countMatches.length === 1) {
      line = line.replace(countRegex, '');
      count = parseInt(countMatches[0].trim(), 10);
    }

    // Look for an email address
    let emailMatches = line.match(emailRegex);
    let email;

    if (emailMatches && emailMatches.length === 1) {
      line = line.replace(emailRegex, '');
      email = emailMatches[0].trim();
    }

    // Divide up remainder as list of people, delimited by "," or "and"
    let peopleArray = line.split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*/)
    let people = {};
    let i = 0;
    peopleArray.forEach((person) => {
      let personName = person.trim();
      people[randomKey()] = { name: personName, index: ++i };
    });
    while (i < count) {
      people[randomKey()] = { name: '', index: ++i }
    }
    let invitation = { people, index: ++maxIndex };

    if (email) {
      invitation.email = email;
    }

    data[randomKey()] = invitation;
  });

  return data;
};
