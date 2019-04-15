const fs = require('fs');

class K8 {
  static require(path){
    const bootstrap = require(`${K8.APP_PATH}/bootstrap.js`);

    if(!K8.classPath[path]){
      //search application, then modules, then system
      const fetchList = [`${K8.APP_PATH}/classes/${path}.js`];
      bootstrap.modules.forEach(x => fetchList.push(`${K8.MOD_PATH}/${x}/classes/${path}.js`));
      fetchList.push(`${K8.SYS_PATH}/classes/${path}.js`);


      for(let i=0; i<fetchList.length; i++){
        const x = fetchList[i];
        if(fs.existsSync(x)){
          K8.classPath[path] = x;
          break;
        }
      }

      if(!K8.classPath[path]){
        console.log(`path ${path} not found`);
        return null;
      }
    }

    const file = K8.classPath[path];
    const OBJ = require(file);

    const config = require(`${K8.APP_PATH}/config/RequireCache`);
    K8.clearCache = config.clearCache;

    if(K8.clearCache && (file.indexOf(K8.SYS_PATH) !== 0)){
      delete require.cache[file];
    }

    return OBJ;
  }
}

K8.clearCache = false;
K8.classPath = [];

K8.SYS_PATH = require.resolve(`./K8`).replace('/K8.js', '');
K8.EXE_PATH = fs.realpathSync('./');
K8.APP_PATH = K8.EXE_PATH + '/application';
K8.MOD_PATH = K8.EXE_PATH + '/modules';

module.exports = K8;