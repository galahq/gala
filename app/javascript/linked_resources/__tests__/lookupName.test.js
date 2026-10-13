/*  */

import lookupName, {
  FOUND,
  LOOKUP_TIMEOUT,
  NOT_FOUND,
  RETRY_DELAY,
  UNCHECKED,
  lookupIdentifier,
} from '../lookupName'

beforeEach(() => fetch.resetMocks())

describe('lookupIdentifier', () => {
  it('picks the first valid DOI or Wikidata identifier, normalized', () => {
    expect(
      lookupIdentifier([
        { type: 'url', value: 'https://example.org' },
        { type: 'doi', value: 'not a doi' },
        { type: 'wikidata', value: 'https://www.wikidata.org/wiki/q42' },
      ])
    ).toEqual({ type: 'wikidata', value: 'Q42' })
  })

  it('returns null when there is nothing to look up', () => {
    expect(lookupIdentifier([{ type: 'url', value: 'https://a.org' }])).toBe(
      null
    )
  })
})

describe('lookupName', () => {
  it('asks doi.org for CSL-JSON and strips markup from the title', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ title: 'The <i>E. coli</i>  genome' })
    )
    const result = await lookupName({ type: 'doi', value: '10.1000/a#b' })

    expect(result).toEqual({ status: FOUND, name: 'The E. coli genome' })
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('https://doi.org/10.1000/a%23b')
    expect(options.headers.Accept).toBe('application/vnd.citationstyles.csl+json')
  })

  it('prefers the Wikidata label in the reader’s language', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        entities: {
          Q42: {
            labels: {
              en: { value: 'Douglas Adams' },
              fr: { value: 'Douglas Adams (fr)' },
            },
          },
        },
      })
    )
    expect(
      await lookupName({ type: 'wikidata', value: 'Q42' }, { locale: 'fr' })
    ).toEqual({ status: FOUND, name: 'Douglas Adams (fr)' })
    expect(fetch.mock.calls[0][0]).toMatch(/languages=fr%7Cen/)
  })

  it('reports a DOI the handle system confirms doesn’t exist', async () => {
    fetch
      .mockResponseOnce('', { status: 404 })
      .mockResponseOnce(JSON.stringify({ responseCode: 100 }), { status: 404 })
    expect(await lookupName({ type: 'doi', value: '10.1000/x' })).toEqual({
      status: NOT_FOUND,
    })
    expect(fetch.mock.calls[1][0]).toBe('https://doi.org/api/handles/10.1000/x')
  })

  it('doesn’t warn about a real DOI that has no metadata to fetch', async () => {
    fetch
      .mockResponseOnce('', { status: 404 })
      .mockResponseOnce(JSON.stringify({ responseCode: 1 }))
    expect(await lookupName({ type: 'doi', value: '10.1000/x' })).toEqual({
      status: FOUND,
      name: null,
    })
  })

  it('reports a missing Wikidata item', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        entities: { Q999999999: { id: 'Q999999999', missing: '' }},
        success: 1,
      })
    )
    expect(
      await lookupName({ type: 'wikidata', value: 'Q999999999' })
    ).toEqual({ status: NOT_FOUND })
  })

  it('reports a Wikidata ID that doesn’t exist', async () => {
    fetch.mockResponseOnce(JSON.stringify({ error: { code: 'no-such-entity' }}))
    expect(await lookupName({ type: 'wikidata', value: 'Q0' })).toEqual({
      status: NOT_FOUND,
    })
  })

  it('can’t tell when the registry is unreachable or erroring', async () => {
    fetch.mockRejectOnce(new Error('offline'))
    expect(await lookupName({ type: 'doi', value: '10.1000/x' })).toEqual({
      status: UNCHECKED,
    })

    fetch.mockResponseOnce('', { status: 503 })
    expect(await lookupName({ type: 'doi', value: '10.1000/x' })).toEqual({
      status: UNCHECKED,
    })
  })

  it('doesn’t look up URLs', async () => {
    expect(await lookupName({ type: 'url', value: 'https://a.org' })).toEqual({
      status: UNCHECKED,
    })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('lookupName when a registry struggles', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  // A fetch that never answers, but rejects like a browser when aborted
  const hangingFetch = (url, { signal }) =>
    new Promise((resolve, reject) => {
      signal.addEventListener('abort', () =>
        reject(new DOMException('aborted', 'AbortError'))
      )
    })

  it('retries once after being rate limited', async () => {
    fetch
      .mockResponseOnce('', { status: 429 })
      .mockResponseOnce(JSON.stringify({ title: 'Second try' }))

    const result = lookupName({ type: 'doi', value: '10.1000/x' })
    await vi.advanceTimersByTimeAsync(RETRY_DELAY)

    expect(await result).toEqual({ status: FOUND, name: 'Second try' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('gives up after a second failure', async () => {
    fetch
      .mockResponseOnce('', { status: 503 })
      .mockResponseOnce('', { status: 503 })

    const result = lookupName({ type: 'doi', value: '10.1000/x' })
    await vi.advanceTimersByTimeAsync(RETRY_DELAY)

    expect(await result).toEqual({ status: UNCHECKED })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries Wikidata’s in-body rate limiting', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ error: { code: 'ratelimited' }}))
      .mockResponseOnce(
        JSON.stringify({
          entities: { Q42: { labels: { en: { value: 'Douglas Adams' }}}},
        })
      )

    const result = lookupName({ type: 'wikidata', value: 'Q42' })
    await vi.advanceTimersByTimeAsync(RETRY_DELAY)

    expect(await result).toEqual({ status: FOUND, name: 'Douglas Adams' })
  })

  it('stops waiting on a registry that doesn’t answer', async () => {
    fetch.mockImplementationOnce(hangingFetch)

    const result = lookupName({ type: 'doi', value: '10.1000/x' })
    await vi.advanceTimersByTimeAsync(LOOKUP_TIMEOUT)

    expect(await result).toEqual({ status: UNCHECKED })
  })

  it('rejects when the caller cancels', async () => {
    fetch.mockImplementationOnce(hangingFetch)
    const controller = new AbortController()

    const result = lookupName(
      { type: 'doi', value: '10.1000/x' },
      { signal: controller.signal }
    )
    controller.abort()

    await expect(result).rejects.toMatchObject({ name: 'AbortError' })
  })
})
