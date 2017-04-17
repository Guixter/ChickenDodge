define([
  'components/component',
  'components/audioComponent',
  'eventTrigger',
  'graphicsAPI',
  'localisation',
], (
  Component,
  AudioComponent,
  EventTrigger,
  GraphicsAPI,
  Localisation
) => {
  'use strict';

  // # Classe *CountdownComponent*
  // Ce composant affiche un décompte et envoie un événement
  // lorsqu'il a terminé.
  class CountdownComponent extends Component {
    // ## Méthode *create*
    // Cette méthode est appelée pour configurer le composant avant
    // que tous les composants d'un objet aient été créés.
    create(descr) {
      this.handler = new EventTrigger();
      this.sprites = [];
      descr.sprites.forEach((s) => {
        this.sprites.push(Localisation.get(s));
      });
      this.waitSprite = Localisation.get(descr.waitSprite);
      this.playerSpritePrefix = descr.playerSpritePrefix;
      this.delay = descr.delay;
      this.spriteTemplate = descr.spriteTemplate;
      return this.preloadSprites();
    }

    // ## Méthode *setup*
    // Cette méthode est appelée pour configurer le composant après
    // que tous les composants d'un objet aient été créés. Si on
    // doit attendre après le réseau, on affiche un message à cette
    // fin et on désactive le composant pendant ce temps.
    setup(descr) {
      if (descr.handler) {
        const tokens = descr.handler.split('.');
        this.handler.add(this.owner.getComponent(tokens[0]), tokens[1]);
      }

      if (descr.playerWait) {
        const comp = this.findComponent(descr.playerWait);
        this.showNamedImage(this.waitSprite);
        this.enabled = false;
        comp.readyEvent.add(this, this.onPlayerReady);
      }

      this.index = -1;
      return Promise.resolve();
    }

    // ## Méthode *onPlayerReady*
    // Cette méthode est appelée quand on a trouvé un joueur avec qui
    // faire une partie. On affiche alors à l'écran un message nous
    // identifiant.
    onPlayerReady(localIndex) {
      const sprite = Localisation.get(this.playerSpritePrefix + localIndex);
      this.sprites.unshift(sprite);
      this.enabled = true;
    }

    // ## Méthode *update*
    // À chaque itération, on vérifie si on a attendu le délai
    // désiré, et on change d'image si c'est le cas.
    update( /*frame*/ ) {
      const now = new Date();
      if ((now - this.shownTime) < this.delay) {
        return;
      }
      this.index++;
      if (this.current) {
        this.owner.removeChild(this.current);
        delete this.current;
      }

      let p = Promise.resolve();
      if (this.index >= this.sprites.length) {
        this.handler.trigger();
        this.enabled = false;
      } else {
        p = this.showImage();
      }
      return p;
    }

    // ## Méthode *preloadSprites*
    // Pré-charge les sprites pour qu'elles soient immédiatement
    // disponibles quand on voudra les afficher.
    preloadSprites() {
      const p = [];

      const toPreload = this.sprites.slice(0);
      toPreload.push(this.waitSprite);
      for (let i = 0; i <= 1; ++i) {
        toPreload.push(Localisation.get(this.playerSpritePrefix + i));
      }

      toPreload.forEach((s) => {
        p.push(GraphicsAPI.preloadImage(s));
      });
      return Promise.all(p);
    }

    // ## Méthode *showImage*
    // Affiche une image parmi les sprites désirées, si il y en
    // a encore à afficher.
    showImage() {
      this.shownTime = new Date();
      return this.showNamedImage(this.sprites[this.index])
      .then(() => {
        // # Joue le son de décompte audio
        AudioComponent.play('countdown');
      });
    }

    // ## Méthode *showNamedImage*
    // Affiche une image, directement à partir de son nom
    showNamedImage(textureName) {
      const SceneObject = require('sceneObject');
      this.current = new SceneObject();
      this.owner.addChild('sprite', this.current);
      this.spriteTemplate.RawSprite.texture = textureName;
      return this.current.createNewComponents(this.spriteTemplate);
    }
  }

  return CountdownComponent;
});
