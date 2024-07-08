import * as React from 'react'
import Blog from 'catalog/home/Blog'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import styled from 'styled-components'


export default function InfoPanel() {
    return (
        <PanelContainer>
                <PanelSection solid>
                    <SectionTitle>Get Started</SectionTitle>
                    <Blog />
                </PanelSection>
                <PanelSection solid>
                    <SectionTitle>Community</SectionTitle>
                    <Blog />
                </PanelSection>
                <PanelSection solid>
                    <SectionTitle>News & Updates</SectionTitle>
                    <Blog />
                </PanelSection>
        </PanelContainer> 
    )
}

const PanelContainer = styled.div`
    display: grid;
    grid: auto-flow / 1fr 1fr 1fr;
    grid-gap: .5rem;
`

const PanelSection= styled(CatalogSection)`
    padding: 1rem;
    background-color: rgba(66,158,74,.25);
    
    a {
        color: white;
    }

    a:hover {
        text-decoration: underline;
    }

    li {
        margin-bottom: .3rem;
    }
`

