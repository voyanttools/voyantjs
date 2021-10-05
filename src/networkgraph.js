/* global d3 */

/**
 * A d3 force directed layout with labeled nodes
 * @memberof Spyral
 * @class
 */
class NetworkGraph {

	/**
	 * The network graph config object
	 * @typedef {Object} NetworkGraphConfig
	 * @property {Array} nodes
	 * @property {Array} links
	 * @property {String|Function} [nodeIdField]
	 * @property {String|Function} [nodeLabelField]
	 * @property {String|Function} [nodeValueField]
	 * @property {String|Function} [nodeCategoryField]
	 * @property {String|Function} [linkSourceField]
	 * @property {String|Function} [linkTargetField]
	 * @property {String|Function} [linkValueField]
	 */

	physics = {
		damping: 0.4, // 0 = no damping, 1 = full damping
		centralGravity: 0.1, // 0 = no grav, 1 = high grav
		nodeGravity: -50,  // negative = repel, positive = attract
		springLength: 100,
		springStrength: 0.25, // 0 = not strong, >1 = probably too strong
		collisionScale: 1.25 // 1 = default, 0 = no collision 
	}

	/**
	 * Construct a new NetworkGraph class
	 * @constructor
	 * @param {HTMLElement} target 
	 * @param {NetworkGraphConfig} config 
	 * @return {NetworkGraph}
	 */
	constructor(target, config) {
		this.target = target;

		if (config.nodes === undefined) throw new Error('Missing nodes!');
		if (config.links === undefined) throw new Error('Missing links!');
		
		const nodeIdField = config.nodeIdField === undefined ? 'id' : config.nodeIdField;
		const nodeLabelField = config.nodeLabelField === undefined ? 'id' : config.nodeLabelField;
		const nodeValueField = config.nodeValueField === undefined ? 'value' : config.nodeValueField;
		const nodeCategoryField = config.nodeCategoryField === undefined ? 'category' : config.nodeCategoryField;

		this.nodeData = config.nodes.map(node => {
			return {
				id: this._idGet(typeof nodeIdField === 'string' ? node[nodeIdField] : nodeIdField(node)),
				label: typeof nodeLabelField === 'string' ? node[nodeLabelField] : nodeLabelField(node),
				value: typeof nodeValueField === 'string' ? node[nodeValueField] : nodeValueField(node),
				category: typeof nodeCategoryField === 'string' ? node[nodeCategoryField] : nodeCategoryField(node)
			};
		});

		const linkSourceField = config.linkSourceField === undefined ? 'source' : config.linkSourceField;
		const linkTargetField = config.linkTargetField === undefined ? 'target' : config.linkTargetField;
		const linkValueField = config.linkValueField === undefined ? 'value' : config.linkValueField;

		this.linkData = config.links.map(link => {
			const sourceId = this._idGet(typeof linkSourceField === 'string' ? link[linkSourceField] : linkSourceField(link));
			const targetId = this._idGet(typeof linkTargetField === 'string' ? link[linkTargetField] : linkTargetField(link));
			const linkId = sourceId+'-'+targetId;
			return {
				id: linkId,
				source: sourceId,
				target: targetId,
				value: link[linkValueField]
			};
		});

		this.simulation;
		this.zoom;
		this.parentEl;
		this.links;
		this.nodes;

		this._insertStyles();
		this.initGraph();

		return this;
	}

