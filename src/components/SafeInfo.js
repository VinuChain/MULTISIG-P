const ethers = require('ethers')

import { useEffect, useState } from "react"

export default function SafeInfo({safe}) {
    const [address, setAddress] = useState('')
    const [owners, setOwners] = useState([])
    const [balance, setBalance] = useState([])
    const [threshold, setThreshold] = useState(null)
    async function updateInfo () {
        setAddress(await safe.getAddress())
        setOwners(await safe.getOwners())
        setBalance(await safe.getBalance())
        setThreshold(await safe.getThreshold())
    }

    useEffect(() => {
        updateInfo()
    }, [safe])

    return (
        <div className="box content">
            <h4>Multisig Info</h4>
            {address && <p>Address: {address}</p>}
            {owners && <p>Owners: {owners.join(', ')}</p>}
            {balance && <p>Balance: {balance.toString()}</p>}
            {threshold && <p>Threshold: {threshold}</p>}
        </div>
    )
}