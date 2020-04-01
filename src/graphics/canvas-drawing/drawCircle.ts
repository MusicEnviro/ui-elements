import { IPoint } from "@musicenviro/base";
import { propToAbs, IPropOptions } from "./convert";

export function drawCircle(
	ctx: CanvasRenderingContext2D,
	center: IPoint,
	radius: number,
	filled: boolean = false
) {

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
    if (filled) {
        ctx.stroke()
    } else {
        ctx.fill()
    }
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
    propOptions: IPropOptions,
    center: IPoint,
    radius: number,
    ...args: any[]
) {
    const smallDim = Math.min(ctx.canvas.width, ctx.canvas.height)
    drawCircle(ctx, propToAbs(ctx, center, propOptions || undefined), radius * smallDim, ...args)
}