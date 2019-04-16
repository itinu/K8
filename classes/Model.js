class Model{
  constructor(){}

  parse(result){
    if(!result)return this;

    Object.keys(result).forEach(x => this[x] = result[x]);
    return this;
  }
}

module.exports = Model;