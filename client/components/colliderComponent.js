define([
 'components/component',
 'components/rectangle',
 'components/quadtree',
], (
 Component,
 Rectangle,
 Quadtree
) => {
	'use strict';

	// ## Variable *colliders*
	// On conserve ici une référence vers toutes les instances
	// de cette classe, afin de déterminer si il y a collision.
	const colliders = [];
	
	// Le quadtree
	const quadtree = new Quadtree(0, new Rectangle({
		x: 0,
		y: 0,
		width: 768,  // The screen width
		height: 576, // The screen height
	}));

	// # Classe *ColliderComponent*
	// Ce composant est attaché aux objets pouvant entrer en
	// collision.
	class ColliderComponent extends Component {
		
		// ## Méthode *create*
		// Cette méthode est appelée pour configurer le composant avant
		// que tous les composants d'un objet aient été créés.
		create(descr) {
			this.flag = descr.flag;
			this.mask = descr.mask;
			this.size = descr.size;
			this.active = true;
			return Promise.resolve();
		}

		// ## Méthode *setup*
		// Si un type *handler* est défini, on y appellera une méthode
		// *onCollision* si une collision est détectée sur cet objet.
		// On stocke également une référence à l'instance courante dans
		// le tableau statique *colliders*.
		setup(descr) {
			if (descr.handler) {
				this.handler = this.owner.getComponent(descr.handler);
			}
			colliders.push(this);
			return Promise.resolve();
		}

		// ## Méthode *update*
		// À chaque itération, on vérifie si l'aire courante est en
		// intersection avec l'aire de chacune des autres instances.
		// Si c'est le cas, et qu'un type *handler* a été défini, on
		// appelle sa méthode *onCollision* avec l'objet qui est en
		// collision.
		update( /*frame*/ ) {
			if (!this.handler) {
				return;
			}
			
			// Clear the quadtree
			quadtree.clear();
			
			// Build the quadtree
			colliders.forEach((c) => {
				// Trivial cases
				if (c === this || !c.enabled || !c.owner.active) {
					return;
				}
				
				// Ignore the collider if its flag is not in the current mask
				if (!(c.flag & this.mask)) {
					return;
				}
				
				quadtree.insert(c);
			});
			
			// Iterate through the pertinent colliders
			const area = this.area;
			var pertinentColliders = quadtree.retrieve(area);
			pertinentColliders.forEach((c) => {
				// Bounding box test
				if (area.intersectsWith(c.area)) {
					this.handler.onCollision(c);
				}
			});
		}

		// ## Propriété *area*
		// Cette fonction calcule l'aire courante de la zone de
		// collision, après avoir tenu compte des transformations
		// effectuées sur les objets parent.
		get area() {
			const position = this.owner.getComponent('Position').worldPosition;
			return new Rectangle({
				x: position[0],
				y: position[1],
				width: this.size.w,
				height: this.size.h,
			});
		}
	}

	return ColliderComponent;
});
