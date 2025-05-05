import React from './react';

function App() {
  const [state, setState] = React.useState(0);
  return (
    <div id="test">
      <button onClick={() => setState(state + 1)}>+</button>
      <span className="my-state">{state}</span>
    </div>
  );
}

export default App;
