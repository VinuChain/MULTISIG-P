import { useState } from "react"

const ethers = require('ethers')

export default function DepositEther ({ safe, provider, setSuccess, setError }) {
    const [value, setValue] = useState('0')
    const [loading, setLoading] = useState(false)

    async function deposit () {
        try {
            const signer = provider.getSigner()
            const safeAddress = await safe.getAddress()
            const tx = await signer.sendTransaction({
                to: safeAddress,
                value: ethers.utils.parseEther(value)
            })
            await tx.wait()
            setSuccess(true)
        } catch (e) {
            setError(e)
        }
    }

    return (
        <div className="box content">
            <h4>Deposit Ether</h4>
            <p>Send Ether to this address to deposit it into the multisig.</p>
            <label className="label">Value (VC)</label>
            <input className="input" value={value} onChange={e => setValue(e.target.value)} type="text" id="value" />
            <button className="button is-primary" disabled={loading} onClick={deposit}>Deposit</button>
            
        </div>
    )

}