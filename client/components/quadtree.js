define([
 'components/rectangle',
], (
 Rectangle
) => {
	'use strict';
	
	// Some constants
	const MAX_OBJECTS = 10;
	const MAX_LEVELS = 5;
	
	// The Quadtree class
	class Quadtree {

		// Constructor
		constructor(level, bounds) {
			this.level = level;
			this.bounds = bounds;
			this.colliders = [];
			this.nodes = [];
		}
		
		// Clear the node
		clear() {
			this.colliders = [];
			this.nodes = [];
		}
		
		// Split the node into 4 subnodes
		split() {
			this.nodes = [];
			
			var subWidth = (this.bounds.xMax - this.bounds.xMin) / 2;
			var subHeight = (this.bounds.yMax - this.bounds.yMin) / 2;
			var subX = this.bounds.xMin;
			var subY = this.bounds.yMin;
			
			// Bottom left
			this.nodes.push(new Quadtree(this.level+1, new Rectangle({
				x: subX,
				y: subY,
				width: subWidth,
				height: subHeight,
			})));
			
			// Top left
			this.nodes.push(new Quadtree(this.level+1, new Rectangle({
				x: subX,
				y: subY + subHeight,
				width: subWidth,
				height: subHeight,
			})));
			
			// Bottom right
			this.nodes.push(new Quadtree(this.level+1, new Rectangle({
				x: subX + subWidth,
				y: subY,
				width: subWidth,
				height: subHeight,
			})));
			
			// Top right
			this.nodes.push(new Quadtree(this.level+1, new Rectangle({
				x: subX + subWidth,
				y: subY + subHeight,
				width: subWidth,
				height: subHeight,
			})));
		}
		
		getIndex(area) {
			var width = this.bounds.xMax - this.bounds.xMin;
			var height = this.bounds.yMax - this.bounds.yMin;
			var verticalMiddle = this.bounds.xMin + width/2;
			var horizontalMiddle = this.bounds.Ymin + height/2;

			// Check if the object can completely fit in cells
			var top = (area.yMin > horizontalMiddle);
			var bottom = (area.yMax < horizontalMiddle);
			var left = (area.xMax < verticalMiddle);
			var right = (area.xMin > verticalMiddle);
			
			// Get the cell index
			if (bottom && left) {
				return 0;
			} else if (top && left) {
				return 1;
			} else if (bottom && right) {
				return 2;
			} else if (top && right) {
				return 3;
			}
			
			// The object is in more than 1 cell
			return -1;
		}
		
		insert(collider) {
			if (this.nodes.length > 0) {
				var index = this.getIndex(collider.area);

				if (index != -1) {
					this.nodes[index].insert(collider);
					return;
				}
			}

			this.colliders.push(collider);

			if (this.colliders.length > MAX_OBJECTS && this.level < MAX_LEVELS) {
				if (this.nodes.length == 0) {
					this.split(); 
				}

				var i = 0;
				while (i < this.colliders.length) {
					var c = this.colliders[i];
					var index = this.getIndex(c.area);
					if (index != -1) {
						this.colliders.splice(i, 1);
						this.nodes[index].insert(c);
					} else {
						i++;
					}
				}
			}
		}
		
		retrieve(area) {
			var index = this.getIndex(area);
			var result = [];
			if (index != -1 && this.nodes.length != 0) {
				result = this.nodes[index].retrieve(area);
			}

			result = result.concat(this.colliders);

			return result;
		}
	}
	
	  return Quadtree;
});