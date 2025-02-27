import Handlers from './handlers.js';

function check(data, imageContainer, osdContainer) {
  try {
    if (!data?.urls) throw 'No Urls array passed via postmessage';
    let index = data?.index ? Number(data.index) : 0;
    let transfer = process(data.urls);
    load(transfer, imageContainer, osdContainer);
    open(index, imageContainer);
  } catch (error) {
    alert(error);
  }
}

function process(urls) {
  if (!Array.isArray(urls)) throw 'Urls is not an array at process function';
  let transfer = new DataTransfer();
  for (const url of urls) {
    let file = extract(url);
    transfer.items.add(file);
  }
  return transfer;
}

function extract(url) {
  let mime = url.split(';')[0].split(':')[1];
  let chars = atob(url.split(',')[1]);
  let bytes = []
  for (let offset = 0; offset < chars.length; offset++) {
    bytes.push(chars.charCodeAt(offset));
  }
  let byteArray = new Uint8Array(bytes);
  let blob = new Blob([byteArray], { type: mime });
  let file = new File([blob], 'image.png', { type: mime });
  return file;
}

function load(transfer, imageContainer, osdContainer) {
  let input = document.getElementById('input');
  input.files = transfer.files;
  Handlers.handleFiles({ currentTarget: input }, imageContainer, osdContainer);
}

function open(index, imageContainer) {
  let imgs = imageContainer.querySelectorAll('img');
  if (imgs.length < index + 1) throw 'Index higher than total images'
  imgs[index].click();
}

export default {
  check
}