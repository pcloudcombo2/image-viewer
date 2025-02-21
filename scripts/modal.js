class Modal {
  static addToDom = (content) => {
    this.clearExisting();
    this.addStyles();
    this.addModal(content);
  };

  static clearExisting = () => {
    let style = document.querySelector('style#modal-style');
    let modal = document.querySelector('div#modal');
    if (style != null) style.remove();
    if (modal != null) modal.remove();
  };

  static addStyles = () => {
    let style = document.createElement('style');
    style.id = 'modal-style';
    style.innerHTML = `
      div#modal {
        width: 98vw;
        height: 100vh;
        background-color: #373737;;
        color: white;
        position: fixed;
        top: 0;
        left: 0.5vw;
        z-index: 1000000;
        border-radius: 5px;
      }
  
      div#modal-container {
        display: flex;
        flex-flow: column;
        justify-content: start;
        align-items: center;
        padding: 2%;
        height: 95%;
        overflow: auto;
      }
  
      button#modal-close {
        font-size: x-large;
        background-color: transparent;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 1;
      }

      #osd-container {
        height: 100%;
        width: 100%;
      }
    `;
    document.body.appendChild(style);
  };

  static getInitialHtml = (content) => {
    return `
    <div id="modal-container">
      <button id="modal-close" onclick="this.parentNode.parentNode.style.display = 'none'">&#10060;</button>
      <button id="fullscreen">Fullscreen</button>
      <button id="scroll-select">Scroll:<span style="color:green">Zoom</span></button>
      <div id="osd-container"></div>
      ${content || ''}
    </div>
  `;
  };

  static addModal = (content) => {
    if (Array.isArray(content)) content = content.join('\r\n');
    let modal = document.createElement('div');
    modal.id = 'modal';
    modal.innerHTML = this.getInitialHtml(content);
    modal.style.display = 'none';
    document.body.appendChild(modal);
  };

  static replaceContent = (content) => {
    let modal = document.querySelector('div#modal');
    if (modal != null) {
      if (Array.isArray(content)) content = content.join('\r\n');
      modal.innerHTML = this.getInitialHtml(content);
    }
  };

  static appendContent = (content) => {
    let container = document.querySelector('div#modal-container');
    if (container != null) {
      if (Array.isArray(content)) content = content.join('\r\n');
      container.insertAdjacentHTML('beforeend', content)
    }
  };

  static show = () => {
    let modal = document.getElementById('modal');
    if (modal && modal.style.display != 'block') {
      modal.style.display = 'block';
      modal.scroll(0, 0);
    }
  }

  static hide = () => {
    let modal = document.getElementById('modal');
    if (modal && modal.style.display != 'none') {
      modal.style.display = 'none';
    }
  };
}

export default Modal