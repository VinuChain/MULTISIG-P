const ethers = require("ethers")
import { providers } from 'ethers'

import { useMetaMask } from "metamask-react"

import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit'
import { useEffect, useState } from 'react'
import SafeDeployer from './SafeDeployer'
import SafeConnector from './SafeConnector'
import SafeInfo from './SafeInfo'
import TransactionManager from './TransactionManager'

import config from "../config.json"

export default function SafeManagement() {
    const { status, connect, account, chainId, ethereum } = useMetaMask()
    const [safeFactory, setSafeFactory] = useState(null)
    const [provider, setProvider] = useState(null)
    const [safe, setSafe] = useState(null)
    const [ethAdapter, setEthAdapter] = useState(null)
    const [error, setError] = useState(null)
    const [showChoice, setShowChoice] = useState('connect')

    async function loadFactory() {
        try {
            if (status == 'connected') {
                const newProvider = new providers.Web3Provider(ethereum)
                setProvider(newProvider)
                const newEthAdapter = new EthersAdapter({
                    ethers,
                    signerOrProvider: newProvider.getSigner(0)
                })
                setEthAdapter(newEthAdapter)
                const newSafeFactory = await SafeFactory.create({ ethAdapter: newEthAdapter, contractNetworks : config.safeConfig, safeVersion: '1.4.1' })
                setSafeFactory(newSafeFactory)
                console.log(newSafeFactory)
            }
        } catch (e) {
            setError(e)
        }
    }

    function formatError(e) {
        // Trim it to 140 chars
        if (e.message.length <= 140) return e.message
        return e.message.substring(0, 140) + '...'
    }

    useEffect(() => {
        loadFactory()
    }, [status])


    if (status != 'connected') {
        return null
    }

    return (
        <div className="box">
            {error &&
                <article className="message is-danger">
                <div className="message-header">
                  <p>Error</p>
                  <button className="delete" aria-label="delete" onClick={() => setError(null)}></button>
                </div>
                <div className="message-body">
                {formatError(error)}
                </div>
              </article>
            }
            {safe ? <>
                <SafeInfo safe={safe} />
                <TransactionManager safe={safe} provider={provider} setError={setError} />
                <button className="button is-danger is-light" onClick={() => setSafe(null)}>Disconnect from multisig</button>
            </> : (
                <div>
                    <p>No multisig connected.</p>
                    <select className="select" value={showChoice} onChange={e => setShowChoice(e.target.value)}>
                        <option value="connect">Connect to an existing multisig</option>
                        <option value="deploy">Deploy a new multisig</option>
                    </select>
                    {!safeFactory && <p>No SafeFactory deployed</p>}
                    {
                        safeFactory && showChoice == 'deploy' && <div>
                            <SafeDeployer safeFactory={safeFactory} setSafe={setSafe} setError={setError} />
                        </div>
                    }
                    { ethAdapter && showChoice == 'connect' &&
                        <SafeConnector setSafe={setSafe} setError={setError} ethAdapter={ethAdapter} />
                    }
                </div>
            )}
        </div>
    )
}