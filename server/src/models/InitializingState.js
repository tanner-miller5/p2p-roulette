const BaseState = require('./BaseState');

class InitializingState extends BaseState {
  async enter() {
    await this.context.currentGame.update({ 
      status: 'INITIALIZING',
      playerCount: 0,
      errorMessage: null
    });
    this.context.emit('stateChange', this.context.currentGame);
  }

  async handleEvent(event) {
    if (event === 'CONNECTION_ESTABLISHED') {
      this.context.transitionTo('WaitingForPlayersState');
    }
  }
}

module.exports = InitializingState;