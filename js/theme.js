/* theme.js — picks today's colour theme. It is loaded in <head> so the colours are right before the page shows.
   Monday to Friday have a theme each; Saturday and Sunday use Monday's.
   The colours live in css/base.css (html[data-theme="..."]).
   To preview a day, add ?theme=tue (mon, tue, wed, thu, fri) to the address; it is remembered for that browser tab. */
(function () {
  var NAMES = ['mon', 'tue', 'wed', 'thu', 'fri'];
  var BY_DAY = ['mon', 'mon', 'tue', 'wed', 'thu', 'fri', 'mon']; // index = Date.getDay(): Sunday is 0, Saturday is 6
  var theme = BY_DAY[new Date().getDay()];
  try {
    var asked = new URLSearchParams(location.search).get('theme');
    if (asked && NAMES.indexOf(asked) > -1) sessionStorage.setItem('stfrancis-theme-preview', asked);
    var saved = sessionStorage.getItem('stfrancis-theme-preview');
    if (saved && NAMES.indexOf(saved) > -1) theme = saved;
  } catch (err) { /* storage blocked: just use today's theme */ }
  document.documentElement.setAttribute('data-theme', theme);
})();
