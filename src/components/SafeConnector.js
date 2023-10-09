import Safe from '@safe-global/protocol-kit'

import { useState } from 'react'

import config from "../config.json"

export default function SafeConnector ({ ethAdapter, setSafe, setError}) {
    const [safeAddress, setSafeAddress] = useState('')

    async function connect() {
        try {
            const safe = await Safe.create({ ethAdapter, safeAddress, contractNetworks : config.safeConfig })
            setSafe(safe)
            setError(null)
        } catch (e) {
            setError(e)
        }
    }

    return (
        <div>
            <label htmlFor="safeAddress">Multisig address</label>
            <input className="input" type="text" id="safeAddress" value={safeAddress} onChange={e => setSafeAddress(e.target.value)} />

            <button className="button" onClick={connect}>Connect</button>
        </div>
    )
}