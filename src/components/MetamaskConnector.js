import { useMetaMask } from "metamask-react"

import SafeManagement from "./SafeManagement"

import config from "../config.json"
import { useState, useEffect } from "react"

export default function MetamaskConnector() {
    const { status, connect, account, chainId } = useMetaMask()

    const [oldAccount, setOldAccount] = useState(null)

    useEffect(() => {
        if (account && oldAccount && account != oldAccount) {
            window.location.reload(false)
        }

        setOldAccount(account)
    }, [account])

    if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>

    if (status === "unavailable") return <div>MetaMask not available</div>

    if (status === "notConnected") return <button className="button" onClick={connect}>Connect to MetaMask</button>

    if (status === "connecting") return <div>Connecting...</div>

    if (status == "connected" && !account) return <div>Connected to MetaMask, but no account found</div>

    if (status == "connected" && chainId != config.chainId) return <div>Connected to MetaMask, but not on VinuChain</div>

    return <>
        <div>Connected account {account} on chain ID {chainId}</div>
        <SafeManagement />
    </> 
}