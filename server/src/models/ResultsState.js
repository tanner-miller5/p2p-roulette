const BaseState = require('./BaseState');

class ResultsState extends BaseState {
  async enter() {
    await this.context.currentGame.update({ status: 'RESULTS' });
    this.context.emit('stateChange', this.context.currentGame);
    
    this.context.timers.set('results', setTimeout(
      () => this.context.transition('DISPLAY_TIMEOUT'),
      this.context.RESULTS_DISPLAY
    ));
  }

  async exit() {
    this.context.clearTimer('results');
  }

  async handleEvent(event) {
    if (event === 'DISPLAY_TIMEOUT') {
      await this.context.transitionTo('CleanupState');
    }
  }
}

module.exports = ResultsState;