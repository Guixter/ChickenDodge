define([
 'utils',
], (
 Utils
) => {
	'use strict';

	const globalContext = {};
	let localeStrings = undefined;

	// ## Fonction *getQueryParams*
	// Cette fonction retourne un objet contenant les paramètres passés
	// à l'URL de la page.
	function getQueryParams() {
		const query = document.location.search;
		const queryParams = {};

		const regex = new RegExp('([^?=&]+)(=([^&]*))?', 'g');
		query.replace(regex, (match,p1,p2,p3) => {
			queryParams[p1] = p3;
		});

		return queryParams;
	}

	// # Classe *Localisation*
	// Cette classe comprend les méthodes nécessaires pour
	// charger et traiter la régionalisation.
	class Localisation {
		// ## Méthode statique *init*
		// La méthode d'initialisation prend en paramètre un tableau
		// associatif décrivant les différents fichiers de localisation.
		// On détermine le fichier de locales à utiliser selon la langue
		// du navigateur ou un paramètre passé dans l'URL.
		static init(locales) {
			const queryParams = getQueryParams();
			let language = queryParams.locale || navigator.language || navigator.userLanguage;
			language = language.substring(0,2);
			if (!locales[language]) {
				language = Object.keys(locales)[0];
			}

			return Utils.loadJSON(locales[language])
			.then((content) => {
				localeStrings = content;
			});
		}

		// ## Fonction statique *get*
		// Cette fonction retourne la chaîne correspondante à la clé demandée.
		// Si cette chaîne comprend des champs substitués, ceux-ci sont remplacés.
		static get(key, queryContext) {
			if (!queryContext) {
				queryContext = {};
			}

			Object.keys(globalContext).forEach((k) => {
				if (queryContext[k]) {
					return;
				}

				queryContext[k] = globalContext[k];
			});

			if (!localeStrings[key]) {
				console.error(`Failed to find locale for ${key}`);
				return key;
			}

			// Implémenter la substitution de clés
			var substitutedString = localeStrings[key];
			Object.keys(queryContext).forEach((k) => {
				var regex = new RegExp('{' + k + '}', 'g');
				substitutedString = substitutedString.replace(regex, (match) => {
					return queryContext[k];
				});
			});

			return substitutedString;
		}

		// ## Méthode statique *setContext*
		// Cette méthode assigne une valeur au contexte
		// global qui sera substituée par défaut.
		static setContext(key, val) {
			globalContext[key] = val;
		}

		// ## Méthode statique *getContext*
		// Cette méthode obtient une valeur du contexte global.
		static getContext(key) {
			return globalContext[key];
		}
	}

	return Localisation;
});
