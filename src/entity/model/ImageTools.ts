
  const toBlob = (canvas: HTMLCanvasElement) => {
    return new Promise<Blob>(resolve => {
      canvas.toBlob(resolve as BlobCallback, undefined, 1);
    });
  };

  export const resizeImage = async (imageData: Buffer, width: number = 64, height: number = 64) => {
    let img = new Image();
    img.src = 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(imageData)));
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

