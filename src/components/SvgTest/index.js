import React, { useEffect, useRef, useState, Fragment } from 'react'
import { SVG } from '@svgdotjs/svg.js'
import styles from './index.less'

const blueColor = '#4F80FF'

function SvgTest () {
  const drawRef = useRef({
    svgEle: null,
    pathEle: null,
    operateGEle: null
  })
  const svgWrapEleRef = useRef()
  const mouseSaver = useRef()
  const [pathList, setPathList] = useState([])
  const [editStatus, setEditStatus] = useState(true)
  const [operation, setOperation] = useState(true)
  const [nowOpIndex, setNowOpIndex] = useState(0)
  
  useEffect(() => {
    drawRef.current.svgEle = SVG().addTo(svgWrapEleRef.current).size(800, 400)
    drawRef.current.svgEle.click(function(e){
      onCreatePoint(e)
    })
  }, [])

  useEffect(() => {
    if (pathList.length > 0) {
      const drawObj = drawRef.current
      if (pathList.length === 1) { // init
        drawObj.pathEle = drawObj.svgEle.path(pathList.map(arr => arr.join(' ')).join(' '))
        drawObj.pathEle.stroke({
          color: '#0a8eef',
          width: 2
        })
        drawObj.pathEle.fill('transparent')
        // drawObj.operateGEle = drawObj.svgEle.group()
        // drawObj.operateGEle.rect(5, 5)
      } else {
        drawObj.pathEle.plot(pathList.map(arr => arr.join(' ')).join(' '))
      }
    }
  }, [pathList])

  const onCreatePoint = (e) => {
    if (!drawRef.current.pathEle) {
      setPathList([['M', e.offsetX, e.offsetY]])
    } else {
      const pathArr = drawRef.current.pathEle.array()
      const lastItem = pathArr[pathArr.length - 1]
      const lastPoint = {
        x: lastItem[lastItem.length - 2],
        y: lastItem[lastItem.length - 1]
      }
      const nowPoint = {
        x: e.offsetX,
        y: e.offsetY
      }
      const rate = 4
      const a = (lastPoint.y - nowPoint.y) / (lastPoint.x - nowPoint.x)
      const b = lastPoint.y - a * lastPoint.x
      const nx1 = (lastPoint.x - nowPoint.x) * 3 / rate + nowPoint.x
      const ny1 = nx1 * a + b
      const nx2 = (lastPoint.x - nowPoint.x) / rate + nowPoint.x
      const ny2 = nx2 * a + b
      setPathList(pathArr.concat([['C', toFixNumber(nx1), toFixNumber(ny1), toFixNumber(nx2), toFixNumber(ny2), toFixNumber(nowPoint.x), toFixNumber(nowPoint.y)]]))
    }
  }

  const onCompleteDraw = () => {
    setEditStatus(!editStatus)
  }

  const onToggleOperation = () => {
    setOperation(!operation)
  }

  const onCtlMouseDown = (e, ctlIndex, pathIndex) => {
    mouseSaver.current = {
      x: e.pageX,
      y: e.pageY
    }
    const handleCtlMoveAndUp = (event) => {
      onCtlMouseMoveAndUp(event, ctlIndex, pathIndex)
      if (event.type === 'mouseup') {
        document.removeEventListener('mousemove', handleCtlMoveAndUp)
        document.removeEventListener('mouseup', handleCtlMoveAndUp)
      }
    }
    document.addEventListener('mousemove', handleCtlMoveAndUp)
    document.addEventListener('mouseup', handleCtlMoveAndUp)
  }

  const onCtlMouseMoveAndUp = (e, ctlIndex, pathIndex) => {
    const pathArr = drawRef.current.pathEle.array()
    const pathItem = pathArr[pathIndex]
    const { ctlPoints } = parsePathItem(pathItem)
    const ctlPoint = ctlPoints[ctlIndex]
    let offsetX = e.pageX - mouseSaver.current.x
    let offsetY = e.pageY - mouseSaver.current.y
    ctlPoint.x += offsetX
    ctlPoint.y += offsetY
    pathItem[ctlIndex*2+1] = ctlPoint.x
    pathItem[ctlIndex*2+2] = ctlPoint.y
    mouseSaver.current = {
      x: e.pageX,
      y: e.pageY
    }
    setPathList(pathArr)
  }

  const onRectMouseDown = (e, pathIndex) => {
    setNowOpIndex(pathIndex)
    mouseSaver.current = {
      x: e.pageX,
      y: e.pageY
    }
    const handleRectMoveAndUp = (event) => {
      onRectMouseMoveAndUp(event, pathIndex)
      if (event.type === 'mouseup') {
        document.removeEventListener('mousemove', handleRectMoveAndUp)
        document.removeEventListener('mouseup', handleRectMoveAndUp)
      }
    }
    document.addEventListener('mousemove', handleRectMoveAndUp)
    document.addEventListener('mouseup', handleRectMoveAndUp)
  }

  const onRectMouseMoveAndUp = (e, pathIndex) => {
    const pathArr = drawRef.current.pathEle.array()
    const pathItem = pathArr[pathIndex]
    const nextPathItem = pathArr[pathIndex+1]
    const prevPathItem = pathArr[pathIndex-1]
    const { type, rectPoint } = parsePathItem(pathItem)
    let offsetX = e.pageX - mouseSaver.current.x
    let offsetY = e.pageY - mouseSaver.current.y
    rectPoint.x += offsetX
    rectPoint.y += offsetY
    switch(type) {
      case 'M':
        pathItem[1] = rectPoint.x
        pathItem[2] = rectPoint.y
        if (nextPathItem) {
          nextPathItem[1] += offsetX
          nextPathItem[2] += offsetY
        }
        break
      case 'C':
        pathItem[pathItem.length - 2] = rectPoint.x
        pathItem[pathItem.length - 1] = rectPoint.y
        pathItem[3] += offsetX
        pathItem[4] += offsetY
        if (nextPathItem) {
          nextPathItem[1] += offsetX
          nextPathItem[2] += offsetY
        }
        break
    }
    mouseSaver.current = {
      x: e.pageX,
      y: e.pageY
    }
    setPathList(pathArr)
  }

  return (
    <div className={styles.container}>
      <button onClick={onCompleteDraw}>{editStatus ? '完成' : '继续' }绘制</button>
      <button onClick={onToggleOperation}>切换操作显示</button>
      <div className={styles.svgWrap} ref={svgWrapEleRef}>
        <svg className={styles.operationSvg} xmlns="http://www.w3.org/2000/svg" version="1.1" width="800" height="400" style={{pointerEvents: editStatus ? 'none' : 'auto'}}>
          <g style={{ display: operation ? 'block' : 'none' }}>
            {
              pathList.map((item, index) => {
                const { type, rectPoint, ctlPoints } = parsePathItem(item)
                const lastParseItem = index > 0 ? parsePathItem(pathList[index - 1]) : null
                return (
                  <Fragment key={index}>
                    <rect x={rectPoint.x - 3} y={rectPoint.y - 3} width='6' height='6' fill={index === 0 ? blueColor : '#fff'} stroke={blueColor} onMouseDown={e => onRectMouseDown(e, index)} />
                    {
                      type === 'C' && ctlPoints.map((ctlp, ctlIndex) => {
                        return (
                          <Fragment key={ctlIndex}>
                            <circle cx={ctlp.x} cy={ctlp.y} r='3' fill={blueColor} onMouseDown={e => onCtlMouseDown(e, ctlIndex, index)} />
                            {
                              ctlIndex === 0
                              ? <line x1={lastParseItem.rectPoint.x} y1={lastParseItem.rectPoint.y} x2={ctlp.x} y2={ctlp.y} stroke={blueColor} />
                              : <line x1={rectPoint.x} y1={rectPoint.y} x2={ctlp.x} y2={ctlp.y} stroke={blueColor} />
                            }
                          </Fragment>
                        )
                      })
                    }
                  </Fragment>
                )
              })
            }
          </g>
        </svg>
      </div>
    </div>
  )
}

function toFixNumber(num) {
  return parseFloat(num.toFixed(4))
}

function parsePathItem(pathItem) {
  const type = pathItem[0]
  let rectPoint = null
  let ctlPoints = null
  switch(type) {
    case 'M':
      rectPoint = {
        x: pathItem[1],
        y: pathItem[2]
      }
      break
    case 'C':
      rectPoint = {
        x: pathItem[pathItem.length - 2],
        y: pathItem[pathItem.length - 1]
      }
      ctlPoints = [
        {
          x: pathItem[1],
          y: pathItem[2]
        },
        {
          x: pathItem[3],
          y: pathItem[4]
        }
      ]
      break
  }
  return {
    type,
    rectPoint,
    ctlPoints
  }
}

export default SvgTest