import Handlers from './handlers.js';

function check(data, imageContainer, osdContainer) {
  console.log(data);
  console.log(data.data);
  process2(data.data.urls[0], imageContainer, osdContainer);
  const params = new URLSearchParams(location.search);
  if (params.has('url')) process(params.get('url'));
  else if (params.has('urls')) process(decode(params.get('urls')));
  load(imageContainer, osdContainer);
  open(imageContainer);
}

function process(urls) {
  document.getElementById('urls-textarea').value = urls;
}

function process2(dataUrl, imageContainer, osdContainer) {
  const mimeType = dataUrl.split(';')[0].split(':')[1];
  const byteCharacters = atob(dataUrl.split(',')[1]);
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset++) {
    byteArrays.push(byteCharacters.charCodeAt(offset));
  }
  const byteArray = new Uint8Array(byteArrays);
  const blob = new Blob([byteArray], { type: mimeType });
  const file = new File([blob], 'image.png', { type: mimeType });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  const fileInput = document.getElementById('input');
  fileInput.files = dataTransfer.files;
  Handlers.handleFiles({ currentTarget: fileInput }, imageContainer, osdContainer)
}

function load(imageContainer, osdContainer) {
  Handlers.URLs.submit(imageContainer, osdContainer)
}

function decode(str) {

}

function open(imageContainer) {
  imageContainer.querySelector('img')?.click();
}

export default {
  check
}