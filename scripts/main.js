import Modal from './modal.js';
import Handlers from './handlers.js';
import Query from './query.js';

Modal.addToDom();
addHandlers();
const imageContainer = document.getElementById('image-container');
const osdContainer = document.getElementById('osd-container');
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('ready');

  }, 100);
});
window.addEventListener('message', (event) => Query.check(event, imageContainer, osdContainer));

function addHandlers() {
  document.getElementById('fullscreen').addEventListener('click', Handlers.fullscreenAlt);
  document.getElementById('input').addEventListener('change', (e) => Handlers.handleFiles(e, imageContainer, osdContainer));
  document.getElementById('top').addEventListener('click', Handlers.top);
  document.getElementById('urls').addEventListener('click', Handlers.URLs.show);
  document.getElementById('urls-cancel').addEventListener('click', Handlers.URLs.hide);
  document.getElementById('urls-submit').addEventListener('click', () => Handlers.URLs.submit(imageContainer, osdContainer));
}
window.opener.postMessage('ready', '*');