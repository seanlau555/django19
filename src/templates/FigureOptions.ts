import Quill from 'quill';
import {TaskerFigure} from './TaskerFigure';
import Parchment from 'parchment';

export class FigureOptions {

  quill: Quill;
  figure;
  overlay;
  linkRange;

  constructor(quill, options = {}) {

    this.quill = quill;
    this.quill.root.addEventListener('click', this.handleClick.bind(this), false);

    (<HTMLDivElement>this.quill.root.parentNode).style.position = (<HTMLDivElement>this.quill.root.parentNode).style.position || 'relative';

    this.quill.on('selection-change', (range, oldRange, source) => {
      this.linkRange = oldRange;
    });
  }

  handleClick(evt) {
    if (!evt.target) {
      return false;
    }
    if (this.setFigure(evt)) {

    } else if (this.figure) {
      // clicked on a non image
      this.hide();
    }
  }

  setFigure(evt): boolean {
    if (evt.target.classList.contains('tasker-figure')) {
      this.setBaseFigure(evt.target);
      return true;
    } else {
      let node = evt.target;
      while (true) {
        if (node.classList && node.classList.contains('tasker-figure')) {
          break;
        } else {
          node = node.parentNode;
        }
        if (node === undefined || node === null) {
          break;
        }
      }
      if (node) {
        this.setBaseFigure(node);
        return true;
      }
    }
    return false;
  }

  setBaseFigure(figure) {
    if (this.figure === figure) {
      return;
    }
    if (this.figure) {
      this.hide();
    }
    this.show(figure);
  }

  show(figure) {
    this.figure = figure;
    this.figure.classList.add('with-options');
    this.showOverlay();
  }

  showOverlay() {
    if (this.overlay) {
      this.hideOverlay();
    }

    this.quill.setSelection(null);

    // prevent spurious text selection
    this.setUserSelect('none');

    // listen for the image being deleted or moved
    // document.addEventListener('keyup', this.checkImage, true);
    // this.quill.root.addEventListener('input', this.checkImage, true);

    // Create and add the overlay
    this.overlay = document.createElement('div');
    const style = this.overlay.style;
    style.position = 'absolute';
    style.background = '#fff';
    style.border = '2px solid #1E90FF';
    style.borderRadius = '5px';
    style.width = 'auto';
    style.display = 'table';
    style.padding = '10px';
    style.margin = '0 auto';
    style.left = '50%';
    style.transform = 'translateX(-50%)';
    style.borderBottomLeftRadius = '0';
    style.borderBottomRightRadius = '0';
    style.borderBottom = '2px solid #fff';
    this.overlay.classList.add('tasker-figure-options')

    const inputField = document.createElement('input');
    inputField.value = TaskerFigure.value(this.figure).name;
    inputField.placeholder = 'Enter image caption...';

    inputField.addEventListener('input', (event) => {
      // console.log(child.value);
      // this.quill.formatText(this.linkRange, 'link', value, Emitter.sources.USER);
      // this.quill.format('taskerFigure', child.value);
      if (this.linkRange) {
        const delta = this.quill.formatText(this.linkRange.index, this.linkRange.length, 'tasker-caption', inputField.value, 'user');
      }
    });

    this.overlay.appendChild(inputField);

    const cancel = document.createElement('i');
    cancel.classList.add('material-icons');
    cancel.innerText = 'close';
    this.overlay.appendChild(cancel);

    const remove = document.createElement('i');
    remove.classList.add('material-icons');
    remove.classList.add('delete');
    remove.innerText = 'delete_forever';
    this.overlay.appendChild(remove);

    remove.addEventListener('click', (event) => {
      const blot = Parchment.find(this.figure);
      this.hide();
      blot.remove();
    });

    cancel.addEventListener('click', (event) => {
      this.hide();
    });

    this.quill.root.parentNode.appendChild(this.overlay);

    this.repositionElements();
  }

  repositionElements() {
    if (!this.overlay || !this.figure) {
      return;
    }

    // position the overlay over the image
    const parent: HTMLDivElement = <HTMLDivElement>this.quill.root.parentNode;
    const imgRect = this.figure.getBoundingClientRect();
    const containerRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      top: `${imgRect.top - containerRect.top + parent.scrollTop - 47.5}px`,
    });
  }

  hide() {
    this.figure.classList.remove('with-options');
    this.hideOverlay();
    this.figure = undefined;
  }

  hideOverlay()  {
    if (!this.overlay) {
      return;
    }

    // Remove the overlay
    this.quill.root.parentNode.removeChild(this.overlay);
    this.overlay = undefined;

    // stop listening for image deletion or movement
    // document.removeEventListener('keyup', this.checkImage);
    // this.quill.root.removeEventListener('input', this.checkImage);

    // reset user-select
    this.setUserSelect('');
  }

  setUserSelect(value) {
    [
      'userSelect',
      'mozUserSelect',
      'webkitUserSelect',
      'msUserSelect',
    ].forEach((prop) => {
      // set on contenteditable element and <html>
      this.quill.root.style[prop] = value;
      document.documentElement.style[prop] = value;
    });
  }
}
