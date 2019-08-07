const fs = require('fs');

//private resolve
const resolve = (path, prefix, store)=>{
  if(!store[path]){
    //search application, then modules, then system
    const fetchList = [`${K8.APP_PATH}/${prefix}/${path}`];

    [...K8.bootstrap.modules].reverse().forEach(x => fetchList.push(`${K8.MOD_PATH}/${x}/${prefix}/${path}`));
    fetchList.push(`${K8.SYS_PATH}/${prefix}/${path}`);
    [...K8.nodePackages].reverse().forEach(x => fetchList.push(`${x}/${prefix}/${path}`));

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

const setPath = (EXE_PATH = null, APP_PATH = null, MOD_PATH = null) => {
  K8.EXE_PATH = EXE_PATH || fs.realpathSync('./');
  K8.APP_PATH = APP_PATH || K8.EXE_PATH + '/application';
  K8.MOD_PATH = MOD_PATH || K8.EXE_PATH + '/modules';

  const bootstrapFile = `${K8.APP_PATH}/bootstrap.js`;
  if(fs.existsSync(bootstrapFile)){
    K8.bootstrap = require(bootstrapFile);
  }
};

const updateConfig = () => {
  K8.config = require(resolve('site.js', 'config', K8.configPath));
};

const reloadModuleInit = () => {
  //activate init.js in modules
  K8.bootstrap.modules.forEach(x => {
    const initPath = `${K8.MOD_PATH}/${x}/init.js`;

    if(fs.existsSync(initPath)){
      require(initPath);
      delete require.cache[initPath];
    }
  });

  //activate init.js in require('k8mvc-sample-module')
  K8.nodePackages.forEach(x =>{
    const initPath = `${x}/init.js`;
    if(fs.existsSync(initPath)){
      require(initPath);
      delete require.cache[initPath];
    }
  })
};

class K8 {
  static init(EXE_PATH = null, APP_PATH = null, MOD_PATH = null){
    K8.VERSION  = '0.1.8';

    K8.config = require('./config/site');

    K8.nodePackages = [];//register by require('k8mvc-module');

    K8.classPath  = {}; //{'ORM'          => 'APP_PATH/classes/ORM.js'}
    K8.viewPath   = {}; //{'layout/index' => 'APP_PATH/views/layout/index'}
    K8.configPath = {}; //{'site.js       => 'APP_PATH/config/site.js'}

    K8.bootstrap = {modules: []};
    K8.SYS_PATH = require.resolve(`./K8`).replace('/K8.js', '');

    //set paths
    setPath(EXE_PATH, APP_PATH, MOD_PATH);
    updateConfig();
    reloadModuleInit();

    return K8;
  }


  static addNodeModules(packageFolder){
    K8.nodePackages.push(packageFolder.replace('/index.js', ''));
  }

  static clearCache(){
    updateConfig();

    if(K8.config.cache.exports === false){
      for(let name in K8.classPath){
        delete require.cache[K8.classPath[name]];
      }
      K8.classPath = {};
      K8.configPath = {};
    }

    if(!K8.config.cache.view === false){
      K8.viewPath = {};
    }

    reloadModuleInit();
  }

  static require(path){
    const file = resolve(path+'.js', 'classes', K8.classPath);
    return require(file);
  }

  static resolveView(path){
    return resolve(path, 'views', K8.viewPath);
  }
}

module.exports = K8;