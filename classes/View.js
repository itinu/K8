const K8 = require('../K8');

class View{
  static factory(file, data){
    return new View(file, data);
  }

  static setGlobal(key, value){
    View.globalData[key] = value;
  }

  constructor(file, data){
    this.file = file;
    this.data = data;

    this.realPath = K8.resolveView(file);
  }

  async render(){
    return '';
  }
}

View.globalData = [];

module.exports = View;