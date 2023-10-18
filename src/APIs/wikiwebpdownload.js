export async function downloadImageToFileSystem(url) {
  const webpUrl = url + '/revision/latest?cb=20150304054751&format=webp';

  try {
    // Fetch the image.
    const response = await fetch(webpUrl);
    const blob = await response.blob();

    // Create a Blob URL for the downloaded image.
    const blobUrl = URL.createObjectURL(blob);

    // Use the Blob URL or do something with it.
    // For example, display it in an <img> element.
    // const imgElement = document.getElementById('imageElement');
    // imgElement.src = blobUrl;

    return blobUrl;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}
