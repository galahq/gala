/*  */



export function sortedUniqueVisits (rows) {
  const uniq = Array.from(new Set(rows.map(row => Math.max(0, row.unique_visits))))
  return uniq.sort((a, b) => a - b)
}

export function calculateBins (
  values,
  requestedBinCount = 5
) {
  if (!values.length) return []

  const binCount = Math.max(1, Math.min(requestedBinCount, values.length))
  if (binCount === 1) {
    const max = values[values.length - 1] || 0
    return [{ bin: 0, min: 0, max, label: `0-${max}` }]
  }

  const minValue = values[0]
  const maxValue = values[values.length - 1]
  const boundaries = Array.from({ length: binCount }, (_, i) => {
    if (i === 0) return minValue
    if (i === binCount - 1) return maxValue
    const percentile = (i * 100) / (binCount - 1)
    const index = Math.round((percentile / 100) * (values.length - 1))
    return values[index]
  })

  const deduped = Array.from(new Set(boundaries))

  return deduped.map((boundary, index) => {
    const min = index === 0 ? 0 : deduped[index - 1]
    const max = boundary
    const isLast = index === deduped.length - 1

    return {
      bin: index,
      min,
      max,
      label: isLast ? `${min}+` : `${min}-${max}`,
    }
  })
}

export function binForValue (value, bins) {
  if (!bins.length || value === 0) return 0

  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i]
    if (value >= bin.min && value <= bin.max) {
      return bin.bin
    }
  }

  return bins[bins.length - 1].bin
}
