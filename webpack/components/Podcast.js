import React from 'react';
import Sidebar from './Sidebar.js'
import {I18n} from './I18n.js'
import {Card} from './Narrative.js'

class PodcastPlayer extends React.Component {
  constructor() {
    super()
    this.state = { playing: false }
  }

  renderHosts() {
    let p = this.state.playing ? "podcast-playing" : ""
    let {guests, hosts} = this.props.names
    let guestList = guests.map((guest) => {
      return [<dt>{guest.name}</dt>, <dd>{guest.title}</dd>]
    })
    return <div>
      <dl className={p}>{guestList}</dl>
      <em><I18n meaning="hosted_by" /> {hosts}</em>
    </div>
  }

  render() {
    let {title, artwork, audio} = this.props
    return (
      <div className="PodcastPlayer">
        <div
          className="artwork"
          style={{backgroundImage: `url(${artwork})`}}>
        </div>
        <div className="credits">
          <h1>{title}</h1>
          {this.renderHosts()}
        </div>

        <audio
          src={audio}
          controls="controls"
          onPlay={() => { this.setState({playing: true}) }}
          onPause={() => { this.setState({playing: false}) }}
        />

      </div>
    )
  }
}

class Podcast extends React.Component {
  render() {

    return (
      <div className="Podcast">
        <PodcastPlayer
          title="Ecology of Fear and Fear of Ecology: Can science do more to improve human–wildlife cohabitation?"
          artwork="https://www.nps.gov/common/uploads/photogallery/imr/park/yell/954CBB82-155D-451F-6759DA7CD789DC9F/954CBB82-155D-451F-6759DA7CD789DC9F.jpg"
          audio="http://www.hotinhere.us/podcast-download/28/ecology-of-fear-and-fear-of-ecology.mp3?ref=download"
          names={{
            guests: [
              {name: "Matthew Kauffman", title: "Professor of Zoology and Physiology at the University of Wyoming"},
              {name: "Maurita Holland", title: "Associate Professor Emerita, School of Information, University of Michigan"},
              {name: "Mayank Vikas", title: "Fulbright-Nehru Masters Fellow, School of Natural Resources and Environment, University of Michigan"}
            ],
            hosts: "Rebecca Hardin"
          }}
        />
      </div>
    )
  }
}

export class PodcastOverview extends React.Component {
  prepareSave() {
    this.props.handleEdit
  }

  render () {
    let {slug, title, coverURL, segmentTitles, selectedSegment, handleEdit} = this.props
    let description = {__html: "<p>Our hosts were joined in-studio and by pre-recorded interviews by guests including, Dr. Matthew Kauffman from the Wyoming Migration Initiative, Maurita Holland from the Washtenaw Citizens for Ecological Balance, and Mayank Vikas from the UM School of Natural Resources and Environment.</p><p>Dr. Matthew Kauffman is a Professor of Zoology and Physiology at the University of Wyoming, director and co-founder of the Wyoming Migration Initative, and is also the Leader of the Wyoming Cooperative Fish and Wildlife Research Unit. He received his Ph.D. from the University of California – Santa Cruz and did his post-doctoral research and teaching at the University of Montana. Dr. Kauffman is broadly trained as an ecologist and has research experience in a wide variety of ecosystems. He has a strong quantitative background with expertise in population and ecosystem modeling and analysis of spatial data. While in Montana, his research focused on predator-prey relationships between gray wolves and elk in the Greater Yellowstone Ecosystem. Dr. Kauffman began service at the Wyoming Cooperative Fish and Wildlife Research Unit during the summer of 2006. His current research focuses primarily on large carnivores and ungulates in terrestrial ecosystems. He continues research on Gray wolves and elk in the Greater Yellowstone Ecosystem, and has expanded his research to include moose and grizzly bears in that ecosystem. Dr. Kauffman is also conducting research on the effects of natural gas development on mule deer, elk, and pronghorn in the sagebrush biome and habitat fragmentation on avian communities. Dr. Kauffman is also conducting research on drought and predation effects on elk migrations in Wyoming, food webs and migration, semi-permeable barriers and migration, influence of elk migration on wolf habitat use, prioritizing migration routes for conservation and stopover ecology of migratory ungulate.</p>"}

    return (
      <div id="PodcastOverview" className={ `window ${this.props.handleEdit !== null ? 'editing' : ''}` }>

        <Sidebar
          slug={slug}
          coverURL={coverURL}
          title={title}
          segmentTitles={segmentTitles}
          selectedSegment={selectedSegment}
          handleEdit={handleEdit}
        />

        <Podcast />

        <div className="PodcastInfo">
          <Card
            handleEdit={this.props.handleEdit}
            prepareSave={this.prepareSave.bind(this)}
            contents={description}
          />
        </div>

      </div>
    )
  }
}
