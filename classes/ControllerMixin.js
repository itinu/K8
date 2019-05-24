class ControllerMixin {
  constructor(client){
    this.client = client;
  }
  async before(){}
  async after(){}
}
module.exports = ControllerMixin;