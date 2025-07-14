const BaseState = require('./BaseState');

class ErrorState extends BaseState {
  async enter() {
    this.context.clearAllTimers();
    await this.context.currentGame.update({ 
      status: 'ERROR',
      errorMessage: this.context.lastError?.message || 'Unknown error'
    });
    this.context.emit('stateChange', this.context.currentGame);
  }

  async handleEvent(event) {
    if (event === 'RECOVERY_SUCCESS') {
      await this.context.transitionTo('WaitingForPlayersState');
    } else if (event === 'RECOVERY_FAILED') {
      await this.context.transitionTo('InitializingState');
    }
  }
}

module.exports = ErrorState;