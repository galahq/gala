/**
 * A helper function to combine multiple refs so they change together.
 *
 * @providesModule mergeRefs
 * @noflow
 */

const mergeRefs = (...refs) => ref => {
  refs.forEach(resolvableRef => {
    if (typeof resolvableRef === 'function') {
      resolvableRef(ref)
    } else {
      resolvableRef.current = ref
    }
  })
}

export default mergeRefs
