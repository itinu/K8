const fs = require('fs');

const SYS_PATH = require.resolve(`./K8`).replace('/K8.js', '');
const EXE_PATH = fs.realpathSync('./');
const APP_PATH = EXE_PATH + '/application';
const MOD_PATH = EXE_PATH + '/modules';

const bootstrap = require(`${APP_PATH}/bootstrap.js`);

const resolve = (path, prefix, store)=>{
  if(!store[path]){
    //search application, then modules, then system
    const fetchList = [`${APP_PATH}/${prefix}/${path}`];

    bootstrap.modules.forEach(x => fetchList.push(`${MOD_PATH}/${x}/${prefix}/${path}`));
    fetchList.push(`${SYS_PATH}/${prefix}/${path}`);

    for(let i=0; i<fetchList.length; i++){
      const x = fetchList[i];
      if(fs.existsSync(x)){
        store[path] = x;
        break;
      }
    }

    if(!store[path]){
      console.log(`path ${path} not found`);
      return null;
    }
  }

  return store[path];
};

class K8 {
  static checkConfigClearRequireCache(){
    const config = require(`${K8.APP_PATH}/config/RequireCache`);
    K8.clearCache = config.clearCache;

    if(K8.clearCache && (file.indexOf(K8.SYS_PATH) !== 0)){
      delete require.cache[file];
    }
  }

  static require(path){
    const file = resolve(path+'.js', 'classes', K8.classPath);
    const OBJ = require(file);

    K8.checkConfigClearRequireCache();

    return OBJ;
  }

  static resolveView(path){
    return resolve(path, 'views', K8.viewPath);
  }
}

K8.clearCache = false;
K8.classPath = [];
K8.viewPath = [];

K8.SYS_PATH = SYS_PATH;
K8.EXE_PATH = EXE_PATH;
K8.APP_PATH = APP_PATH;
K8.MOD_PATH = MOD_PATH;

module.exports = K8;