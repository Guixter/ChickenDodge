/* eslint-env node */
'use strict';

const PORT = 8080;

const HttpServer = require('./server/httpserver');
const FileProvider = require('./server/fileprovider');
const WebSocket = require('./server/websocket');
const Messages = require('./common/messages');
const SerializerUtils = require('./server/serializer');
const Serializer = SerializerUtils.Serializer;
const Deserializer = SerializerUtils.Deserializer;

const server = new HttpServer();
new FileProvider(__dirname, server);
const ws = new WebSocket(server);

const playerNames = {};
const pendingPlayers = {};
const leaderboard = {};

// Cette méthode permet d'envoyer un message à un client.
// Elle s'occupe d'exécuter la sérialisation et l'envoi
// en binaire sur le réseau.
function sendMessage(conn, message) {
	const serializer = new Serializer();
	message.serialize(serializer);
	conn.send(serializer.toBinary());
}

// Cette méthode est appelée lorsqu'un bloc de données
// binaires est reçu. On y décode alors le message qui y
// est stocké, et on exécute le traitement pertinent en
// réaction à ce message.
function processData(conn, data) {
	const deserializer = new Deserializer(data);
	const message = Messages.NetworkMessage.create(deserializer);
	onMessage(conn, message);
}

// Lorsqu'un message est reçu, cette méthode est appelée
// et, selon le message reçu, une action est exécutée.
function onMessage(conn, message) {
	if (message instanceof Messages.NetworkLogin)
		onNetworkLogin(conn, message);
	if (message instanceof Messages.NetworkInputChanged)
		sendMessage(conn.otherPlayer, message);
	if (message instanceof Messages.NetworkScore)
		onNetworkScore(conn, message);
}

// Quand un joueur envoie son score
function onNetworkScore(conn, message) {
	if (!leaderboard[message.name] || message.score >= leaderboard[message.name]) {
			leaderboard[message.name] = message.score;
			const msg = new Messages.NetworkLeaderboard();
			msg.build(leaderboard);
			sendMessage(conn, msg);
			sendMessage(conn.otherPlayer, msg);
		}
}

// Quand un joueur établit sa connection, il envoie un
// message l'identifiant.
function onNetworkLogin(conn, message) {
	playerNames[conn.id] = message.name;
	const pendingPlayerIDs = Object.keys(pendingPlayers);
	
	// Envoyer le leaderboard
	const msg = new Messages.NetworkLeaderboard();
	msg.build(leaderboard);
	sendMessage(conn, msg);

	// Si aucun joueur n'est en attente, on place le nouveau
	// joueur en attente.
	if (pendingPlayerIDs.length === 0) {
		pendingPlayers[conn.id] = conn;
		return;
	}

	// Si il y a des joueurs en attente, on associe un de
	// ces joueurs à celui-ci.
	const otherId = pendingPlayerIDs[0];
	conn.otherPlayer = pendingPlayers[otherId];
	conn.otherPlayer.otherPlayer = conn;
	delete pendingPlayers[otherId];

	// On envoie alors la liste des joueurs de la partie
	// à chacun des participants.
	const names = [
		playerNames[conn.otherPlayer.id],
		playerNames[conn.id],
	];

	const p1 = new Messages.NetworkStart();
	const p2 = new Messages.NetworkStart();
	p1.build(0, names);
	p2.build(1, names);

	sendMessage(conn.otherPlayer, p1);
	sendMessage(conn, p2);
}

ws.onConnection = function(connection) {
	console.log('Nouvelle connexion de ' + connection.id);
};

ws.onMessage = function(connection, evt) {
	console.log('Message de ' + connection.id /*, evt*/);
	processData(connection, evt.data);
};

ws.onClose = function(connection, evt) {
	console.log('Fermeture de ' + connection.id /*, evt*/);

	if (connection.otherPlayer) {
		delete connection.otherPlayer.otherPlayer;
		connection.otherPlayer.close();
	}
	delete pendingPlayers[connection.id];
};

server.listen(PORT)
.then(() => {
	console.log('HTTP server ready on port ' + PORT);
});
