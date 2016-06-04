export const emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(?:\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@(?:[a-z0-9_][-a-z0-9_]*(?:\.[-a-z0-9_]+)*\.(?:aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|(?:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(?::[0-9]{1,5})?$/i

// Match made-up or misspelled domains, including one-letter and numerical top-level domains, and lack of '.'
export const looseEmailRegex = /\b[-a-z0-9~!$%^&*_=+}{\'?]+(?:\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@(?:[a-z0-9_][-a-z0-9_]*(?:\.[-a-z0-9_]+)*|(?:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(?::[0-9]{1,5})?\b/gi

