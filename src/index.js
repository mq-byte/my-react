import React from './react/react';
import ReactDOM from './reactDom/react-dom';


const vdomTree = <div>
  <article>
    <span>1</span>
  </article>
  <p>
    <strong>s</strong>
  </p>
  <a >a</a>
</div>;

ReactDOM.render(
  vdomTree,
  document.getElementById('root')
);

