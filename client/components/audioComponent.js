define([
  'components/component',
  'utils',
], (
  Component,
  Utils
) => {
  'use strict';

  // Conserve une référence vers le composant audio principal
  let mainAudio = undefined;

  // Crée un contexte audio du navigateur
  const globalContext = new (window.AudioContext || window.webkitAudioContext)();

  // # Classe *AudioComponent*
  // Ce composant représente un module permettant de jouer des sons.
  class AudioComponent extends Component {
    // ## Méthode *create*
    // Cette méthode est appelée pour configurer le composant avant
    // que tous les composants d'un objet aient été créés.
    create(descr) {
      if (descr.main) {
        mainAudio = this;
      }
      this.events = {};
      return Promise.resolve();
    }

    // ## Méthode *setup*
    // Cette méthode charge le fichier de description et les sons
    // qui y sont associés.
    setup(descr) {
      function decodeAudioData(arrayBuffer) {
        return new Promise((resolve) => {
          globalContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            resolve(audioBuffer);
          });
        });
      }

      return Utils.loadJSON(descr.description)
      .then((events) => {
        const p = [];
        Object.keys(events).forEach((name) => {
          const evtDesc = events[name];
          const loadP = Utils.loadAsync(evtDesc.source, null, 'arraybuffer')
          .then((xhr) => {
            return decodeAudioData(xhr.response);
          })
          .then((buffer) => {
            evtDesc.audioBuffer = buffer;
            this.events[name] = evtDesc;
          });
          p.push(loadP);
        });
        return Promise.all(p);
      });
    }

    // ## Méthode *play*
    // Cette méthode joue le son désiré selon son nom.
    play(name, volume = 1.0) {
      if (!this.events[name])
        return;

      const source = globalContext.createBufferSource();
      source.buffer = this.events[name].audioBuffer;
      const gainNode = globalContext.createGain();
      gainNode.gain.value = this.events[name].volume * volume;
      source.connect(gainNode);
      gainNode.connect(globalContext.destination);
      source.start(0);
    }

    // ## Méthode statique *play*
    // Cette méthode joue le son désiré sur le composant principal.
    static play(name, volume = 1.0) {
      mainAudio.play(name, volume);
    }
  }

  return AudioComponent;
});
