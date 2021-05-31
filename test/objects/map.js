
const CURRENCY_MAP = new Map([])

//use object as a key|
const usa = { name: "United States" }
const ru = { name: "Russian Federation" }


CURRENCY_MAP.set(usa, "USD")
CURRENCY_MAP.set(ru, "RUB")

CURRENCY_MAP.forEach(cur => {
  console.log(cur)
});