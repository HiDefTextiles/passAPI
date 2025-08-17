var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sharp from 'sharp';
/**
 * Converts an image from a URL or a Base64 string into a matrix for a knitting pattern.
 * @param source The image source, either a URL string or a Base64 data URI (e.g., 'data:image/png;base64,...').
 * @param stitches The number of stitches (width) for the final pattern.
 * @param numColors The number of colors to dither down to (1,2,3 or 4).
 * @returns A promise that resolves to a 2D number array representing the knitting pattern.
 */
export function imageToMatrix(source_1, stitches_1) {
    return __awaiter(this, arguments, void 0, function* (source, stitches, numColors = 2) {
        let imgBuffer;
        // Check if the source is a Base64 data URI or a URL
        if (source.startsWith('data:image')) {
            const base64Data = source.split(',')[1];
            if (!base64Data) {
                throw new Error('Invalid Base64 data URI format.');
            }
            imgBuffer = Buffer.from(base64Data, 'base64');
        }
        else {
            const response = yield fetch(source, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
            }
            imgBuffer = Buffer.from(yield response.arrayBuffer());
        }
        // Convert image to grayscale and get metadata
        const image = sharp(imgBuffer).grayscale();
        const metadata = yield image.metadata();
        const originalWidth = metadata.width;
        const originalHeight = metadata.height;
        if (!originalWidth || !originalHeight) {
            throw new Error('Could not read image metadata.');
        }
        const heightLengthRatio = originalHeight / originalWidth;
        const rows = Math.round(stitches * heightLengthRatio);
        // Resize image
        const resizedImage = yield image.resize(stitches, rows, { kernel: sharp.kernel.lanczos2 }).raw().toBuffer();
        // Convert to a normalized array (grayscale values between 0 and 1)
        const imgArray = Array.from(resizedImage).map((value) => value / 255);
        // Reshape the linear array to a 2D matrix
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push(imgArray.slice(i * stitches, (i + 1) * stitches));
        }
        // --- START: Refactored Palette Generation ---
        // Dynamically define the color palette for dithering
        let colors;
        if (numColors === 1) {
            // For 1 color, dither to black and white (0 and 1)
            colors = [0, 1];
        }
        else {
            // For N colors, create N evenly spaced shades from black (0) to white (1)
            colors = Array.from({ length: numColors }, (_, i) => i / (numColors - 1));
        }
        // --- END: Refactored Palette Generation ---
        // Apply error diffusion dithering using the Floyd-Steinberg algorithm
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < stitches; x++) {
                const oldPixel = matrix[y][x];
                const newPixel = findNearestColor(oldPixel, colors);
                matrix[y][x] = newPixel;
                const quantError = oldPixel - newPixel;
                // Distribute the error to neighboring pixels
                if (x + 1 < stitches)
                    matrix[y][x + 1] += quantError * 7 / 16;
                if (y + 1 < rows) {
                    if (x - 1 >= 0)
                        matrix[y + 1][x - 1] += quantError * 3 / 16;
                    matrix[y + 1][x] += quantError * 5 / 16;
                    if (x + 1 < stitches)
                        matrix[y + 1][x + 1] += quantError * 1 / 16;
                }
            }
        }
        // --- START: Refactored Color Code Mapping ---
        // Map the dithered values to the final knitting pattern color codes
        const finalMatrix = matrix.map(row => row.map(ditheredValue => {
            if (numColors === 1) {
                // For 1 color: black (0) becomes color 1, white (1) becomes background 0
                return ditheredValue === 0 ? 1 : 0;
            }
            // For >1 colors, find the color's index in the palette.
            // A small tolerance is used for floating point comparison.
            const index = colors.findIndex(c => Math.abs(c - ditheredValue) < 1e-6);
            // Map index to the final color code:
            // Darkest (index 0) maps to N, lightest (index N-1) maps to 1.
            return numColors - index;
        }));
        // --- END: Refactored Color Code Mapping ---
        // Finalize the matrix: reverse each row for the knitting pattern
        return finalMatrix.map(row => row.slice().reverse());
    });
}
export function findNearestColor(value, colors) {
    return colors.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
}
export function separateColors00(matrix) {
    const res = [];
    // const numRows = matrix.length;
    const numCols = matrix[0].length;
    // Determine the maximum value in the matrix to know how many colors we have
    const max = Math.max(...matrix.flat());
    for (const row of matrix) {
        // Initialize an object to hold separate color lists
        const lists = {};
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
            if (lists[i].some(val => val !== 0)) { // Only add if there's at least one non-zero value
                res.push([...lists[i]]);
                res.push([...lists[i]]);
            }
        }
    }
    return res;
}
export function separateColors(matrix) {
    const res = [];
    // const numRows = matrix.length;
    const numCols = matrix[0].length;
    // Determine the maximum value in the matrix to know how many colors we have
    const max = Math.max(...matrix.flat());
    for (const row of matrix) {
        // Initialize an object to hold separate color lists
        const lists = {};
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
export function addBackground(matrix, backgroundFilePath = "empty", matrixBackgroundColor = 1, backgroundStarts = [], border = true, borderColor = 1, backgroundColor0 = 1, backgroundColor1 = 4) {
    const n = matrix.length;
    const m = matrix[0].length;
    function findFirstNotBackgroundFromCenter(matrix, backgroundColor) {
        const center = [Math.floor(n / 2), Math.floor(m / 2)];
        const visited = new Set();
        const toVisit = [center];
        while (toVisit.length > 0) {
            const [x, y] = toVisit.shift();
            const key = `${x},${y}`;
            if (visited.has(key))
                continue;
            visited.add(key);
            if (matrix[x][y] !== backgroundColor) {
                return [x, y];
            }
            const directions = [
                [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
                [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
            ];
            for (const [nx, ny] of directions) {
                if (nx >= 0 && ny >= 0 && nx < n && ny < m) {
                    toVisit.push([nx, ny]);
                }
            }
        }
        return null;
    }
    function isValidCoord([x, y]) {
        return x >= 0 && y >= 0 && x < n && y < m;
    }
    function floodFill(matrix, starts, backgroundColor, borderColor, border) {
        const visited = new Set();
        const toVisit = [...starts];
        let borderEncountered = false;
        while (toVisit.length > 0) {
            const [x, y] = toVisit.shift();
            const key = `${x},${y}`;
            if (visited.has(key))
                continue;
            visited.add(key);
            if (matrix[x][y] === backgroundColor) {
                matrix[x][y] = border ? 13 : backgroundColor; // Temporary marker for border
                const directions = [
                    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
                    [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
                ];
                for (const [nx, ny] of directions) {
                    if (isValidCoord([nx, ny]) && !visited.has(`${nx},${ny}`)) {
                        if (matrix[nx][ny] === backgroundColor) {
                            toVisit.push([nx, ny]);
                        }
                        else if (![matrixBackgroundColor, 10, 11, 13].includes(matrix[nx][ny])) {
                            borderEncountered = true;
                        }
                    }
                }
            }
            else if (border) {
                borderEncountered = true;
            }
        }
        if (border && borderEncountered) {
            matrix.forEach((row, i) => row.forEach((val, j) => {
                if (val === 13) {
                    matrix[i][j] = borderColor;
                }
            }));
        }
        matrix.forEach((row, i) => row.forEach((val, j) => {
            if (val === 11)
                matrix[i][j] = backgroundColor1;
            if (val === 10)
                matrix[i][j] = backgroundColor0;
        }));
        return matrix;
    }
    // Step 1: Find the first non-background color
    const firstPixel = findFirstNotBackgroundFromCenter(matrix, matrixBackgroundColor);
    if (!firstPixel) {
        throw new Error("No non-background color found");
    }
    // Step 2: Flood fill to add background
    const starts = backgroundStarts.length ? backgroundStarts : [[0, 0], [n - 1, 0], [0, m - 1], [n - 1, m - 1]];
    return floodFill(matrix, starts, matrixBackgroundColor, borderColor, border);
}
//# sourceMappingURL=saebba.js.map