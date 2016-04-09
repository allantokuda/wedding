(function() {
  var match,
      search = /([^&=]+)=?([^&]*)/g,
      decode = function(s) { return decodeURIComponent(s.replace(/\+/g, " ")); },
      query  = window.location.search.substring(1);

  window.params = {};

  while (match = search.exec(query))
     window.params[decode(match[1])] = decode(match[2]);

})();
