
class BaseState {
  constructor(context) {
    this.context = context;
  }

  async enter() {}
  async exit() {}
  async handleEvent(event) {}
}

module.exports = BaseState;
