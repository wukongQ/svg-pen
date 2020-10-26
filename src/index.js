import React, { Component, useEffect } from 'react'
import { render } from 'react-dom'
import {
  SvgTest
} from './components'
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"

// Sentry.init({
//   dsn: "http://aff54d46402d41b99df5493c61c8d267@127.0.0.1:9000/2",
//   integrations: [
//     new Integrations.BrowserTracing(),
//   ],
//   // We recommend adjusting this value in production, or using tracesSampler
//   // for finer control
//   tracesSampleRate: 1.0,
// })

function App () {
  useEffect(() => {
    // Sentry.captureMessage('error message', 'error')
  }, [])

  return (
    <div>
      <SvgTest />
    </div>
  )
}

render(<App />, document.getElementById('root'))