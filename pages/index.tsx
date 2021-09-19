import styled from 'styled-components'

import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, ChangeEventHandler, useRef } from 'react'
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import domtoimage from 'dom-to-image'

interface TitleContainerProps {
  fontSize: number
  strokeColor: string
  strokeSize: number
  textFillColor: string
  backgroundColor?: string
}

const Container = styled.div<{ backgroundColor: string }>`
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ backgroundColor }) => backgroundColor};
`

const TitleContainer = styled.div.attrs<TitleContainerProps>((props) => ({
  style: {
    fontSize: props.fontSize + 'px',
    WebkitTextStroke: `${props.strokeSize}px ${props.strokeColor}`,
    WebkitTextFillColor: props.textFillColor,
  },
}))<TitleContainerProps>`
  position: relative;
  margin-bottom: 40px;

  .editableContent {
    position: relative;
    padding: 0 15px;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
    z-index: 1;

    &:focus {
      outline: 0;
    }
  }
`

const Rectangle = styled.div<{ backgroundColor: string; borderColor: string }>`
  position: absolute;
  top: 50%;
  width: 100%;
  height: 50px;
  border-radius: 10px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-width: 4px;
  border-style: solid;
  border-color: ${({ borderColor }) => borderColor};
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Control = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`

const NumberInput = styled.input`
  width: 100px;
  padding: 10px;
  border: 1px solid lightgray;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgb(13 110 253 / 25%);
  }
`

const ColorInput = styled.input`
  height: 40px;
  padding: 5px;
  border: 1px solid lightgray;
  border-radius: 5px;
  background-color: white;
`

const Label = styled.label`
  margin-right: 10px;
`

const Button = styled.button`
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #ffffff;
  border-radius: 0.25rem;
  border: 1px solid lightgray;
  text-align: center;
  vertical-align: middle;
  font-size: 16px;
  color: #6c757d;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;

  &:hover {
    background-color: lightgray;
    color: #ffffff;
  }
`

const Home: NextPage = () => {
  const titlePlaceholder = 'Title placeholder'
  const [text, setText] = useState<string>(titlePlaceholder)
  const [fontSize, setFontSize] = useState<number>(40)
  const [strokeSize, setStrokeSize] = useState<number>(2)
  const [backgroundColor, setBackgroundColor] = useState<string>('#d9d9d9')
  const [strokeColor, setStrokeColor] = useState<string>('#ffffff')
  const [textFillColor, setTextFillColor] = useState<string>('#000000')
  const [rectBackgroundColor, setRectBackgroundColor] = useState<string>('#ffbb00')
  const [rectBorderColor, setRectBorderColor] = useState<string>('#ffffff')
  const ref = useRef(null)

  const handleChange = (e: ContentEditableEvent) => {
    setText(e.target.value)
  }

  const handleClick = () => {
    // requestAnimationFrame ensures the code runs after text background color is changed
    // to avoid race conditions
    requestAnimationFrame(() => {
      if (!ref.current) {
        alert('Cannot find the block to save as an image!')
        return
      }
      domtoimage
        .toPng(ref.current)
        .then((dataUrl) => {
          const n = document.createElement('a')
          n.download = 'my-image-name.png'
          n.href = dataUrl
          n.click()
        })
        .catch((error) => {
          alert('Cannot create an image')
          console.error('oops, something went wrong!', error)
        })
    })
  }

  const handleChangeFontSize: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value, 10)

    if (!value) {
      setFontSize(1)
    } else {
      setFontSize(value)
    }
  }

  const handleChangeStrokeSize: ChangeEventHandler<HTMLInputElement> = (e) => {
    setStrokeSize(parseFloat(e.target.value))
  }

  const handleChangeBackgroundColor: ChangeEventHandler<HTMLInputElement> = (e) => {
    setBackgroundColor(e.target.value)
  }

  const handleChangeStrokeColor: ChangeEventHandler<HTMLInputElement> = (e) => {
    setStrokeColor(e.target.value)
  }

  const handleChangeTextFillColor: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTextFillColor(e.target.value)
  }

  const handleChangeRectBackgroundColor: ChangeEventHandler<HTMLInputElement> = (e) => {
    setRectBackgroundColor(e.target.value)
  }

  const handleChangeRectBorderColor: ChangeEventHandler<HTMLInputElement> = (e) => {
    setRectBorderColor(e.target.value)
  }

  return (
    <Container backgroundColor={backgroundColor}>
      <Head>
        <title>Image Creator</title>
        <meta name="description" content="Application for creating text png images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <TitleContainer
          ref={ref}
          fontSize={fontSize}
          strokeColor={strokeColor}
          strokeSize={strokeSize}
          textFillColor={textFillColor}
        >
          <ContentEditable
            className="editableContent"
            html={text}
            disabled={false}
            onChange={handleChange}
          />
          <Rectangle backgroundColor={rectBackgroundColor} borderColor={rectBorderColor} />
        </TitleContainer>
        <Controls>
          <Control>
            <Label htmlFor="fontSize">Font size</Label>
            <NumberInput
              name="fontSize"
              type="number"
              inputMode="decimal"
              value={fontSize}
              onChange={handleChangeFontSize}
              min={1}
            />
          </Control>
          <Control>
            <Label htmlFor="backgroundColor">Background color</Label>
            <ColorInput
              name="backgroundColor"
              type="color"
              value={backgroundColor}
              onChange={handleChangeBackgroundColor}
            />
          </Control>
          <Control>
            <Label htmlFor="strokeSize">Stroke size</Label>
            <NumberInput
              name="strokeSize"
              type="number"
              step={0.1}
              inputMode="decimal"
              value={strokeSize}
              onChange={handleChangeStrokeSize}
              min={1}
            />
          </Control>
          <Control>
            <Label htmlFor="strokeColor">Stroke color</Label>
            <ColorInput
              name="strokeColor"
              type="color"
              value={strokeColor}
              onChange={handleChangeStrokeColor}
            />
          </Control>
          <Control>
            <Label htmlFor="textFillColor">Text fill color</Label>
            <ColorInput
              name="textFillColor"
              type="color"
              value={textFillColor}
              onChange={handleChangeTextFillColor}
            />
          </Control>
          <Control>
            <Label htmlFor="rectBackgroundColor">Rectangle background color</Label>
            <ColorInput
              name="rectBackgroundColor"
              type="color"
              value={rectBackgroundColor}
              onChange={handleChangeRectBackgroundColor}
            />
          </Control>
          <Control>
            <Label htmlFor="rectBorderColor">Rectangle border color</Label>
            <ColorInput
              name="rectBorderColor"
              type="color"
              value={rectBorderColor}
              onChange={handleChangeRectBorderColor}
            />
          </Control>
          <Button onClick={handleClick}>Download</Button>
        </Controls>
      </main>
    </Container>
  )
}

export default Home
