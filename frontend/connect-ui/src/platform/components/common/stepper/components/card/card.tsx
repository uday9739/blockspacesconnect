import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { useSpring, animated, config } from '@react-spring/web'

const CardHeader = styled.div`
  display: flex;
  position: relative;
  border-bottom: 5px solid #c2c2a4;
  img {
    max-height: 12.5rem;
    flex-grow: 1;
    object-fit: cover;
  }
`

const CardTitle = styled.div`
  padding: 0 1rem;
  min-height: 4rem;
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  h2 {
    margin: 0;
    color: white;
  }
`

const CardContent = styled.div`
  padding: 1rem;
`

const CardFooter = styled.div`
  padding: 0 1rem;
  h4,
  h5 {
    display: inline-block;
  }
  h4 {
    padding-right: 1rem;
  }
`

export const Card = () =>
{
  const [ hover, setHover ] = useState(false)
  const hoverState = useSpring({
    transform: hover
      ? 'translate3d(0px, -12px, 0px) scale(0.35)'
      : 'translate3d(0px, 0px, 0px) scale(0.3)',
    boxShadow: hover
      ? '-1px 15px 45px 0px rgba(0, 0, 0, 0.3)'
      : '-1px 10px 45px 0px rgba(0, 0, 0, 0.2)',
    config: config.wobbly
  })

  return (
    <animated.div
      style={ {
        position: 'relative',
        aspectRatio: 'auto',
        background: 'whitesmoke',
        borderRadius: '0.2rem',
        overflow: 'hidden',
        ...hoverState
      } }
      onMouseEnter={ () => setHover(true) }
      onMouseLeave={ () => setHover(false) }
    >
      <div>
        <CardHeader>
          <img
            src="images/channel-summary-bg.png"
            style={ { marginBottom: '0' } }
          />
          <CardTitle>
            <h2>Awesome Post</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo
            totam amet animi vitae harum cupiditate quam aliquam, qui
            impedit velit voluptatem quo laboriosam. Sit repudiandae sed
            doloribus quo neque sapiente dignissimos consequatur? Sapiente
            natus illum provident animi sequi ipsam harum quas. Adipisci
            nobis, quam illum perferendis eaque eligendi debitis amet...
          </p>
        </CardContent>
        <CardFooter>
          <h4>Awesome</h4>
          <h5>
            <em>2022</em>
          </h5>
        </CardFooter>
      </div>
    </animated.div>
  )
}

export default Card