const BaseState = require('./BaseState');

class SpinningState extends BaseState {
  async enter() {
    await this.context.currentGame.update({ status: 'SPINNING' });
    this.context.emit('stateChange', this.context.currentGame);
    
    this.context.timers.set('spinning', setTimeout(
      () => this.context.transition('SPIN_COMPLETED'),
      this.context.SPIN_DURATION
    ));
  }

  async exit() {
    this.context.clearTimer('spinning');
  }

  async handleEvent(event) {
    if (event === 'SPIN_COMPLETED') {
      const result = Math.random() < 0.5 ? 'red' : 'black';
      await this.context.transitionToResults(result);
    }
  }
}

module.exports = SpinningState;