define([
  'require',
  'components/component',
  'eventTrigger',
  'serializer',
  '/common/messages.js',
], (
  require,
  Component,
  EventTrigger,
  SerializerUtils,
  Messages
) => {
  'use strict';

  const Serializer = SerializerUtils.Serializer;
  const Deserializer = SerializerUtils.Deserializer;
  const NetworkMessage = Messages.NetworkMessage;

  // # Classe *NetworkingComponent*
  // Ce composant s'occupe des communications réseau.
  class NetworkingComponent extends Component {
    // ## Méthode *create*
    // Cette méthode est appelée pour configurer le composant avant
    // que tous les composants d'un objet aient été créés.
    create(/*descr*/) {
      const config = require('main').config;

      this.messageEvent = new EventTrigger();
      return new Promise((resolve, reject) => {
        this.socket = new WebSocket(`ws://${config.server}`, 'ChickenDodge');
        this.socket.onopen = resolve;
        this.socket.onerror = reject;
        this.socket.onmessage = (evt) => {
          this.onMessage(evt.data);
        };
      });
    }

    // ## Méthode *onMessage*
    // Cette méthode reçoit les messages reçus du réseau, crée le
    // message désiré dans notre format, et l'envoie aux modules
    // concernés.
    onMessage(blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const deserializer = new Deserializer(reader.result);
        const msg = NetworkMessage.create(deserializer);
        this.messageEvent.trigger(msg);
      };
      reader.readAsArrayBuffer(blob);
    }

    // ## Méthode *send*
    // Cette méthode est appelée par les autres composants afin
    // d'envoyer un message au serveur.
    send(message) {
      const serializer = new Serializer();
      message.serialize(serializer);
      this.socket.send(serializer.toBinary());
    }
  }

  return NetworkingComponent;
});
