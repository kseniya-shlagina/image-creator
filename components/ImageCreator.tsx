import styled from 'styled-components'
import Head from 'next/head'
import { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Modal } from './Modal'
import { Button } from './Button'
import html2canvas from 'html2canvas'
import WebFont from 'webfontloader'
import fontList from '../assets/fonts-list.json'
import ReactSelect from 'react-select'
import { StylesConfig } from 'react-select/src/styles'

const fontOptions = fontList.map((descriptor) => ({
  label: `${descriptor.family} (${descriptor.category})`,
  value: descriptor.family,
}))

interface TitleContainerProps {
  fontSize: number
  fontFamily: string
  strokeColor: string
  strokeSize: number
  textFillColor: string
  backgroundColor?: string
}

interface RectangleProps {
  borderRadius: number
  borderWidth: number
  backgroundColor: string
  borderColor: string
  height: number
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

const InnerContainer = styled.div`
  max-height: 150px;
  text-align: center;
`

const TitleContainer = styled.div.attrs<TitleContainerProps>((props) => ({
  style: {
    fontSize: props.fontSize + 'px',
    WebkitTextStroke: `${props.strokeSize}px ${props.strokeColor}`,
    WebkitTextFillColor: props.textFillColor,
    fontFamily: props.fontFamily,
  },
}))<TitleContainerProps>`
  position: relative;
  display: inline-block;
  min-height: 50px;

  .editableContent {
    position: relative;
    padding: 0 15px;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
    z-index: 1;
    white-space: nowrap;

    &:focus {
      outline: 0;
    }
  }
`

const Rectangle = styled.div<RectangleProps>`
  position: relative;
  transform: translateY(-50%);
  width: 100%;
  height: ${({ height }) => height + 'px'};
  border-radius: ${({ borderRadius }) => borderRadius + 'px'};
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-width: ${({ borderWidth }) => borderWidth + 'px'};
  border-style: solid;
  border-color: ${({ borderColor }) => borderColor};
`

const Buttons = styled.div`
  display: flex;
  justify-content: center;
`

const Controls = styled.div`
  display: flex;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid white;
`

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: self-start;
  margin-right: 10px;
  margin-left: 10px;
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
    box-shadow: 0 0 0 1px #2684ff;
    border: 1px solid #2684ff;
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

const ScrollContainer = styled.div`
  max-width: 100vw;
  overflow: scroll;
`

const customSelectStyles: StylesConfig<any, false, any> = {
  container: (provided) => ({
    ...provided,
    width: '250px',
  }),
}

const ImageCreator = () => {
  const titlePlaceholder = 'Title placeholder'
  const [openExportModal, setOpenExportModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [text, setText] = useLocalStorage('text', titlePlaceholder)
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 70)
  const [fontFamily, setFontFamily] = useLocalStorage('fontFamily', fontList[0].family)
  const [strokeSize, setStrokeSize] = useLocalStorage('strokeSize', 2)
  const [strokeColor, setStrokeColor] = useLocalStorage('strokeColor', '#ffffff')
  const [backgroundColor, setBackgroundColor] = useLocalStorage('backgroundColor', '#d9d9d9')
  const [textFillColor, setTextFillColor] = useLocalStorage('textFillColor', '#000000')
  const [rectBackgroundColor, setRectBackgroundColor] = useLocalStorage(
    'rectBackgroundColor',
    '#ffbb00',
  )
  const [rectBorderColor, setRectBorderColor] = useLocalStorage('rectBorderColor', '#ffffff')
  const [rectBorderWidth, setRectBorderWidth] = useLocalStorage('rectBorderWidth', 2)
  const [rectBorderRadius, setRectBorderRadius] = useLocalStorage('rectBorderRadius', 5)
  const [downloadResizePercentage, setDownloadResizePercentage] = useLocalStorage(
    'downloadResizePercentage',
    100,
  )

  const ref = useRef<HTMLDivElement>(null)

  const currentSettings = {
    text: text,
    fontSize: fontSize,
    fontFamily: fontFamily,
    backgroundColor: backgroundColor,
    strokeSize: strokeSize,
    strokeColor: strokeColor,
    textFillColor: textFillColor,
    rectBackgroundColor: rectBackgroundColor,
    rectBorderColor: rectBorderColor,
    rectBorderWidth: rectBorderWidth,
    rectBorderRadius: rectBorderRadius,
    downloadResizePercentage: downloadResizePercentage,
  }

  useEffect(() => {
    const font = fontList.find((option) => option.family === fontFamily)!
    if (font.category !== 'System') {
      WebFont.load({
        google: {
          families: [fontFamily],
        },
      })
    }
  }, [fontFamily])

  const handleChange = (e: ContentEditableEvent) => {
    setText(e.target.value)
  }

  const handleClick = () => {
    const container = ref.current
    if (!container) {
      alert('Cannot find the block to save as an image!')
      return
    }

    const originalStyles = {
      overflow: container.style.overflow,
      maxWidth: container.style.maxWidth,
      paddingBottom: container.style.paddingBottom,
    }
    // some changes to ensure the image taken has no scrolling bars etc
    container.style.overflow = 'initial'
    container.style.maxWidth = 'initial'
    container.style.paddingBottom = `${Math.floor(rectBorderWidth) * 2}px`

    requestAnimationFrame(() => {
      html2canvas(container, {
        scale: downloadResizePercentage / 100,
        backgroundColor: 'transparent',
      }).then((canvas) => {
        const data = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = data
        a.download = 'created-image.png'
        document.body.appendChild(a)
        a.click()

        // return to original values
        container.style.overflow = originalStyles.overflow
        container.style.maxWidth = originalStyles.maxWidth
        container.style.paddingBottom = originalStyles.paddingBottom
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

  const handleChangeRectBorderWidth: ChangeEventHandler<HTMLInputElement> = (e) => {
    setRectBorderWidth(parseFloat(e.target.value))
  }

  const handleChangeRectBorderRadius: ChangeEventHandler<HTMLInputElement> = (e) => {
    setRectBorderRadius(parseFloat(e.target.value))
  }

  const handleChangesDownloadResizePercentage: ChangeEventHandler<HTMLInputElement> = (e) => {
    setDownloadResizePercentage(parseInt(e.target.value))
  }

  const handleSettingsSave = (value: string) => {
    const showError = (fieldName: string) => alert(`Incorrect value for the field: ${fieldName}`)

    const importedSettings = JSON.parse(value)
    const {
      text,
      fontSize,
      fontFamily,
      backgroundColor,
      strokeSize,
      strokeColor,
      textFillColor,
      rectBackgroundColor,
      rectBorderColor,
      rectBorderWidth,
      rectBorderRadius,
      downloadResizePercentage,
    } = importedSettings

    if (text && typeof text === 'string') {
      setText(text)
    } else {
      showError('text')
    }

    if (fontSize && typeof fontSize === 'number') {
      setFontSize(fontSize)
    } else {
      showError('fontSize')
    }

    if (fontFamily) {
      setFontFamily(fontFamily)
    }

    if (backgroundColor && typeof backgroundColor === 'string') {
      setBackgroundColor(backgroundColor)
    } else {
      showError('backgroundColor')
    }

    if (strokeColor && typeof strokeColor === 'string') {
      setStrokeColor(strokeColor)
    } else {
      showError('strokeColor')
    }

    if (strokeSize && typeof strokeSize === 'number') {
      setStrokeSize(strokeSize)
    } else {
      showError('strokeSize')
    }

    if (textFillColor && typeof textFillColor === 'string') {
      setTextFillColor(textFillColor)
    } else {
      showError('textFillColor')
    }

    if (rectBackgroundColor && typeof rectBackgroundColor === 'string') {
      setRectBackgroundColor(rectBackgroundColor)
    } else {
      showError('rectBackgroundColor')
    }

    if (rectBorderWidth && typeof rectBorderWidth === 'number') {
      setRectBorderWidth(rectBorderWidth)
    } else {
      showError('rectBorderWidth')
    }

    if (rectBorderRadius && typeof rectBorderRadius === 'number') {
      setRectBorderRadius(rectBorderRadius)
    } else {
      showError('rectBorderRadius')
    }

    if (rectBorderColor && typeof rectBorderColor === 'string') {
      setRectBorderColor(rectBorderColor)
    } else {
      showError('rectBorderColor')
    }

    if (downloadResizePercentage && typeof downloadResizePercentage === 'number') {
      setDownloadResizePercentage(downloadResizePercentage)
    } else {
      showError('downloadResizePercentage')
    }
  }

  const handleFontFamilyChange = ({ value }: { value: string }) => {
    setFontFamily(value)
  }

  const selectedFontOption = fontOptions.find((option) => option.value === fontFamily)

  return (
    <Container backgroundColor={backgroundColor}>
      <Head>
        <title>Image Creator</title>
        <meta name="description" content="Application for creating text png images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ScrollContainer ref={ref}>
          <InnerContainer>
            <TitleContainer
              fontSize={fontSize}
              fontFamily={fontFamily}
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
              <Rectangle
                backgroundColor={rectBackgroundColor}
                borderColor={rectBorderColor}
                borderWidth={rectBorderWidth}
                borderRadius={rectBorderRadius}
                height={fontSize}
              />
            </TitleContainer>
          </InnerContainer>
        </ScrollContainer>

        <Controls>
          <ControlsColumn>
            <Control>
              <Label htmlFor="fontSize">Font size</Label>
              <NumberInput
                name="fontSize"
                type="number"
                inputMode="decimal"
                value={fontSize}
                onChange={handleChangeFontSize}
                min={1}
                max={200}
              />
            </Control>
            <Control>
              <Label>Font family</Label>
              <ReactSelect
                value={selectedFontOption}
                options={fontOptions}
                onChange={handleFontFamilyChange as unknown as any}
                styles={customSelectStyles}
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
              <Label htmlFor="strokeSize">Text stroke size</Label>
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
              <Label htmlFor="strokeColor">Text stroke color</Label>
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
          </ControlsColumn>

          <ControlsColumn>
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
            <Control>
              <Label htmlFor="rectBorderRadius">Rectangle border radius</Label>
              <NumberInput
                name="rectBorderRadius"
                type="number"
                inputMode="decimal"
                value={rectBorderRadius}
                onChange={handleChangeRectBorderRadius}
                min={1}
              />
            </Control>
            <Control>
              <Label htmlFor="rectBorderRadius">Rectangle border width</Label>
              <NumberInput
                name="rectBorderWidth"
                type="number"
                inputMode="decimal"
                value={rectBorderWidth}
                onChange={handleChangeRectBorderWidth}
                step={0.1}
                min={0.1}
              />
            </Control>
            <Control>
              <Label htmlFor="downloadResizePercentage">Download resize percentage</Label>
              <NumberInput
                name="downloadResizePercentage"
                type="number"
                step={10}
                inputMode="decimal"
                value={downloadResizePercentage}
                onChange={handleChangesDownloadResizePercentage}
                min={10}
              />
            </Control>
          </ControlsColumn>
        </Controls>
        <Buttons>
          <Button onClick={handleClick}>Download</Button>
          <Button onClick={() => setOpenExportModal(!openExportModal)}>Export settings</Button>
          <Button onClick={() => setOpenImportModal(!openImportModal)}>Import settings</Button>
        </Buttons>
      </main>
      <Modal
        isOpen={openExportModal}
        onClose={() => setOpenExportModal(false)}
        content={JSON.stringify(currentSettings)}
      />
      <Modal
        isOpen={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onSave={handleSettingsSave}
      />
    </Container>
  )
}

export default ImageCreator
