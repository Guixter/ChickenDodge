define([
  'components/component',
  '/common/messages.js',
], (
  Component,
  Messages
) => {
  'use strict';

  // # Classe *NetworkInputComponent*
  // Ce composant envoie ou récupère les actions des joueurs
  // sur le réseau.
  class NetworkInputComponent extends Component {
    // ## Méthode *create*
    // Cette méthode est appelée pour configurer le composant avant
    // que tous les composants d'un objet aient été créés.
    create(/*descr*/) {
      this.isLocal = true;
      return Promise.resolve();
    }

    // ## Méthode *setup*
    // Cette méthode configure le composant. Elle conserve une
    // référence vers le module local d'entrée, afin de l'utiliser
    // si on est le joueur local.
    setup(descr) {
      this.networking = this.findComponent(descr.networking);
      this.localInput = this.findComponent(descr.localInput);
      this.inputStatus = {};
      Object.keys(this.localInput.symbols).forEach((k) => {
        this.inputStatus[k] = false;
      });

      this.networking.messageEvent.add(this, this.onMessage);
      return Promise.resolve();
    }

    // ## Méthode *update*
    // Met à jour l'état des entrées.
    update( /*frame*/ ) {
      if (this.isLocal) {
        this.updateLocal();
      }
      return Promise.resolve();
    }

    // ## Méthode *updateLocal*
    // Met à jour les entrées locales et envoie les changements,
    // si il y a lieu
    updateLocal() {
      let changed = false;
      Object.keys(this.inputStatus).forEach((k) => {
        const newVal = this.localInput.getKey(k);
        if (newVal !== this.inputStatus[k]) {
          changed = true;
          this.inputStatus[k] = newVal;
        }
      });

      if (changed) {
        const msg = new Messages.NetworkInputChanged();
        msg.build(this.inputStatus);
        this.networking.send(msg);
      }
    }

    // ## Méthode *onMessage*
    // Cette méthode est déclenchée quand un message réseau est reçu,
    // si on a le message du type désiré, on met à jour l'état des
    // entrées.
    onMessage(msg) {
      if (this.isLocal) {
        return;
      }

      if (msg instanceof Messages.NetworkInputChanged) {
        this.inputStatus = msg.symbols;
      }
    }

    // ## Fonction *getKey*
    // Cette méthode retourne une valeur correspondant à un symbole défini.
    getKey(symbol) {
      return this.inputStatus[symbol] || false;
    }
  }

  return NetworkInputComponent;
});
