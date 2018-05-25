/**
 * @flow
 */

import styled, { css } from 'styled-components'

export const Container = styled.div`
  margin-bottom: -0.5rem;
  position: relative;
`

export const Description = styled.span`
  display: block;
  font-size: 0.8rem;
  line-height: 1.3;
  margin-top: 0.25rem;
`

export const Embed = styled.div`
  iframe {
    width: 100%;
  }

  ${p =>
    p.ratio &&
    css`
      position: relative;
      padding-bottom: ${100 * p.ratio[1] / p.ratio[0]}%;
      height: 0;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `};
`

export const Image = styled.img`
  border-top-left-radius: 2pt;
  border-top-right-radius: 2pt;
  width: 100%;
`

export const Text = styled.p`
  background-color: #49647d;
  border-radius: 2pt;
  padding: 0.5em 0.75em;

  ${Image} + & {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-top: -6px;
  }
`

export const Title = styled.strong`
  display: block;
  font-size: 105%;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.2;
`
