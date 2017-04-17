define([
  'components/component',
  '/common/messages.js',
], (
  Component,
  Messages
) => {
	'use strict';

	// # Classe *NetworkLeaderboardComponent*
	// Ce composant reçoit les mises à jour du tableau des meneurs
	// et les affiche sur la page du jeu.
	class NetworkLeaderboardComponent extends Component {
		// ## Méthode *create*
		// Cette méthode est appelée pour configurer le composant avant
		// que tous les composants d'un objet aient été créés.
		create(/*descr*/) {
			this.scores = {};
			return Promise.resolve();
		}

		// ## Méthode *setup*
		// Cette méthode configure le composant. Elle récupère les
		// éléments de la page où afficher le tableau, et configure
		// la réception des messages réseau.
		setup(descr) {
			this.networking = this.findComponent(descr.networking);
			this.target = document.getElementById(descr.field);
			this.template = document.getElementById(descr.template);

			this.networking.messageEvent.add(this, this.onMessage);

			return Promise.resolve();
		}

		// ## Méthode *onMessage*
		// Cette méthode est déclenchée quand un message réseau est reçu
		onMessage(msg) {
			if (!(msg instanceof Messages.NetworkLeaderboard)) {
				return;
			}
			
			Object.keys(msg.leaderboard).forEach((name) => {
				this.setScore(name, msg.leaderboard[name]);
			});
		}

		// ## Méthode *sendScore*
		// Envoyer au serveur le score actuel d'un joueur
		sendScore(name, score) {
			const msg = new Messages.NetworkScore();
			msg.build(name, score);
			this.networking.send(msg);
		}

		// ## Méthode *setScore*
		// Cette méthode met à jour une entrée du tableau des meneurs,
		// et crée cette entrée si elle n'existe pas.
		setScore(name, value) {
			if (!this.scores[name]) {
				const element = this.template.cloneNode(true);
				element.classList.remove('template');
				const nameNode = element.getElementsByClassName('name')[0];
				nameNode.innerText = name;
				this.scores[name] = {
					node: element,
					scoreNode: element.getElementsByClassName('score')[0],
					value: value,
				};
			}

			this.scores[name].value = value;
			this.scores[name].scoreNode.innerText = value;

			const map = [];
			Object.keys(this.scores).forEach((name) => {
				map.push({
					name: name,
					data: this.scores[name],
				});
			});

			map.sort((a, b) => {
				if (a.data.value > b.data.value) {
					return -1;
				} else {
					return 1;
				}
			});

			while (this.target.hasChildNodes()) {
				this.target.removeChild(this.target.lastChild);
			}

			map.forEach((element) => {
				this.target.appendChild(element.data.node);
			});
		}
	}

	return NetworkLeaderboardComponent;
});
