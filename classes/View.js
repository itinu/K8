const K8 = require('../K8');

class View{
  static factory(file, data){
    return new View(file, data);
  }

  static setGlobal(key, value){
    View.globalData[key] = value;
  }

  constructor(file, data, lookupDir){
    this.file = file;
    this.data = data;
    this.lookupDir = lookupDir;
  }

  async render(){
    return JSON.stringify(this.collectProps());
  }

  collectProps(){
    if(this.data)return Object.assign({}, View.globalData, this.data);

    const props = {};
    Object.keys(this).forEach(x => {
      props[x] = this[x];
    });

    return Object.assign({}, View.globalData, props);
  }

  static clearCache(){
    View.caches = {};
  }
}
View.defaultViewClass = View;

View.clearCache();
View.globalData = {};

module.exports = View;