import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/App';


describe('App', () => {
  it('devrait afficher le titre correctement', () => {
    render(<App />)
    expect(screen.getByText('Vite + React')).toBeInTheDocument()
  })

  it('devrait afficher les logos Vite et React', () => {
    render(<App />)
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument()
    expect(screen.getByAltText('React logo')).toBeInTheDocument()
  })

  it('devrait incrémenter le compteur lors du clic sur le bouton', () => {
    render(<App />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('count is 0')
    
    fireEvent.click(button)
    expect(button).toHaveTextContent('count is 1')
  })
})