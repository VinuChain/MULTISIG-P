'use client'
import Image from 'next/image'
import bulma from './bulma.css'

import { MetaMaskProvider } from "metamask-react"
import { RecoilRoot } from 'recoil'

import Main from '../components/Main'

//


export default function Home() {
  return (
    
    <MetaMaskProvider>
      <RecoilRoot>
        <main>
          <Main />
        </main>
      </RecoilRoot>
    
    </MetaMaskProvider>
  )
}
