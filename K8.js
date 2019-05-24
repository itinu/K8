const fs = require('fs');

const SYS_PATH = require.resolve(`./K8`).replace('/K8.js', '');
const EXE_PATH = fs.realpathSync('./');
const APP_PATH = EXE_PATH + '/application';
const MOD_PATH = EXE_PATH + '/modules';

const bootstrap = require(`${APP_PATH}/bootstrap.js`);
const modulesReverse = [...bootstrap.modules].reverse();

const resolve = (path, prefix, store)=>{
  if(!store[path]){
    //search application, then modules, then system
    const fetchList = [`${APP_PATH}/${prefix}/${path}`];

    modulesReverse.forEach(x => fetchList.push(`${MOD_PATH}/${x}/${prefix}/${path}`));
    fetchList.push(`${SYS_PATH}/${prefix}/${path}`);

    for(let i=0; i<fetchList.length; i++){
      const x = fetchList[i];
      if(fs.existsSync(x)){
        store[path] = x;
        break;
      }
    }

    if(!store[path]){
      throw new Error(`K8 resolve path error: path ${path} not found`);
    }
  }

  return store[path];
};

class K8 {
  static reloadModuleInit(){
    //activate init.js in modules
    bootstrap.modules.forEach(x => {
      const initPath = `${MOD_PATH}/${x}/init.js`;

      if(fs.existsSync(initPath)){
        require(initPath);
        delete require.cache[initPath];
      }
    });
  }

  static clearCache(){
    K8.updateConfig();
    if(!K8.config.cache.exports){
      for(let name in K8.classPath){
        delete require.cache[K8.classPath[name]];
      }
      K8.classPath = {};
      K8.configPath = {};
    }
    if(!K8.config.cache.view){
      K8.viewPath = {};
    }
    K8.reloadModuleInit();
  }

  static updateConfig(){
    K8.config = require(resolve('site.js', 'config', K8.configPath));
  }

  static require(path){
    const file = resolve(path+'.js', 'classes', K8.classPath);
    return require(file);
  }

  static resolveView(path){
    return resolve(path, 'views', K8.viewPath);
  }
}

K8.config = {
  cache:{
    exports  : true,
    database : true,
    view     : true
  }
};

K8.classPath  = {}; //{'ORM'          => 'APP_PATH/classes/ORM.js'}
K8.viewPath   = {}; //{'layout/index' => 'APP_PATH/views/layout/index'}
K8.configPath = {}; //{'site.js       => 'APP_PATH/config/site.js'}

K8.SYS_PATH = SYS_PATH;
K8.EXE_PATH = EXE_PATH;
K8.APP_PATH = APP_PATH;
K8.MOD_PATH = MOD_PATH;
K8.VERSION  = '0.0.50';

module.exports = K8;

K8.updateConfig();
K8.reloadModuleInit();