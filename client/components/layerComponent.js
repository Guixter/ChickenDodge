define([
 'components/component',
 'components/textureComponent',
 'graphicsAPI',
], (
 Component,
 TextureComponent,
 GraphicsAPI
) => {
	'use strict';

	let GL = undefined;

	// # Classe *LayerComponent*
	// Ce composant représente un ensemble de sprites qui
	// doivent normalement être considérées comme étant sur un
	// même plan.
	class LayerComponent extends Component {
		
		// ## Méthode *setup*
		setup() {
			GL = GraphicsAPI.context;
			
			// Build the buffers
			this.vertexBuffer = GL.createBuffer();
			this.indexBuffer = GL.createBuffer();
			
			// Initialize the data stores
			const MAX_SPRITES = 1000;
			var vertices = new Float32Array(4 * TextureComponent.vertexSize * MAX_SPRITES);
			var ind = [];
			for (var i = 0 ; i < MAX_SPRITES ; i++) {
				var k = i * 4;
				ind.push(k, k+1, k+2, k+2, k+3, k);
			}
			var indices = new Uint16Array(ind);
			
			// Set the context
			GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
			GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.DYNAMIC_DRAW);
			GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.DYNAMIC_DRAW);

			return Promise.resolve();
		}

		// ## Méthode *display*
		// La méthode *display* est appelée une fois par itération
		// de la boucle de jeu.
		display() {
			const layerSprites = this.listSprites();
			if (layerSprites.length === 0) {
				return;
			}
			const spriteSheet = layerSprites[0].spriteSheet;

			if (spriteSheet) {
				// Build the data stores
				var vertices = new Float32Array(4 * TextureComponent.vertexSize * layerSprites.length);
				var ind = [];
				for (var i = 0 ; i < layerSprites.length ; i++) {
					var sprite = layerSprites[i];
					if (sprite.vertices) {
						var k = i*4;
						vertices.set(sprite.vertices, k * TextureComponent.vertexSize);
						ind.push(k, k+1, k+2, k+2, k+3, k);
					}
				}
				var indices = new Uint16Array(ind);

				// Set the context
				GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
				GL.bufferSubData(GL.ARRAY_BUFFER, 0, vertices);
				GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
				GL.bufferSubData(GL.ELEMENT_ARRAY_BUFFER, 0, indices);

				// Draw
				spriteSheet.bind();
				GL.drawElements(GL.TRIANGLES, 6 * i, GL.UNSIGNED_SHORT, 0);
				spriteSheet.unbind();
			}

			return Promise.resolve();
		}

		// ## Fonction *listSprites*
		// Cette fonction retourne une liste comportant l'ensemble
		// des sprites de l'objet courant et de ses enfants.
		listSprites() {
			const sprites = [];
			this.listSpritesRecursive(this.owner, sprites);
			return sprites;
		}
		
		// ## Fonction *listSpritesRecursive*
		listSpritesRecursive(obj, sprites) {
			if (!obj.active) {
				return;
			}

			const objSprite = obj.getComponent('Sprite');
			if (objSprite && objSprite.enabled) {
				sprites.push(objSprite);
			}
			Object.keys(obj.children).forEach((k) => {
				const child = obj.children[k];
				this.listSpritesRecursive(child, sprites);
			});
		}
	}

	return LayerComponent;
});
