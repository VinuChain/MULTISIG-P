import { useMetaMask } from "metamask-react"

import SafeManagement from "./SafeManagement"

import config from "../config.json"

export default function MetamaskConnector() {
    const { status, connect, account, chainId, ethereum } = useMetaMask()

    if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>

    if (status === "unavailable") return <div>MetaMask not available</div>

    if (status === "notConnected") return <button className="button" onClick={connect}>Connect to MetaMask</button>

    if (status === "connecting") return <div>Connecting...</div>

    if (status == "connected" && !account) return <div>Connected to MetaMask, but no account found</div>

    if (status == "connected" && chainId != config.chainId) return <div>Connected to MetaMask, but not on VinuChain TestNet</div>

    return <>
        <div>Connected account {account} on chain ID {chainId}</div>
        <SafeManagement />
    </> 
}