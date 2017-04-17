/*eslint strict: ["error", "function"]*/
(function() {
	'use strict';

	// ## Tableau associatif *typeMap*
	// Ce tableau conserve la correspondance entre les codes de type
	// et les classes de message appropriées.
	const typeMap = {};

	// # Classe *NetworkMessage*
	// Cette classe est une classe de base pour l'ensemble des
	// messages réseau.
	class NetworkMessage {
		// ## Méthode statique *register*
		// Cette méthode statique permet d'enregistrer la correspondance
		// entre les codes de type et les classes de messages.
		static register(klass) {
			typeMap[klass.typeCode] = klass;
		}

		// ## Fonction statique *create*
		// La fonction *create* crée une instance de la bonne classe
		// de message à partir de son code de type, et remplit les
		// valeurs avec les données reçues.
		static create(deserializer) {
			const typeCode = deserializer.peekU8();
			if (!typeMap[typeCode]) {
				return null;
			}
			
			const msg = new typeMap[typeCode]();
			msg.deserialize(deserializer);
			return msg;
		}

		// ## Méthode *build*
		// Cette méthode, à surcharger dans les classes enfant,
		// sert à initialiser les valeurs lors de la création d'un
		// nouveau message.
		build(typeCode) {
			this.typeCode = typeCode;
		}

		// ## Méthode *serialize*
		// Cette méthode, à surcharger dans les classes enfant,
		// permet d'enregistrer le contenu du message dans un
		// format pouvant être transféré.
		serialize(serializer) {
			serializer.writeU8(this.typeCode);
		}

		// ## Méthode *deserialize*
		// Cette méthode, à surcharger dans les classes enfant,
		// permet de reconstituer le contenu du message à partir
		// des données reçues.
		deserialize(deserializer) {
			this.typeCode = deserializer.readU8();
		}
	}


	// # Classe *NetworkLogin*
	// Ce message permet de transférer les informations nécessaires
	// lors de la connexion d'un joueur.
	class NetworkLogin extends NetworkMessage {
		// ## Méthode *build*
		// Initialise les valeurs lors de la création d'une nouvelle
		// instance de ce message.
		build(name) {
			this.name = name;
			super.build(NetworkLogin.typeCode);
		}

		// ## Méthode *serialize*
		// Cette méthode permet d'enregistrer le contenu du message
		// dans un format pouvant être transféré.
		serialize(serializer) {
			super.serialize(serializer);
			serializer.writeString(this.name);
		}

		// ## Méthode *deserialize*
		// Cette méthode permet de reconstituer le contenu du message
		// à partir des données reçues.
		deserialize(deserializer) {
			super.deserialize(deserializer);
			this.name = deserializer.readString();
		}
	}
	// ## Constante *typeCode*
	// Représente l'identifiant numérique de ce message
	NetworkLogin.typeCode = 1;


	// # Classe *NetworkStart*
	// Ce message permet indique aux clients que la partie est prête
	// à commencer. On y stocke la liste des joueurs et le numéro du joueur.
	class NetworkStart extends NetworkMessage {
		// ## Méthode *build*
		// Initialise les valeurs lors de la création d'une nouvelle
		// instance de ce message.
		build(playerIndex, names) {
			super.build(NetworkStart.typeCode);
			this.playerIndex = playerIndex;
			this.names = names;
		}

		// ## Méthode *serialize*
		// Cette méthode permet d'enregistrer le contenu du message
		// dans un format pouvant être transféré.
		serialize(serializer) {
			super.serialize(serializer);
			serializer.writeU8(this.playerIndex);
			serializer.writeU8(this.names.length);
			this.names.forEach((n) => {
				serializer.writeString(n);
			});
		}

		// ## Méthode *deserialize*
		// Cette méthode permet de reconstituer le contenu du message
		// à partir des données reçues.
		deserialize(deserializer) {
			super.deserialize(deserializer);
			this.playerIndex = deserializer.readU8();
			const nbNames = deserializer.readU8();
			this.names = [];
			for (let i = 0; i < nbNames; ++i) {
				this.names.push(deserializer.readString());
			}
		}
	}
	// ## Constante *typeCode*
	// Représente l'identifiant numérique de ce message
	NetworkStart.typeCode = 2;


	// # Classe *NetworkInputChanged*
	// Ce message représente un changement dans les entrées du joueur.
	class NetworkInputChanged extends NetworkMessage {
		// ## Méthode *build*
		// Initialise les valeurs lors de la création d'une nouvelle
		// instance de ce message.
		build(symbols) {
			super.build(NetworkInputChanged.typeCode);
			this.symbols = symbols;
		}

		// ## Méthode *serialize*
		// Cette méthode permet d'enregistrer le contenu du message
		// dans un format pouvant être transféré.
		serialize(serializer) {
			super.serialize(serializer);
			const count = Object.keys(this.symbols).length;
			serializer.writeU8(count);
			Object.keys(this.symbols).forEach((k) => {
				serializer.writeString(k);
				serializer.writeU8(this.symbols[k]);
			});
		}

		// ## Méthode *deserialize*
		// Cette méthode permet de reconstituer le contenu du message
		// à partir des données reçues.
		deserialize(deserializer) {
			super.deserialize(deserializer);
			const count = deserializer.readU8();
			this.symbols = {};
			for (let i = 0; i < count; ++i) {
				const k = deserializer.readString();
				const v = deserializer.readU8();
				this.symbols[k] = (v !== 0);
			}
		}
	}
	// ## Constante *typeCode*
	// Représente l'identifiant numérique de ce message
	NetworkInputChanged.typeCode = 100;

	// # Classe *NetworkScore*
	// Ce message est envoyé au serveur pour mettre à jour un score
	class NetworkScore extends NetworkMessage {
		// ## Méthode *build*
		// Initialise les valeurs lors de la création d'une nouvelle
		// instance de ce message.
		build(name, score) {
			super.build(NetworkScore.typeCode);
			this.name = name;
			this.score = score;
		}

		// ## Méthode *serialize*
		// Cette méthode permet d'enregistrer le contenu du message
		// dans un format pouvant être transféré.
		serialize(serializer) {
			super.serialize(serializer);
			serializer.writeString(this.name);
			serializer.writeU8(this.score);
		}

		// ## Méthode *deserialize*
		// Cette méthode permet de reconstituer le contenu du message
		// à partir des données reçues.
		deserialize(deserializer) {
			super.deserialize(deserializer);
			this.name = deserializer.readString();
			this.score = deserializer.readU8();
		}
	}
	// ## Constante *typeCode*
	// Représente l'identifiant numérique de ce message
	NetworkScore.typeCode = 101;
	
	// # Classe *NetworkLeaderboard*
	// Ce message est envoyé par le serveur pour mettre à jour les leaderboard
	class NetworkLeaderboard extends NetworkMessage {
		// ## Méthode *build*
		// Initialise les valeurs lors de la création d'une nouvelle
		// instance de ce message.
		build(leaderboard) {
			super.build(NetworkLeaderboard.typeCode);
			this.leaderboard = leaderboard;
		}

		// ## Méthode *serialize*
		// Cette méthode permet d'enregistrer le contenu du message
		// dans un format pouvant être transféré.
		serialize(serializer) {
			super.serialize(serializer);
			const count = Object.keys(this.leaderboard).length;
			serializer.writeU8(count);
			Object.keys(this.leaderboard).forEach((name) => {
				serializer.writeString(name);
				serializer.writeU8(this.leaderboard[name]);
			});
		}

		// ## Méthode *deserialize*
		// Cette méthode permet de reconstituer le contenu du message
		// à partir des données reçues.
		deserialize(deserializer) {
			super.deserialize(deserializer);
			const count = deserializer.readU8();
			this.leaderboard = {};
			for (let i = 0; i < count; ++i) {
				const name = deserializer.readString();
				const score = deserializer.readU8();
				this.leaderboard[name] = score;
			}
		}
	}
	// ## Constante *typeCode*
	// Représente l'identifiant numérique de ce message
	NetworkLeaderboard.typeCode = 102;


	// # Enregistrement des types de message
	// Ces instructions sont exécutées lors du chargement de ce
	// fichier de script, et permettent d'enregistrer les types
	// de message connus.
	NetworkMessage.register(NetworkLogin);
	NetworkMessage.register(NetworkStart);
	NetworkMessage.register(NetworkInputChanged);
	NetworkMessage.register(NetworkScore);
	NetworkMessage.register(NetworkLeaderboard);

	// # Exportation des messages
	// Le même fichier de description des messages sert à la fois
	// au client et au serveur. L'enregistrement des deux se fait
	// d'une manière légèrement différente, mais suffisamment
	// semblable pour ne pas nécessiter trop de manipulations.
	const classes = {
		NetworkMessage: NetworkMessage,
		NetworkLogin: NetworkLogin,
		NetworkStart: NetworkStart,
		NetworkInputChanged: NetworkInputChanged,
		NetworkScore: NetworkScore,
		NetworkLeaderboard: NetworkLeaderboard,
	};

	// # Environnement Node.js
	if (typeof module !== 'undefined') {
		module.exports = classes;
	}

	// # Environnement Web
	if (typeof window !== 'undefined') {
		define(() => {
			return classes;
		});
	}
})();
