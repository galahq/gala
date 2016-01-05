import React from 'react';
import '../stylesheets/CaseReader.scss';

import Narrative from './Narrative.js'
import Sidebar from './Sidebar.js'

function mapNL(nodeList, callback) {
  var arr = [];
  for(var i = 0, ll = nodeList.length; i != ll; i++) {
    arr.push(callback(nodeList[i]));
  }
  return arr;
}

class CaseReader extends React.Component {

  constructor() {
    super()

    this.state = {
      title: '',
      chapters: []
    }
  }

  generateChapters(splits) {
    return splits.map( (split) => {

      var x = document.createElement('div');
      x.innerHTML = split;

      return mapNL(x.children, (para) => { return para } )
    } )
  }

  parseCaseFromJSON(response) {
    let chapters = this.generateChapters(response.content.rendered.split('<hr />'))
    return({
      title: response.title.rendered,
      chapters: chapters
    })
  }

  componentDidMount() {
    $.ajax({
      type: 'GET',
      url: 'http://remley.wcbn.org/ihih-msc/index.php',
      data: [
        {name: 'rest_route', value: `/wp/v2/posts/${this.props.id}`}
      ],
      dataType: 'json',
      success: (response) => {
        this.setState(this.parseCaseFromJSON(response))
      }
    })
  }

  render () {
    let {title, chapters} = this.state
    return (
      <div id="CaseReader">
        <header>
          <h1 id="logo">MSC Logo</h1>
        </header>
        <Sidebar title={title} />
        <Narrative chapters={chapters}/>
      </div>
    )
  }
}

export default CaseReader
