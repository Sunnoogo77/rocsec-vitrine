// Legacy GitHub Pages links: restore the route before React Router starts.
// Kept external so the production CSP does not need inline script permission.
// Adapted from https://github.com/rafgraph/spa-github-pages (MIT).
(function (location) {
  if (location.search[1] === '/') {
    var decoded = location.search.slice(1).split('&').map(function (part) {
      return part.replace(/~and~/g, '&');
    }).join('?');
    window.history.replaceState(null, null,
      location.pathname.slice(0, -1) + decoded + location.hash
    );
  }
}(window.location));
