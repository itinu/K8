class ControllerMixin {
  /**
   *
   * @param {Controller} client
   */
  constructor(client){
    this.client = client;
  }
  async before(){}
  async after(){}

  /**
   *
   * @param {String} action
   * @returns {Promise<void>}
   */
  async execute(action){}
}
module.exports = ControllerMixin;