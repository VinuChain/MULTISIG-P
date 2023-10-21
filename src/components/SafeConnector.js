import Safe from '@safe-global/protocol-kit'

import { useState } from 'react'

import config from "../config.json"

import { useMultisigHistory } from '@/common/state'

export default function SafeConnector ({ ethAdapter, setSafe, setError}) {
    const [safeAddress, setSafeAddress] = useState('')
    const { multisigHistory, addToMultisigHistory, removeFromMultisigHistory } = useMultisigHistory()

    async function connect(addressOverride) {
        try {
            const address = addressOverride || safeAddress
            const safe = await Safe.create({ ethAdapter, safeAddress: address, contractNetworks : config.safeConfig })
            setSafe(safe)
            setError(null)
            addToMultisigHistory(address)
        } catch (e) {
            setError(e)
        }
    }

    return (
        <div>
            <label htmlFor="safeAddress">Multisig address</label>
            <input className="input" type="text" id="safeAddress" value={safeAddress} onChange={e => setSafeAddress(e.target.value)} />

            <button className="button" onClick={() => connect(null)}>Connect</button>

            {multisigHistory.length > 0 && <>
                <p>Or select from history:</p>
                <div>
                    {multisigHistory.map((address, index) => {
                        return <span key={index}>
                            <p style={{verticalAlign: 'center'}}>{address.toString()}</p>
                            <button className="button is-success" onClick={() => connect(address)}>Connect</button>
                            <button className="button is-warning" onClick={() => removeFromMultisigHistory(address)}>Remove</button> </span>
                    })}
                </div>
            </>
            }
        </div>
    )
}