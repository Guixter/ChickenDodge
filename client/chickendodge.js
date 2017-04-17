(function() {
  'use strict';

  require(['main', 'localisation'], (main, localisation) => {
    const locales = {
      fr: 'locales/fr.json',
      en: 'locales/en.json',
    };

    return localisation.init(locales)
    .then(() => {
      const localized = document.getElementsByClassName('localized');
      Array.from(localized).forEach((item) => {
        item.innerText = localisation.get(item.innerText);
      });
      document.getElementById('body').style.display = 'initial';

      document.start = () => {
        const alias = document.getElementById('player_alias').value.trim();
        const server = document.getElementById('server').value.trim();

        if (alias.length === 0)
          return alert(localisation.get('EMPTY_ALIAS'));
        if (server.length === 0)
          return alert(localisation.get('EMPTY_SERVER'));

        const config = {
          canvasId: 'canvas',
          alias: alias,
          server: server,
        };

        localisation.setContext('PLAYER_1', alias);

        document.getElementById('config').style.display = 'none';
        document.getElementById('canvas').style.display = 'block';

        return main.run(config, 'scenes/play.json');
      };
    });
  });
})();