	initGraph() {
		const width = this.target.offsetWidth;
		const height = this.target.offsetHeight;

		const svg = d3.select(this.target).append('svg')
			.attr('viewBox', [0, 0, width, height]);

		this.parentEl = svg.append('g');

		this.links = this.parentEl.append('g').attr('class', 'spyral-ng-links').selectAll('.spyral-ng-link');
		this.nodes = this.parentEl.append('g').attr('class', 'spyral-ng-nodes').selectAll('.spyral-ng-node');

		this.simulation = d3.forceSimulation()
			.force('center', d3.forceCenter(width*.5, height*.5)
				// .strength(this.physics.centralGravity)
			)
			.force('link', d3.forceLink().id(d => d.id).distance(this.physics.springLength).strength(this.physics.springStrength))
			.force('charge', d3.forceManyBody().strength(this.physics.nodeGravity))
			.force('collide', d3.forceCollide(d => Math.sqrt(d.bbox.width * d.bbox.height) * this.physics.collisionScale))
			.on('tick', this._ticked.bind(this))
			// TODO need to update sandbox cached output when simulation is done running
			.on('end', this._zoomToFit.bind(this));
		
		const link = this.links.data(this.linkData);
		link.exit().remove();
		const linkEnter = link.enter().append('line')
			.attr('class', 'spyral-ng-link')
			.attr('id', d => d.id)
			.on('mouseover', this._linkMouseOver.bind(this))
			.on('mouseout', this._linkMouseOut.bind(this));
				
		this.links = linkEnter.merge(link);

		const node = this.nodes.data(this.nodeData);
		node.exit().remove();
		const nodeEnter = node.enter().append('g')
			.attr('class', 'spyral-ng-node')
			.attr('id', d => d.id)
			.attr('category', d => d.category)
			.on('mouseover', this._nodeMouseOver.bind(this))
			.on('mouseout', this._nodeMouseOut.bind(this))
			.on('click', function(data) {
				d3.event.stopImmediatePropagation();
				d3.event.preventDefault();
				this._nodeClick(data);
			}.bind(this))
			.on('contextmenu', (d) => {
				d3.event.preventDefault();
				d.fixed = false;
				d.fx = null;
				d.fy = null;
			})
			.call(d3.drag()
				.on('start', function(d) {
					if (!d3.event.active) this.simulation.alpha(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
					d.fixed = true;
				}.bind(this))
				.on('drag', function(d) {
					this.simulation.alpha(0.3); // don't let simulation end while the user is dragging
					d.fx = d3.event.x;
					d.fy = d3.event.y;
				}.bind(this))
				.on('end', function(d) {
//					if (!d3.event.active) me.getVisLayout().alpha(0);
					if (d.fixed !== true) {
						d.fx = null;
						d.fy = null;
					}
				})
			);
		
		nodeEnter.append('rect');

		nodeEnter.append('text')
			.text(d => d.label)
			.attr('font-size', d => d.value ? Math.max(10, Math.sqrt(d.value)*8) : 10)
			.each(function(d) { d.bbox = this.getBBox(); }) // set bounding box for later use
			.attr('dominant-baseline', 'central');

		this.nodes = nodeEnter.merge(node);

		this.parentEl.selectAll('rect')
			.attr('width', d => d.bbox.width+16)
			.attr('height', d => d.bbox.height+8)
			.attr('rx', d => Math.max(2, d.bbox.height * 0.2))
			.attr('ry', d => Math.max(2, d.bbox.height * 0.2));
		this.parentEl.selectAll('text')
			.attr('dx', 8)
			.attr('dy', d => d.bbox.height*0.5+4);

		this.zoom = d3.zoom()
			.scaleExtent([1/4, 4])
			.on('zoom', function() {
				this.parentEl.attr('transform', d3.event.transform);
			}.bind(this));
		svg.call(this.zoom);

		this.simulation.nodes(this.nodeData);
		this.simulation.force('link').links(this.linkData);
	}

	_nodeMouseOver(node) {
		this.parentEl.selectAll('.spyral-ng-node').each((d, i, nodes) => nodes[i].classList.remove('hover'));

		this.links.each(link => {
			let id;
			if (link.source.id === node.id) {
				id = link.target.id;
			} else if (link.target.id === node.id) {
				id = link.source.id;
			}
			if (id) {
				this.parentEl.select('#'+id).each((d, i, nodes) => nodes[i].classList.add('hover'));
				this.parentEl.select('#'+link.id).each((d, i, links) => links[i].classList.add('hover'));
			}
		});

		this.parentEl.select('#'+node.id).each((d, i, nodes) => nodes[i].classList.add('hover'));
	}

	_nodeMouseOut() {
		this.parentEl.selectAll('.spyral-ng-node, .spyral-ng-link').each((d, i, nodes) => nodes[i].classList.remove('hover'));
	}

	_nodeClick(node) {
		console.log('click', node);
	}

	_linkMouseOver(link) {
		this.parentEl.selectAll('.spyral-ng-link').each((d, i, links) => links[i].classList.remove('hover'));
		this.parentEl.select('#'+link.id).each((d, i, links) => links[i].classList.add('hover'));
	}

	_linkMouseOut() {
		this.parentEl.selectAll('.spyral-ng-link').each((d, i, links) => links[i].classList.remove('hover'));
	}

	_ticked() {
		this.links
			.attr('x1', d => d.source.x)
			.attr('y1', d => d.source.y)
			.attr('x2', d => d.target.x)
			.attr('y2', d => d.target.y);

		this.nodes
			.attr('transform', d => {
				let x = d.x;
				let y = d.y;
				x -= d.bbox.width*.5;
				y -= d.bbox.height*.5;
				return 'translate('+x+','+y+')';
			});
	}

	_idGet(term) {
		if (term.search(/^\d+$/) === 0) {
			return 'spyral_'+term;
		}
		return term.replace(/\W/g, '_');
	}

	_zoomToFit(paddingPercent, transitionDuration) {
		var bounds = this.parentEl.node().getBBox();
		var width = bounds.width;
		var height = bounds.height;
		var midX = bounds.x + width/2;
		var midY = bounds.y + height/2;
		var svg = this.parentEl.node().parentElement;
		var svgRect = svg.getBoundingClientRect();
		var fullWidth = svgRect.width;
		var fullHeight = svgRect.height;
		var scale = (paddingPercent || 0.8) / Math.max(width/fullWidth, height/fullHeight);
		var translate = [fullWidth/2 - scale*midX, fullHeight/2 - scale*midY];
		if (width<1) {return;} // FIXME: something strange with spyral

		d3.select(svg)
			.transition()
			.duration(transitionDuration || 500)
			.call(this.zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
	}

	_resize() {

	}

	_insertStyles() {
		const styleElement = document.createElement('style');
		styleElement.append(`
.spyral-ng-nodes {
}
.spyral-ng-links {
}

.spyral-ng-node {
	cursor: pointer;
}
.spyral-ng-node rect {
	fill: hsl(200, 73%, 90%);
	stroke: #333;
	stroke-width: 1px;
}
.spyral-ng-node.hover rect {
	fill: hsl(354, 73%, 90%);
}
.spyral-ng-node text {
	user-select: none;
}

.spyral-ng-link {
	stroke-width: 1px;
	stroke: #555;
}
.spyral-ng-link.hover {
	stroke-width: 2px;
	stroke: #333;
}
		`);
	
		this.target.parentElement.prepend(styleElement);
	}
}

export default NetworkGraph;
