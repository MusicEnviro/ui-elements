export interface IRhythmTree {
	nodes: Array<
		| {
				units: number;
				subtree: IRhythmTree;
		  }
		| number
	>;
}

export interface IRhythmPoint {
	position: number;
	depth: number;
}


export const tree44: IRhythmTree = {
	nodes: [...Array(4)].map(() => ({
		units: 1,
		subtree: { nodes: [1, 1, 1, 1] }
	}))
};

export function getRhythmPoints(
	tree: IRhythmTree,
	depth: number = 0,
	start: number = 0,
	totalDuration: number = 1
): IRhythmPoint[] {
	let position = start;
	const unitSize = totalDuration / numUnits(tree);
	const result: IRhythmPoint[] = [];

	tree.nodes.forEach((node, i) => {
		if (typeof node === "number") {
			result.push({ position, depth: i === 0 ? depth : depth + 1 });
			position += unitSize * node;
		} else {
			const nextDepth = getRhythmPoints(
				node.subtree,
				depth + 1,
				position,
				unitSize * node.units
			);

			// if this is the first node of a tree, the first point is always the top depth
			const adjustedFirst =
				i === 0 ? { ...nextDepth[0], depth } : nextDepth[0];

			result.push(...[adjustedFirst, ...nextDepth.slice(1)]);
			position += unitSize * node.units;
		}
	});

	return result;
}

// -----------------------------------------------------------------------------
// module-scope helpers
// -----------------------------------------------------------------------------

function numUnits(tree: IRhythmTree): number {
	return tree.nodes.reduce(
		(sum: number, node) =>
			sum + (typeof node === "number" ? node : node.units),
		0
	) as number;
}

// -----------------------------------------------------------------------------
// test
// -----------------------------------------------------------------------------

// console.log(JSON.stringify(getRhythmPoints({ nodes: [1, 1, 1, 1] })));
console.log(JSON.stringify(tree44, null, 4));
// console.log(JSON.stringify(getRhythmPoints(tree44), null, 4));
