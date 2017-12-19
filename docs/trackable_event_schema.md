# Trackable Event Schema

We are using [Ahoy](https://github.com/ankane/ahoy) to roll our own event analytics. We’re tracking

* the reader’s time per card and time of engagement with our edgenotes and podcast, providing formative data with which we can improve our cases
* which CaseElements the reader has engaged with, informing our analysis of pre/post test results and allowing us to identify students who skipped the case, going right to the evaluation

For these purposes we collect events with metadata according to the following schema:

### A reader visits the case overview

```javascript
{
  name: 'read_overview',
  properties: {
    case_slug: string,
    duration: number
  }
}
```

### A reader reads a card

```javascript
{
  name: 'read_card',
  properties: {
    case_slug: string,
    card_id: number,
    duration: number,
  },
}
```

### A reader engages with an edgenote

For video and audio edgenote, this counts time playing. For image edgenotes, this counts time zoomed in. For link edgenotes, the duration is meaningless; it counts one visit per event.

```javascript
{
  name: 'visit_edgenote',
  properties: {
    case_slug: string,
    edgenote_slug: string,
    duration: number,
  },
}
```

### A reader listens to a podcast

```javascript
{
  name: 'visit_podcast',
  properties: {
    case_slug: string,
    podcast_id: number,
    duration: number,
  },
}
```

### A reader visits a CaseElement page

```javascript
{
  name: 'visit_element',
  properties: {
    case_slug: string,
    element_type: 'Activity' | 'Page' | 'Podcast',
    element_id: number,
    duration: number
  },
}
```
