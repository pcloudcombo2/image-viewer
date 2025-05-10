import Modal from './modal.js';

let tiles;
let fail = new Set();
let done = new Set();

class OSD {
  static middle = function (info) {
    if (info?.button === 1) OSD.reset(info);
  }

  static scroll = function (info) {
    if (!info?.eventSource?.gestureSettingsMouse?.scrollToZoom) {
      let { deltaX, deltaY } = info?.originalEvent;
      let { x, y } = info?.eventSource?.viewport?.getCenter();
      if (deltaX) {
        let newX = deltaX > 0 ? x + 0.1 : x - 0.1;
        info?.eventSource?.viewport?.panTo(new OpenSeadragon.Point(newX, y));
      }
      else if (deltaY) {
        let newY = deltaY > 0 ? y + 0.1 : y - 0.1;
        info?.eventSource?.viewport?.panTo(new OpenSeadragon.Point(x, newY));
      }
    }
    else {
      const { deltaX } = info?.originalEvent;
      if (deltaX !== 0) {
        info.preventDefaultAction = true;
        if (deltaX > 0) OSD.mirror(info);
        else OSD.rotate(info);
      }
    }
  }

  static rotate = function (info) {
    prevent(info?.originalEvent);
    let degrees = info?.eventSource?.viewport?.getFlip() ? 90 : -90;
    info?.eventSource?.viewport?.rotateBy(degrees);
  }

  static mirror = function (info) {
    prevent(info?.originalEvent);
    info?.eventSource?.viewport?.toggleFlip();
  }

  static next = function (info) {
    prevent(info?.originalEvent);
    resetImg(info?.eventSource?.viewport);
    info?.eventSource?.goToNextPage();
  }

  static previous = function (info) {
    prevent(info?.originalEvent);
    resetImg(info?.eventSource?.viewport);
    info?.eventSource?.goToPreviousPage();
  }

  static reset = function (info) {
    prevent(info?.originalEvent);
    resetImg(info?.eventSource?.viewport);
    info?.eventSource?.viewport?.goHome();
  }

  static fullscreen = function (info) {
    prevent(info?.originalEvent);
    info?.eventSource?.setFullScreen(!info?.eventSource?.isFullScreen());
  }
}

class URLs {
  static container = document.getElementById('urls-container');
  static textarea = document.getElementById('urls-textarea');

  static show = function () {
    URLs.container.style.display = 'unset';
  }

  static hide = function () {
    URLs.container.style.display = 'none';
  }

  static submit = async function (imageContainer, osdContainer) {
    let value = URLs.textarea.value?.trim();
    let urls = value.split('\n');
    if (!value || !urls.length) return;
    let page = 0;
    tiles = [];
    imageContainer.innerHTML = '';
    for (const url of urls) {
      if (!url.startsWith('http')) continue;
      // if (url.includes('coomer')) await URLs.wait(0.5);
      tiles.push({
        type: 'image',
        url
      });
      addImageToContainer(url, page++, imageContainer, osdContainer);
    }
    URLs.textarea.value = '';
    URLs.hide();
    monitor(urls.length);
  }

  static wait = (secs) => {
    return new Promise(async (resolve, reject) => {
      setTimeout(() => resolve(), secs * 1000);
    });
  };
}

