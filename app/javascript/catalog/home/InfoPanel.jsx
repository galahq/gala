import * as React from 'react'
import Blog from 'catalog/home/Blog'
import InfoComponent1 from 'catalog/home/InfoComponent1'
import InfoComponent2 from 'catalog/home/InfoComponent2'


export default function InfoPanel() {
    return (
        <div className="infoPanel">
            <div className='infoBox' id='infoBoxLeft'>
            <InfoComponent1 />
            </div>
            <div className='infoBox' id='infoBoxMiddle'>
            <InfoComponent2 />
            </div>
            <div className='infoBox' id='infoBoxRight'>
            <Blog />
            </div>
        </div>
    )
}