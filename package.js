Package.describe({
  name: "utilities:state-transitions",
  summary: "A simplified reactive state transitions engine",
  version: "0.1.3",
  git: "https://github.com/meteor-utilities/state-transitions"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0.1");

  api.use(["matb33:collection-hooks@0.8.0", "underscore", "mongo", "minimongo"]);
  
  api.addFiles("lib/transitions.js", ["client", "server"]);

  api.export("");
});