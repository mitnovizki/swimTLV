function createDeveloper(name) {
  const developer = { name }
  return {
    ...developer,
    ...canCode(developer)
  }
}

function createBackendDeveloper(name) {
  const developer = createDeveloper(name)//simulate 
  return {
    ...developer,
    ...canNodeJs(developer)
  }
}

function createFrontEndDeveloper(name) {
  const developer = createDeveloper(name)//simulate 
  return {
    ...developer,
    ...canAngular(developer)
  }
}

function createFullStackDeveloper(name) {
  const developer = createFrontEndDeveloper(name)
  {
    return {
      ...developer,
      ...canNodeJs(developer)
    }
  }
}

function canCode({ name }) {
  return {
    code: () => console.log(`${name} is coding...`)
  }
}

function canNodeJs({ name }) {
  return {
    nodeJS: () => console.log(`${name} can code in node.js YEAH!...`)
  }
}

function canAngular({ name }) {
  return {
    angular: () => console.log(`${name} can code in Angular! `)
  }
}

const developer = createDeveloper('Sany')
developer.code()

const backEndDeveloper = createBackendDeveloper('Tom')
backEndDeveloper.code()
backEndDeveloper.nodeJS()

const frontEndDeveloper = createFrontEndDeveloper('Tom')
frontEndDeveloper.code()
frontEndDeveloper.angular()

const fullstack = createFullStackDeveloper('Alena')
fullstack.code()
fullstack.angular()
fullstack.nodeJS()
