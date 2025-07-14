const BaseState = require('./BaseState');

class CleanupState extends BaseState {
  async enter() {
    await this.context.currentGame.update({ status: 'CLEANUP' });
    this.context.emit('stateChange', this.context.currentGame);
    await this.context.cleanupGame();
  }

  async handleEvent(event) {
    if (event.type === 'CLEANUP_COMPLETED') {
      await this.context.transitionTo('WaitingForPlayersState');
    }
  }
}

module.exports = CleanupState;