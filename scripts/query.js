import Handlers from './handlers.js';

function check(imageContainer, osdContainer) {
  const params = new URLSearchParams(location.search);
  if (params.has('url')) process(params.get('url'));
  else if (params.has('urls')) process(decode(params.get('urls')));
  load(imageContainer, osdContainer);
  open(imageContainer);
}

function process(urls) {
  document.getElementById('urls-textarea').value = urls;
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