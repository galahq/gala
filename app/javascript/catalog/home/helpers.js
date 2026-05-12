/*  */

import * as R from 'ramda'


const sortGroup = (t) => t.displayName[0]

export const groupKeywords = R.pipe(
  R.sortWith([R.ascend(R.prop('displayName'))]),
  R.filter(tag => !tag.category),
  R.groupWith((a, b) => sortGroup(a) === sortGroup(b))
)
