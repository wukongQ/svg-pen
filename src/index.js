import React, { Component, useEffect } from 'react'
import { render } from 'react-dom'
import {
  SvgPen
} from './components'
import './assets/reset.less'

function App () {
  return (
    <div>
      <SvgPen />
    </div>
  )
}

render(<App />, document.getElementById('root'))