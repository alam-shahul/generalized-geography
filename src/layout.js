import Elk from 'elkjs/lib/elk.bundled.js';
import { isNode } from 'react-flow-renderer';

const DEFAULT_WIDTH = 75
const DEFAULT_HEIGHT = 75

const elk = new Elk({
  defaultLayoutOptions: {
    'elk.algorithm': 'elk.mrtree',
    'elk.spacing.nodeNode': '75',
  }
})

const createGraphLayout = async (elements) => {
  const nodes: ElkNode[] = []
  const edges: ElkPrimitiveEdge[] = []

  elements.forEach((el) => {
    if (isNode(el)) {
      nodes.push({
        id: el.id,
        width: el.__rf?.width ?? DEFAULT_WIDTH,
        height: el.__rf?.height ?? DEFAULT_HEIGHT
      })
    } else {
      edges.push({
        id: el.id,
        target: el.target,
        source: el.source
      })
    }
  })

  const newGraph = await elk.layout({
    id: 'root',
    children: nodes,
    edges: edges
  })
  return elements.map((el) => {
    if (isNode(el)) {
      const node = newGraph?.children?.find((n) => n.id === el.id)
      if (node?.x && node?.y && node?.width && node?.height) {
        el.position = {
          x: node.x - node.width / 2 + Math.random() / 1000 + 250,
          y: node.y - node.height / 2 + 25
        }
      }
    }
    return el
  })
}

export default createGraphLayout;
