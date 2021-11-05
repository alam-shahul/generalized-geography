import { useState, useEffect } from 'react';
import createGraphLayout from './layout'

import ReactFlow, {
  removeElements,
  addEdge,
  isNode,
  MiniMap,
  Controls,
  Background
} from 'react-flow-renderer';
	  
import { wordset } from "./countries.js";

import './App.css';

function App() {
  const [wordsetTitle, setWordsetTitle] = useState("countries");
  const [guess, setGuess] = useState()
  const [showFullMap, setShowFullMap] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const startNode = {
    id: '1',
    type: 'input', // input node
    data: { label: 'Belgium' },
    position: { x: 250, y: 25 },
  }
  
  const initialElements = [startNode];

  const [lastNode, setLastNode] = useState(startNode);
  const [completeElements, setCompleteElements] = useState();
  const [elements, setElements] = useState(initialElements);
  const [viewFitHook, setViewFitHook] = useState(() => () => {});

  useEffect(() => {
    const finalWordset = loadWordset(wordsetTitle);
    const allElements = buildCompleteGraph(finalWordset);
    createGraphLayout(allElements)
      .then(els => {
		setCompleteElements(els);
	  })
      .catch(err => console.error(err))
  }, [wordsetTitle]);

  const onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  };

  function loadWordset(wordsetTitle) {
    let newWordset = null;
    try {
	  newWordset = wordset;
    }
    catch (error) {
      console.log(error);
    }

    return newWordset
  }

  function buildCompleteGraph(names) {
    const firstLetterMap = new Map();
    let nodes = [];
    let edges = [];
    for (const name of names) {
      const node = {
        id: (nodes.length + 1).toString(),
        data: { label: name },
        position: { x: 250, y: 25},
		connectable: false
      }

      nodes.push(node);
    }

    for (const node of nodes) {
      const firstLetter = node.data.label[0].toLowerCase();

      const neighbors = firstLetterMap.get(firstLetter);
      if (neighbors)
        firstLetterMap.set(firstLetter, [...neighbors, node]);
      else
        firstLetterMap.set(firstLetter, [node]);
    }
    
    for (const node of nodes) {
      const lastLetter = node.data.label[node.data.label.length - 1];
      const neighbors = firstLetterMap.get(lastLetter);
	  if (!neighbors)
		continue
      for (const neighbor of neighbors) { 
        if (neighbor.id === node.id)
          continue
        
        const edge = {
          id: " ".concat("e", node.id, "-", neighbor.id),
          source: node.id,
          target: neighbor.id,
		  type: "straight",
          style: { strokeWidth: '2.5' , stroke: "#b1b1b7"},
          arrowHeadType: "arrowclosed"
        };
        
        edges.push(edge);
      }
    }
    return [...nodes, ...edges];
  }

  function addNode(name) {
    const newNode = {
      id: (elements.length + 1).toString(),
      data: { label: name },
      position: { x: 250, y: 25},
    }
 	
    const edge = {
      id: " ".concat("e", lastNode.id, "-", newNode.id),
      source: lastNode.id,
      target: newNode.id,
      style: { strokeWidth: '2.5' , stroke: "red"},
      arrowHeadType: "arrowclosed"
    };

	let extraneousEdges = [];
	let firstLetter = name[0].toLowerCase();
	let lastLetter = name[name.length-1].toLowerCase();
    for (const element of elements) {
      if (!isNode(element) || element.id === lastNode.id)
		continue
	  let otherFirstLetter = element.data.label[0].toLowerCase();
	  let otherLastLetter = element.data.label[element.data.label.length - 1].toLowerCase();
	  if (firstLetter === otherLastLetter) {
        const extraneousEdge = {
          id: " ".concat("e", element.id, "-", newNode.id),
          source: element.id,
          target: newNode.id,
          style: { strokeWidth: '2.5' , stroke: "#b1b1b7", strokeDasharray: "5 5"},
          arrowHeadType: "arrowclosed"
        };
		extraneousEdges.push(extraneousEdge);
	  }
	  if (lastLetter === otherFirstLetter) {
        const extraneousEdge = {
          id: " ".concat("e", newNode.id, "-", element.id),
          source: newNode.id,
          target: element.id,
          style: { strokeWidth: '2.5' , stroke: "#b1b1b7", strokeDasharray: "5 5"},
          arrowHeadType: "arrowclosed"
        };
		extraneousEdges.push(extraneousEdge);
	  }
    }

    let newElements = [...elements, newNode, ...extraneousEdges, edge];
	setLastNode(newNode);
    createGraphLayout(newElements)
      .then(els => setElements(els))
      .catch(err => console.error(err))
  }

  function handleSubmit(e) {
	e.preventDefault();
    if (!e.target.guess.value)
	  return
    
    let lastLetter = lastNode.data.label[lastNode.data.label.length-1].toLowerCase();
	if (lastLetter !== e.target.guess.value[0].toLowerCase()) {
	  setErrorMessage(`Your guess doesn't start with the letter '${lastLetter}'!`);
	  return
    }

    for (const element of elements) {
	  if (isNode(element) && element.data.label.toLowerCase() === e.target.guess.value.toLowerCase()){
	    setErrorMessage(`"${e.target.guess.value}" has already been guessed!`);
		return
      }
	}
  
	let inWordlist = false;  
    for (const element of completeElements) {
	  if (isNode(element) && element.data.label.toLowerCase() === e.target.guess.value.toLowerCase()) {
        inWordlist = true;
		break;
      }

	}
    if (! inWordlist) {
	  setErrorMessage(`"${e.target.guess.value}" is not in the wordlist!`);
	  return
    }

	addNode(e.target.guess.value);
  }

  return (
      <div className="gameBox">
        { showFullMap ?
          <></>
          :
          <>
            <br/>
            <div>
              Where to next?
            </div>
            <br/>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="guess"
		    	value={guess}
                onChange={(e) => {setGuess(e.target.value); setErrorMessage();}}
              />
              <input type="submit" value="Guess" />
            </form>
          </>
        }
        <br/>
		<button onClick={() => setShowFullMap(!showFullMap)}>{showFullMap ? "Hide Full Map" : "Show Full Map"}</button>
        <br/>
		<div style={{color: "red"}}>{errorMessage}</div>
        <br/>
        <div style={{ border: "1px solid black", width: 750, height: 750 }}>
		  <ReactFlow
			elements={(showFullMap) ? completeElements : elements}
			panOnScroll={true}
			onlyRenderVisibleElements={true}
			onLoad={(instance) => {setTimeout(() => onLoad(instance), 500); setViewFitHook(() => () => onLoad(instance));}}
		  >
            <MiniMap />
            <Controls />
            <Background />
		  </ReactFlow>
		</div>
      </div>
  );
}

export default App;
