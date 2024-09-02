




export function separateColors(matrix: number[][]): number[][] {
	const res: number[][] = [];
	// const numRows = matrix.length;
	const numCols = matrix[0].length;

	// Determine the maximum value in the matrix to know how many colors we have
	const max = Math.max(...matrix.flat());

	for (const row of matrix) {
		// Initialize an object to hold separate color lists
		const lists: { [key: number]: number[] } = {};
		for (let i = 1; i <= max; i++) {
			lists[i] = new Array(numCols).fill(0);
		}

		// Fill the color lists based on the row values
		for (let idx = 0; idx < numCols; idx++) {
			const value = row[idx];
			if (lists[value]) {
				lists[value][idx] = value;
			}
		}

		// Add each color list twice to the result
		for (let i = 1; i <= max; i++) {
			res.push([...lists[i]]);
			res.push([...lists[i]]);
		}
	}

	return res;
}