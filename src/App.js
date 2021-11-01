import { useState } from 'react';
import createGraphLayout from './layout'

import ReactFlow, { removeElements, addEdge } from 'react-flow-renderer';

import logo from './logo.svg';
import './App.css';

function App() {
  const [guess, setGuess] = useState("Pennsylvania")

  const startNode = {
    id: '1',
    type: 'input', // input node
    data: { label: 'guess' },
    position: { x: 250, y: 25 },
  }
  
  const initialElements = [startNode];

  const [lastNode, setLastNode] = useState(startNode);
  const [elements, setElements] = useState(initialElements);


  function addNode(name) {
    const newNode = {
      id: (elements.length + 1).toString(),
      data: { label: name },
      position: { x: 250, y: 25},
    }
 	const edge = {id: " ".concat("e", lastNode.id, newNode.id), source: lastNode.id, target: newNode.id };
    let newElements = [...elements, newNode, edge];
	setLastNode(newNode);
    createGraphLayout(newElements)
      .then(els => setElements(els))
      .catch(err => console.error(err))
  }

  function handleSubmit(e) {
	e.preventDefault();
    console.log(e.target.guess.value);
    if (e.target.guess.value !== guess)
	  addNode(e.target.guess.value)
  }
  console.log(elements);

  return (
      <>
        <form onSubmit={handleSubmit}>
          <label>
            Where to go next?
          </label>
          <input
            type="text"
            name="guess"
			value={guess}
            onChange={(e) => setGuess(e.value)}
          />
          <input type="submit" value="Guess" />
        </form>
        <div style={{ height: 1000 }}>
		  <ReactFlow elements={elements} />
		</div>
      </>
  );
}

export default App;
