const BaseState = require('./BaseState');

class ProcessingBetsState extends BaseState {
  async enter() {
    await this.context.currentGame.update({ status: 'PROCESSING_BETS' });
    this.context.emit('stateChange', this.context.currentGame);
    await this.context.processBets();
  }

  async handleEvent(event) {
    if (event === 'BETS_PROCESSED') {
      await this.context.transitionTo('SpinningState');
    }
  }
}

module.exports = ProcessingBetsState;