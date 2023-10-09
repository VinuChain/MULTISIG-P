'use client'
import Image from 'next/image'
import bulma from './bulma.css'

import { MetaMaskProvider } from "metamask-react"

import Main from '../components/Main'

//


export default function Home() {
  return (
    
    <MetaMaskProvider>
      <main>
        <Main />
      </main>
    
    </MetaMaskProvider>
  )
}
