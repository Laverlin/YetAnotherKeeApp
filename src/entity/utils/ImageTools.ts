
  const toBlob = (canvas: HTMLCanvasElement) => {
    return new Promise<Blob>(resolve => {
      canvas.toBlob(resolve as BlobCallback, undefined, 1);
    });
  };

  /**
   * change image dimentions to reduce the size
   * @param imageData binary image data
   * @param width width
   * @param height height
   * @returns binary image
   */
  export const resizeImage = async (imageData: Buffer, width: number = 64, height: number = 64) => {
    let img = new Image();
    img.src = image2Base64(imageData);
    await img.decode();

    if(img.height > img.width) {
        width = Math.floor(height * (img.width / img.height));
    }
    else {
        height = Math.floor(width * (img.height / img.width));
    }

    let resizingCanvas: HTMLCanvasElement = document.createElement('canvas');
    resizingCanvas.width = width
    resizingCanvas.height = height
    let resizingCanvasContext = resizingCanvas.getContext("2d");
    resizingCanvasContext!.imageSmoothingEnabled = true;
    resizingCanvasContext!.imageSmoothingQuality = 'high';
    resizingCanvasContext!.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

    const blob = await toBlob(resizingCanvas)
    return new Uint8Array(await blob.arrayBuffer());
  }

  /**
   * Converts binary data to base64 string to display the image
   * @param image binary data in {Buffer}
   * @returns base64 image
   */
  export const image2Base64 = (image: Buffer | ArrayBuffer) => {
    const data = image instanceof Buffer
      ? image
      : Buffer.from(image);
    return `data:image;base64,${data.toString('base64')}`;
  }

