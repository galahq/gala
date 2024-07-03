import * as React from 'react'
import Blog from 'catalog/home/Blog'
import InfoComponent1 from 'catalog/home/InfoComponent1'
import InfoComponent2 from 'catalog/home/InfoComponent2'


export default function InfoPanel() {
    return (
        <div className="infoPanel">
            <div className='infoBox'>
            <InfoComponent1 />
            </div>
            <div className='infoBox' id='middle'>
            <InfoComponent2 />
            </div>
            <div className='infoBox'>
            <Blog />
            </div>
        </div>
    )
}