function top(event) {
  scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function fullscreenAlt() {
  let toggle = document.querySelector('div[title="Toggle full page"]');
  toggle?.dispatchEvent(new PointerEvent('pointerdown'));
  toggle?.dispatchEvent(new PointerEvent('pointerup'));
}

function addSideBtns(info) {
  if (info?.fullScreen) {
    addFullscreen(info);
    addScrollSelect(info)
  }
  else removeSideBtns();
}

function prevent(event) {
  event?.preventDefault();
  event?.stopImmediatePropagation();
}

function addFullscreen(info) {
  const button = document.createElement('button');
  button.id = 'fullscreen';
  button.textContent = 'Fullscreen';
  button.onclick = () => OSD.fullscreen(info);
  document.body.appendChild(button);
}

function addScrollSelect(info) {
  const button = document.createElement('button');
  button.id = 'scroll-select';
  button.innerHTML = `Scroll:${toggleSpan(info, true)}`;
  button.onclick = () => toggleScroll(info);
  document.body.appendChild(button);
}

function toggleScroll(info) {
  let { scrollToZoom } = info?.eventSource?.gestureSettingsMouse;
  if (scrollToZoom === undefined) return;
  let span = toggleSpan(info);
  if (scrollToZoom) {
    info.eventSource.gestureSettingsMouse.scrollToZoom = false;
  }
  else {
    info.eventSource.gestureSettingsMouse.scrollToZoom = true;
  }
  document.getElementById('scroll-select').innerHTML = `Scroll:${span}`;
}

function toggleSpan(info, current) {
  let { scrollToZoom } = info?.eventSource?.gestureSettingsMouse;
  let zoom = '<span style="color:green">Zoom</span>';
  let pan = '<span style="color:red">Pan</span>';
  let span;
  if (current) span = scrollToZoom ? zoom : pan;
  else span = scrollToZoom ? pan : zoom;
  return span;
}

function removeSideBtns() {
  document.getElementById('fullscreen')?.remove();
  document.getElementById('scroll-select')?.remove();
}

function resetImg(viewport) {
  viewport?.rotateTo(0, null, true);
  viewport?.setFlip(false);
}

function handleFiles(e, imageContainer, osdContainer) {
  const files = e.currentTarget.files;
  let page = 0;
  tiles = [];
  imageContainer.innerHTML = '';
  for (const file of files) {
    const url = URL.createObjectURL(file);
    tiles.push({
      type: 'image',
      url
    });
    addImageToContainer(url, page++, imageContainer, osdContainer);
  }
}

function addImageToContainer(url, page, imageContainer, osdContainer) {
  const img = document.createElement('img');
  img.src = url;
  img.dataset.page = page;
  img.className = 'image';
  img.onclick = (e) => { showImg(e.currentTarget.src, osdContainer) };
  img.onerror = (e) => { fail.add(url); };
  img.onload = (e) => { done.add(url); };
  imageContainer.appendChild(img);
}

function showImg(src, osdContainer) {
  osdContainer.innerHTML = '';
  Modal.show();
  const viewer = OpenSeadragon({
    element: osdContainer,
    zoomPerScroll: 1.5,
    maxZoomLevel: 20,
    springStiffness: 7.5,
    tileSources: tiles,
    prefixUrl: './images/',
    visibilityRatio: 1,
    animationTime: 1.8,
    showNavigator: false,
    showRotationControl: true,
    showFlipControl: true,
    navigatorPosition: 'BOTTOM_RIGHT',
    sequenceMode: true,
    gestureSettingsMouse: {
      scrollToZoom: true
    },
    initialPage: tiles.findIndex(v => v.url == src)
  });
  viewer.addHandler('canvas-contextmenu', OSD.next);
  viewer.addHandler('canvas-double-click', OSD.previous);
  viewer.addHandler('canvas-nonprimary-press', OSD.middle);
  viewer.addHandler('canvas-scroll', OSD.scroll);
  viewer.addHandler('full-screen', addSideBtns);
  viewer.addHandler('open', viewerOpen);
}

function viewerOpen(info) {
  document.getElementById('scroll-select').onclick = () => toggleScroll(info);
}

function monitor(total, cnt = 0, inc = 0) {
  let node = document.getElementById('status');
  if (done.size == total) return node.textContent = 'All finshed';
  if (inc > 30) {
    node.textContent = `Seems stuck. ${done.size}/${total} loaded. ${fail.size} failed. Click to remove. Context to retry.`;
    return remove()
  }
  if (fail.size + done.size != total) {
    node.textContent = `${done.size}/${total} loaded`;
  }
  return setTimeout(monitor, 500, total, done.size, cnt === done.size ? ++inc : 0);
}

function retry() {

}

function remove() {
  for (const src of fail) {
    document.querySelector(`img[src="${src}"]`)?.remove();
    tiles.splice(tiles.findIndex(v => v.url === src), 1);
  }
}

export default {
  OSD,
  URLs,
  top,
  scroll,
  addSideBtns,
  fullscreenAlt,
  handleFiles,
}