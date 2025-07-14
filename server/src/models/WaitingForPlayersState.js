const BaseState = require('./BaseState');

class WaitingForPlayersState extends BaseState {
  async enter() {
    await this.context.currentGame.update({ status: 'WAITING_FOR_PLAYERS' });
    this.context.emit('stateChange', this.context.currentGame);
    await this.context.updatePlayerCount();
  }

  async handleEvent(event) {
    if (event === 'MIN_PLAYERS_REACHED') {
      await this.context.transitionTo('BettingOpenState');
    } else if (event === 'PLAYER_DISCONNECTED') {
      await this.context.updatePlayerCount();
    }
  }
}

module.exports = WaitingForPlayersState;