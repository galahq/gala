export const decorator = new CompositeDecorator([
  {
    strategy: getFindEntityFunction('EDGENOTE'),
    component: EdgenoteEntity,
  }, {
    strategy: getFindEntityFunction('CITATION'),
    component: CitationEntity,
  },
])
