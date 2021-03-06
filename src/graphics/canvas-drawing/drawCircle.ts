import { IPoint } from '@musicenviro/base';
import { propToAbs, IPropOptions } from './convert';

export function drawCircle(
	ctx: CanvasRenderingContext2D,
	center: IPoint,
	radius: number,
	color: string = 'black',
	filled: boolean = false,
	alpha: number = 1,
	dash: number[] = [],
) {
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	
	if (filled) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.setLineDash(dash);
		ctx.strokeStyle = color;
		ctx.stroke();
	}

	ctx.restore();
}

/**
 *
 * @param ctx
 * @param center
 * @param radius is proportional as well, but we have to interpret somewhat. we take it as the proportion of
 *                  smaller of the two dimensions (width and height)
 * @param args
 */
export function drawCircleP(
	ctx: CanvasRenderingContext2D,
	propOptions: IPropOptions & { fixedRadius?: boolean },
	center: IPoint,
	radius: number,
	color: string = 'black',
	filled: boolean = false,
	alpha: number = 1,
	dash: number[] = [],
) {
	const smallDim = Math.min(ctx.canvas.width, ctx.canvas.height);

	drawCircle(
		ctx,
		propToAbs(ctx, center, propOptions || undefined),
		propOptions.fixedRadius ? radius : radius * smallDim,
		color,
		filled,
		alpha,
		dash,
	);
}
