import * as React from 'react'
import Blog from 'catalog/home/Blog'
import GetStarted from 'catalog/home/GetStarted'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'


export default function InfoPanel() {
    return (
        <PanelContainer>
                <PanelSection solid>
                    <SectionTitle><FormattedMessage id="catalog.infoPanel.getStarted"/></SectionTitle>
                    <GetStarted />
                </PanelSection>
                <PanelSection solid>
                    <SectionTitle><FormattedMessage id="catalog.infoPanel.community"/></SectionTitle>
                    <Blog />
                </PanelSection>
                <PanelSection solid>
                    <SectionTitle><FormattedMessage id="catalog.infoPanel.newsAndUpdates"/></SectionTitle>
                    <Blog />
                </PanelSection>
        </PanelContainer> 
    )
}

const PanelContainer = styled.div`
    display: grid;
    grid: auto-flow / 1fr 1fr 1fr;
    grid-gap: 1em 1.5em;
    margin-bottom: 1em;

    @media (max-width: 1000px) {
        grid-template-columns: 1fr;

    }

`

const PanelSection= styled(CatalogSection)`
    padding: 1rem;
    background-color: rgba(66,158,74,.25);
    margin: 0;
    
    a {
        color: white;
    }

    a:hover {
        text-decoration: underline;
    }

    li {
        margin-bottom: .3rem;
        color: white;
    }
`

