import styled from 'styled-components'

export const Button = styled.button`
  margin: 15px 5px 0 5px;
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
