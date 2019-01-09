const UrlUtils = {
  getParams : function(url) {
    url = url || window.location.href;
    var vars = {};
    var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
  }
}

module.exports = UrlUtils;
