class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.enabled = true;
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleKeyDown(event) {
    if (!this.enabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.isContentEditable) {
      return;
    }

    const key = this.getKeyString(event);
    const handler = this.shortcuts.get(key);
    
    if (handler && handler.onKeyDown) {
      event.preventDefault();
      handler.onKeyDown(event);
    }
  }

  handleKeyUp(event) {
    if (!this.enabled) return;
    
    const key = this.getKeyString(event);
    const handler = this.shortcuts.get(key);
    
    if (handler && handler.onKeyUp) {
      event.preventDefault();
      handler.onKeyUp(event);
    }
  }

  getKeyString(event) {
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    if (event.metaKey) parts.push('Meta');
    
    // Special keys
    const key = event.key === ' ' ? 'Space' : event.key;
    parts.push(key);
    
    return parts.join('+');
  }

  register(keyCombo, handler, description) {
    this.shortcuts.set(keyCombo, {
      ...handler,
      description
    });
  }

  unregister(keyCombo) {
    this.shortcuts.delete(keyCombo);
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  getShortcutsList() {
    const list = [];
    this.shortcuts.forEach((handler, key) => {
      list.push({
        key,
        description: handler.description
      });
    });
    return list;
  }

  dispose() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.shortcuts.clear();
  }
}

// Professional CNC keyboard shortcuts configuration
export const setupCNCShortcuts = (callbacks) => {
  const shortcuts = new KeyboardShortcuts();

  // Simulation Control
  shortcuts.register('Space', {
    onKeyDown: () => callbacks.playPause?.()
  }, 'Play/Pause simulation');

  shortcuts.register('Escape', {
    onKeyDown: () => callbacks.stop?.()
  }, 'Stop simulation');

  shortcuts.register('F10', {
    onKeyDown: () => callbacks.stepForward?.()
  }, 'Step forward');

  shortcuts.register('F9', {
    onKeyDown: () => callbacks.stepBackward?.()
  }, 'Step backward');

  // View Control
  shortcuts.register('1', {
    onKeyDown: () => callbacks.setView?.('top')
  }, 'Top view');

  shortcuts.register('2', {
    onKeyDown: () => callbacks.setView?.('front')
  }, 'Front view');

  shortcuts.register('3', {
    onKeyDown: () => callbacks.setView?.('side')
  }, 'Side view');

  shortcuts.register('4', {
    onKeyDown: () => callbacks.setView?.('iso')
  }, 'Isometric view');

  shortcuts.register('f', {
    onKeyDown: () => callbacks.zoomToFit?.()
  }, 'Zoom to fit');

  // Jog Control (Arrow keys)
  shortcuts.register('ArrowLeft', {
    onKeyDown: () => callbacks.jog?.('X', -1),
    onKeyUp: () => callbacks.jogStop?.()
  }, 'Jog X-');

  shortcuts.register('ArrowRight', {
    onKeyDown: () => callbacks.jog?.('X', 1),
    onKeyUp: () => callbacks.jogStop?.()
  }, 'Jog X+');

  shortcuts.register('ArrowUp', {
    onKeyDown: () => callbacks.jog?.('Y', 1),
    onKeyUp: () => callbacks.jogStop?.()
  }, 'Jog Y+');

  shortcuts.register('ArrowDown', {
    onKeyDown: () => callbacks.jog?.('Y', -1),
    onKeyUp: () => callbacks.jogStop?.()
  }, 'Jog Y-');

  shortcuts.register('PageUp', {
    onKeyDown: () => callbacks.jog?.('Z', 1),
    onKeyUp: () => callbacks.jogStop?.()
  }, 'Jog Z+');

  shortcuts.register('PageDown', {
    onKeyDown: () => callbacks.jog?.('Z', -1),
    onKeyUp: () => callbacks.jogStop?.()
  }, 'Jog Z-');

  // Speed Control
  shortcuts.register('+', {
    onKeyDown: () => callbacks.increaseSpeed?.()
  }, 'Increase simulation speed');

  shortcuts.register('-', {
    onKeyDown: () => callbacks.decreaseSpeed?.()
  }, 'Decrease simulation speed');

  // File Operations
  shortcuts.register('Ctrl+n', {
    onKeyDown: () => callbacks.newProject?.()
  }, 'New project');

  shortcuts.register('Ctrl+o', {
    onKeyDown: () => callbacks.openFile?.()
  }, 'Open file');

  shortcuts.register('Ctrl+s', {
    onKeyDown: () => callbacks.saveFile?.()
  }, 'Save file');

  // Edit Operations
  shortcuts.register('Ctrl+z', {
    onKeyDown: () => callbacks.undo?.()
  }, 'Undo');

  shortcuts.register('Ctrl+y', {
    onKeyDown: () => callbacks.redo?.()
  }, 'Redo');

  shortcuts.register('Ctrl+f', {
    onKeyDown: () => callbacks.find?.()
  }, 'Find');

  shortcuts.register('Ctrl+h', {
    onKeyDown: () => callbacks.replace?.()
  }, 'Replace');

  // Panel Control
  shortcuts.register('g', {
    onKeyDown: () => callbacks.togglePanel?.('gcode')
  }, 'Toggle G-code panel');

  shortcuts.register('t', {
    onKeyDown: () => callbacks.togglePanel?.('tools')
  }, 'Toggle tools panel');

  shortcuts.register('m', {
    onKeyDown: () => callbacks.togglePanel?.('machine')
  }, 'Toggle machine panel');

  // Display Options
  shortcuts.register('w', {
    onKeyDown: () => callbacks.toggleWireframe?.()
  }, 'Toggle wireframe');

  shortcuts.register('a', {
    onKeyDown: () => callbacks.toggleAxes?.()
  }, 'Toggle axes');

  shortcuts.register('p', {
    onKeyDown: () => callbacks.toggleToolpath?.()
  }, 'Toggle toolpath');

  shortcuts.register('r', {
    onKeyDown: () => callbacks.toggleRapids?.()
  }, 'Toggle rapid moves');

  // Help
  shortcuts.register('F1', {
    onKeyDown: () => callbacks.showHelp?.()
  }, 'Show help');

  shortcuts.register('?', {
    onKeyDown: () => callbacks.showShortcuts?.()
  }, 'Show keyboard shortcuts');

  return shortcuts;
};

export default KeyboardShortcuts;