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

    this.realPath = K8.resolveView(this.file);
  }

  async render(){
    return '';
  }

  collectProps(){
    if(this.data)return this.data.concat(View.globalData);

    const props = {};
    Object.keys(this).forEach(x => {
      props[x] = this[x];
    });

    return props.concat(View.globalData);
  }
}

View.globalData = [];

module.exports = View;