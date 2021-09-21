import React, { ChangeEventHandler, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Close } from '../assets/icons/Close'
import { Button } from './Button'

interface ModalProps {
  content?: string
  isOpen: boolean
  onClose: () => void
  onSave?: (value: string) => void
}

const Overlay = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  z-index: 10;
`

const ModalWindow = styled.div<{ isVisible: boolean }>`
  width: 330px;
  height: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-left: auto;
  margin-right: auto;
  z-index: 2;
  border: 2px solid gray;
  border-radius: 5px;
  background: white;
`

const ModalClose = styled.div`
  position: absolute;
  right: -20px;
  top: -20px;
  border: none;
  background: none;
  padding: 0;

  &:focus {
    outline: none;
  }
`

const Textarea = styled.textarea`
  height: 100%;
  border: 1px solid lightgray;
  border-radius: 5px;

  &:focus {
    box-shadow: 0 0 0 1px #2684ff;
    border: 1px solid #2684ff;
  }
`

export const Modal = ({ content, onClose, isOpen, onSave }: ModalProps) => {
  const [value, setValue] = useState('')

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValue(e.target.value)
  }

  if (!isOpen) return null

  return (
    <Overlay>
      <ModalWindow isVisible={isOpen}>
        <div>
          <ModalClose onClick={onClose}>{<Close />}</ModalClose>
        </div>
        <Textarea value={content || value} onChange={content ? undefined : handleChange} />
        {onSave && (
          <Button
            onClick={() => {
              onSave(value)
              onClose()
            }}
          >
            Import settings
          </Button>
        )}
      </ModalWindow>
    </Overlay>
  )
}
