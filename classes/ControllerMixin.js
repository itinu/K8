class ControllerMixin {
  constructor(client){
    this.client = client;
  }
  async before(){}
  async after(){}
  async execute(action){}
}
module.exports = ControllerMixin;