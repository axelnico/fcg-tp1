const getColorIndicesForCoord = (x, y, width) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
};

const getClosest = (val1, val2, target) =>
{
    if (target - val1 >= val2 - target)
        return val2;       
    else
        return val1;       
}

const findClosest = (arr, target) =>
{
    let n = arr.length;
    if (target <= arr[0])
        return arr[0];
    if (target >= arr[n - 1])
        return arr[n - 1];
    let i = 1;
    while (i < n && target > arr[i]) {
        i++;
    }
    return getClosest(arr[i-1], arr[i], target);
}

const getPalette = (factor) => {
    const step = Math.round(255 / Number(factor));
    const palette = [];
    let color = 0;
    while (color <= 255){
        palette.push(color);
        color += step;
    }
    if (palette.length < (Number(factor) + 1)){
        palette.push(255);
    }
    return palette;
}

const setColorToNeighbor = (x,y,error,coefficient, image) => {
    if(x >= image.width || y >= image.height || x < 0) return;
    const colorIndices = getColorIndicesForCoord(x,y,image.width);

    const redIndex = colorIndices[0];
    const greenIndex = colorIndices[1];
    const blueIndex = colorIndices[2];

    image.data[redIndex] = Math.round(image.data[redIndex] + (error.red * coefficient));
    image.data[greenIndex] = Math.round(image.data[greenIndex] + (error.green * coefficient));
    image.data[blueIndex] = Math.round(image.data[blueIndex] + (error.blue * coefficient));
}

const setColorToPixel = (x, y, palette, image) => {
    const colorIndices = getColorIndicesForCoord(x,y,image.width);
    const redIndex = colorIndices[0];
    const greenIndex = colorIndices[1];
    const blueIndex = colorIndices[2];

    const newRed = findClosest(palette,image.data[redIndex]);
    const newGreen= findClosest(palette,image.data[greenIndex]);
    const newBlue = findClosest(palette,image.data[blueIndex]);

    const errorRed = image.data[redIndex] - newRed;
    const errorGreen = image.data[greenIndex] - newGreen;
    const errorBlue = image.data[blueIndex] - newBlue;

    image.data[redIndex] = newRed;
    image.data[greenIndex] = newGreen;
    image.data[blueIndex] = newBlue;

    return {
        red: errorRed,
        green: errorGreen,
        blue: errorBlue
    }
}

// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
function dither(image, factor)
{

    const palette = getPalette(factor);

    for(let y = 0; y < image.height; y++) {
        for(let x = 0; x < image.width; x++) {
            
            const error = setColorToPixel(x,y,palette,image);

            setColorToNeighbor(x+1,y,error,7/16,image);
            setColorToNeighbor(x-1,y + 1,error,3/16,image);
            setColorToNeighbor(x,y + 1,error,5/16,image);
            setColorToNeighbor(x+1,y + 1,error,1/16,image);
            
        }
    }
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) 
{
    
    for(let y = 0; y < imageA.height; y++) {
        for(let x = 0; x < imageA.width; x++) {
           
            const colorsIndices = getColorIndicesForCoord(x,y,imageA.width);
            const redIndex = colorsIndices[0];
            const greenIndex = colorsIndices[1];
            const blueIndex = colorsIndices[2];
            const alphaIndex = colorsIndices[3];

            const newRed = Math.abs(imageA.data[redIndex] - imageB.data[redIndex]);

            const newBlue = Math.abs(imageA.data[blueIndex] - imageB.data[blueIndex]);
            const newGreen = Math.abs(imageA.data[greenIndex] - imageB.data[greenIndex]);
            
            result.data[redIndex] = newRed;

            result.data[greenIndex] = newGreen;

            result.data[blueIndex] = newBlue;

            result.data[alphaIndex] = imageA.data[alphaIndex];
        }
    }
    
}