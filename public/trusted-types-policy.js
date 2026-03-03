(function () {
  var tt = window.trustedTypes;
  if (!tt || tt.defaultPolicy) return;

  try {
    tt.createPolicy("default", {
      createHTML: function (input) {
        return input;
      },
      createScript: function (input) {
        return input;
      },
      createScriptURL: function (input) {
        return input;
      },
    });
  } catch (e) {
    // Ignore if a policy with the same name already exists or is blocked.
  }
})();
