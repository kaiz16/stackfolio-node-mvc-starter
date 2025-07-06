export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function chunkArray(array: any[], size: number) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function applyPercentageChanges(initial: number, percentages: number[]) {
  return percentages.reduce((amount, percent) => {
    return amount * (1 + percent / 100)
  }, initial)
}
