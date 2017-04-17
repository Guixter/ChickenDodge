define([
  'require',
  'components/component',
  'eventTrigger',
  '/common/messages.js',
], (
  require,
  Component,
  EventTrigger,
  Messages
) => {
  'use strict';

  // # Classe *NetworkPlayerManagerComponent*
  // Ce composant configure les joueurs locaux et réseau.
  class NetworkPlayerManagerComponent extends Component {
    // ## Méthode *create*
    // Cette méthode est appelée pour configurer le composant avant
    // que tous les composants d'un objet aient été créés.
    create(/*descr*/) {
      this.readyEvent = new EventTrigger();
      return Promise.resolve();
    }

    // ## Méthode *setup*
    // Cette méthode configure le composant. Elle négocie avec le
    // serveur qui sera le joueur local et le joueur distant.
    setup(descr) {
      const config = require('main').config;

      this.networking = this.findComponent(descr.networking);
      this.networking.messageEvent.add(this, this.onMessage);
      this.players = [];
      descr.players.forEach((pDescr) => {
        this.players.push({
          player: this.findComponent(pDescr.player),
          input: this.findComponent(pDescr.input),
        });
      });

      const playerName = config.alias;
      const msg = new Messages.NetworkLogin();
      msg.build(playerName);
      this.networking.send(msg);
      return Promise.resolve();
    }

    // ## Méthode *onMessage*
    // Cette méthode est déclenchée quand un message réseau est reçu.
    // Si on a un message de type NetworkStart, on configure les
    // joueurs et on déclenche l'événement indiquant qu'on est prêt
    // à lancer la partie.
    onMessage(msg) {
      if (!(msg instanceof Messages.NetworkStart)) {
        return;
      }

      msg.names.forEach((p, index) => {
        const isLocal = (index === msg.playerIndex);
        this.players[index].player.name = p;
        this.players[index].player.isLocal = isLocal;
        this.players[index].input.isLocal = isLocal;
      });

      this.readyEvent.trigger(msg.playerIndex);
    }
  }

  return NetworkPlayerManagerComponent;
});
