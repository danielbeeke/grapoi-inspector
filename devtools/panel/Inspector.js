const getPointers = function () {
  return window.grapoiPointers.map(pointer => {
    return {
      datasets: pointer.datasets.map(dataset => [...dataset].map(item => ({ subject: item.subject.value, predicate: item.predicate.value, object: item.object.value }))),
      terms: [...pointer.quads()].map(quad => [quad.subject.value]),
      label: pointer.label
    }
  })
}

let activeGraphIndex = 0

chrome.devtools.inspectedWindow.eval(`(${getPointers})()`, (grapoiPointers, err) => {
  const options = []
  const lastPart = (string) => {
    const parts = string.split(/\/|#/g).filter(Boolean)
    return parts.pop()
  }
  for (const grapoiPointer of grapoiPointers) options.push(grapoiPointer.label)

  const graphSelector = `
    <select class="dropdown" id="graph-selector">
      ${options.map((label, index) => `<option value=${index}>${label}</option>`)}
    </select>
  `

  document.body.innerHTML = `
    ${graphSelector}

    <div id="graph"></div>
  `

  document.body.querySelector('#graph-selector').addEventListener('change', (event) => {
    activeGraph = parseInt(event.target.value)
  })

  const activeGraph = grapoiPointers[activeGraphIndex]

  const nodes = new Map()
  const edges = new Map()

  const nodeColor = (iriOrLiteral) => {
    return iriOrLiteral.startsWith('http') ? '#aaa' : '#ddd'
  }

  for (const dataset of activeGraph.datasets) {
    for (const quad of dataset) {
      nodes.set(quad.subject, { 
        id: quad.subject, 
        label: lastPart(quad.subject),
        title: quad.subject,
        shape: 'box',
        color: nodeColor(quad.subject)
      })

      const objectId = quad.subject + quad.predicate + quad.object
      nodes.set(quad.object, { 
        id: quad.object, 
        label: lastPart(quad.object),
        width: 3,
        title: quad.object,
        shape: 'box',
        color: nodeColor(quad.object)
      })

      edges.set(objectId, { 
        from: quad.subject, 
        to: quad.object,
        label: lastPart(quad.predicate),
        title: quad.predicate,
        arrows: { to: true },
        font: { align: "top", vadjust: -2 }
      })
    }
  }

  const nodesDataset = new vis.DataSet([...nodes.values()])
  const edgesDataset = new vis.DataSet([...edges.values()])

  const container = document.getElementById("graph")
  const data = { nodes: nodesDataset, edges: edgesDataset }

  const network = new vis.Network(container, data, {})
})
