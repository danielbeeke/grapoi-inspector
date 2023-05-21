import grapoi from 'grapoi'
import housemd from 'housemd'
import rdf from 'rdf-ext'

window.grapoiPointers = []
const inspectedGrapoi = (...args) => {
  const pointer = grapoi(...args)
  pointer.label = args[0].label
  window.grapoiPointers.push(pointer)
  return pointer
}

const ns = {
  house: rdf.namespace('https://housemd.rdf-ext.org/'),
  rdf: rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  schema: rdf.namespace('http://schema.org/'),
  xsd: rdf.namespace('http://www.w3.org/2001/XMLSchema#')
}

const dataset = rdf.dataset(housemd({ factory: rdf }))

const people = inspectedGrapoi({ dataset, term: ns.house('person/'), label: 'people' })

console.log('people in the house dataset:')

for (const quad of people.out(ns.schema.hasPart).quads()) {
  console.log(`\t${quad.object.value}`)
}

const house = inspectedGrapoi({ dataset, factory: rdf, term: 'Gregory', label: 'Gregory' }).in().trim()

console.log('properties of the guy named Gregory:')

for (const quad of house.out().quads()) {
  console.log(`\t${quad.predicate.value}: ${quad.object.value}`)
}

const address = house
  .out(ns.schema.homeLocation)
  .out(ns.schema.address)

console.log('address of the guy named Gregory:')

for (const quad of address.trim().out().quads()) {
  console.log(`\t${quad.predicate.value}: ${quad.object.value}`)
}

const nationalities = house
  .out(ns.schema.knows)
  .out(ns.schema.nationality)
  .distinct()

console.log('nationalities of all known people:')

for (const value of nationalities.values) {
  console.log(`\t${value}`)
}