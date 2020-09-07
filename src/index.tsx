import React, { useContext, useReducer, useState } from 'react';
import { render } from 'react-dom';

enum LightColor {
  red,
  yellow,
  green
};

const App: React.FunctionComponent = () => {
  const [lightColor, setLightColor] = useState(LightColor.red);

  const turnGreen = () => {
    setLightColor(LightColor.green);
    setTimeout(() => setLightColor(LightColor.yellow), 2500);
    setTimeout(() => setLightColor(LightColor.red), 5000);
  }

  return(
    <div className="root">
      <div className="traffic-light">
        {
          Object.values(LightColor)
          .slice(3)
          .map(color => (<div className={'traffic-light__light' + (lightColor === color ? ' traffic-light__light--active' : '')}></div>))

        }
      </div>
      <button onClick={() => turnGreen() } disabled={ lightColor !== LightColor.red }>Turn Green</button>
    </div>
  );
}

render(<App />, document.getElementById('root'));
