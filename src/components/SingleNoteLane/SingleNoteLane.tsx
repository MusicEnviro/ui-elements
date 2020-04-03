// =============================================================================
// imports
// =============================================================================

import {
	LazyCanvasRedrawer,
	lazyCanvasRedrawerDefaultProps,
} from '../../generic-components/LazyCanvasRedrawer/LazyCanvasRedrawer';
import { drawLineP } from '../../graphics/canvas-drawing/drawLine';
import { drawCircleP, drawCircle } from '../../graphics/canvas-drawing/drawCircle';
import { IRhythmTree, ITreePoint, getRhythmPoints, tree44 } from './trees';
import * as React from 'react';
import { IPoint, subtractPoints, rectCenter } from '@musicenviro/base';
import { CanvasMouseManager, MouseArea } from '../../ui/CanvasMouseManager/CanvasMouseManager';
import { ILazyCanvasRedrawerProps } from '../../generic-components/LazyCanvasRedrawer/types';
import { propToAbs, absToProp } from '../../graphics/canvas-drawing/convert';
import { keysPressed, onTransition } from '../../ui/key-monitor';

// =============================================================================
// config
// =============================================================================

const dragDebounceInterval = 50; // for dragging

const radii = [7, 5, 3, 2];
const tickSizes = [0.2, 0.15, 0.075, 0.05];
const hoverAreaRadius = 15;

// =============================================================================
// main
// =============================================================================

export class SingleNoteLane extends LazyCanvasRedrawer {
	gridTree: IRhythmTree;
	gridTreePoints: ITreePoint[];

	mouseManager = new CanvasMouseManager();

	constructor(props: ILazyCanvasRedrawerProps) {
		super(props);
		this.setGridTree(tree44);
	}

	static defaultProps = {
		style: {
			...lazyCanvasRedrawerDefaultProps.style,
			// border: 'solid black 1px',
			color: 'red',
		},
		width: 750,
		height: 50,
	};

	setGridTree(tree: IRhythmTree) {
		this.gridTree = tree;
		this.gridTreePoints = getRhythmPoints(tree);
	}

	draw(ctx: CanvasRenderingContext2D) {
		drawLineP(ctx, { padding: 10 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, 'gray');

		this.highlights.forEach(area => {
			drawCircle(ctx, rectCenter(area.rect), hoverAreaRadius, 'gray', false, [3, 3]);
		});

		this.notes.forEach(pos => {
			drawCircleP(
				ctx,
				{ padding: 10, fixedRadius: true },
				{ x: pos, y: 0.5 },
				hoverAreaRadius - 2,
				this.props.style.color,
				true,
				0.5,
			);
		});

		this.gridTreePoints.forEach(point => {
			// drawLineP(
			// 	ctx,
			// 	{ padding: 10 },
			// 	{ x: point.position, y: 0.5 + tickSizes[point.depth] * 0.5 },
			// 	{ x: point.position, y: 0.5 - tickSizes[point.depth] * 0.5 },
			// 	'gray'
			// );

			drawCircleP(
				ctx,
				{ padding: 10, fixedRadius: true },
				{ x: point.position, y: 0.5 },
				radii[point.depth],
				'gray',
				true,
			);
		});
	}

	img: HTMLImageElement;

	componentDidMount() {
		super.componentDidMount();
		this.mouseManager.initialize(this.ref.current);
		this.addAreas();
		this.setupKeyEvents();
	}

	private setupKeyEvents() {
		onTransition((key, newState) => {
			switch (key) {
				case 'Shift':
					if (newState === 'Down') {
						this.setHighlightsForShiftKey();
					}
					else {
						this.setHighlightsForNoShift();
					}
			}
		});
	}

	addAreas() {
		this.gridTreePoints.forEach((treePoint, i) => {
			const pos = treePoint.position;
			const prop = { x: pos, y: 0.5 };
			const center = propToAbs(this.ref.current.getContext('2d'), prop, {
				padding: 10,
			});

			const area = this.mouseManager.createArea(
				center.x - hoverAreaRadius,
				center.y - hoverAreaRadius,
				center.x + hoverAreaRadius,
				center.y + hoverAreaRadius,
				i,
			);

			area.onMouseEnter(() => {
				if (keysPressed.Shift) {
					this.setHighlightsForShiftKey()
				} else {
					this.addHighlight(area);
				}
			});
			area.onMouseLeave(() => this.removeAllHighlights());
			area.onMouseDown(() => this.toggleNote(pos));
		});
	}

	setHighlightsForShiftKey() {
		// hover is a set, so we have to get one value using an iterator
		const pos = this.mouseManager.getTopHover().pos;
		
		this.highlights.clear();
		
		const division = (pos * 16) % 4;
		[0, 1, 2, 3].forEach(beat => {
			this.highlights.add(this.mouseManager.areas[beat * 4 + division]);
		});

		console.log('set the highlights')

		this.redraw()
	}
	
	setHighlightsForNoShift() {
		this.highlights.clear();
		this.addHighlight(this.mouseManager.getTopHover())
	}


	notes: number[] = [];

	toggleNote(pos: number) {
		const index = this.notes.indexOf(pos);
		if (index === -1) {
			this.highlights.forEach(area => this.notes.push(area.id * 0.0625));
		} else {
			this.notes.splice(index, 1);
		}
		this.redraw();
	}

	highlights = new Set<MouseArea>();

	addHighlight(area: MouseArea) {
		this.highlights.add(area);
		this.redraw(true);
	}

	removeHighlight(area: MouseArea) {
		this.highlights.delete(area);
		this.redraw(true);
	}

	removeAllHighlights() {
		this.highlights.clear();
		this.redraw(true);
	}
}