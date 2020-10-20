import React from 'react'
import { render } from 'react-dom'
import {
  SvgTest
} from './components'

function App () {
  return (
    <div>
      <SvgTest />
    </div>
  )
}

render(<App />, document.getElementById('root'))