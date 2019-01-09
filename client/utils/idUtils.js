const IdUtils = {
  generateId: function(length) {
    length = length || 10;
  
    let id = "";
    const characterList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // 0123456789";
  
    for (var i = 0; i < length; i++) {
      id += characterList.charAt(Math.floor(Math.random() * characterList.length));
    }
  
    return id;
  }
}

module.exports.IdUtils = IdUtils;
