const BaseState = require('./BaseState');

class BettingOpenState extends BaseState {
  async enter() {
    this.context.startBettingTimer();
    await this.context.currentGame.update({ status: 'BETTING_OPEN' });
    this.context.emit('stateChange', this.context.currentGame);
  }

  async exit() {
    this.context.clearTimer('betting');
  }

  async handleEvent(event) {
    if (event === 'BETTING_WINDOW_CLOSED') {
      await this.context.transitionTo('ProcessingBetsState');
    }
  }
}

module.exports = BettingOpenState;
