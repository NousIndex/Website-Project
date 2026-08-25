import '@testing-library/jest-dom';

// react-modal binds to #root at import time (Modal.setAppElement('#root')),
// which the real index.html provides. jsdom needs it created up front or any
// module that imports a modal throws on load.
// API tests run in the node environment and have no DOM at all.
if (typeof document !== 'undefined' && !document.getElementById('root')) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}
