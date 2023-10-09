import { useState } from "react"

export default function SimpleTransfer({ safe, setTransaction }) {
    const [to, setTo] = useState('')
    const [value, setValue] = useState('0')

    async function buildTransaction() {
        setTransaction({
            to,
            value,
            inputInfo : null,
            functionName : 'transfer',
            nonce : await safe.getNonce(),
            data: '',
            type : 'simple'
        })
    }
    return <div>
        <label htmlFor="to">To</label>
        <input className="input" type="text" id="to" value={to} onChange={e => setTo(e.target.value)} />
        <label htmlFor="value">Value (wei)</label>
        <input className="input" type="text" id="value" value={value} onChange={e => setValue(e.target.value)} />
        <button className="button is-primary" onClick={buildTransaction}>Build Transaction</button>
    </div>
}