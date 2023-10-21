import { useTransactionHistory } from "@/common/state"
import { useState } from "react"

export default function SimpleTransfer({ safe, setTransaction }) {
    const [to, setTo] = useState('')
    const [value, setValue] = useState('0')
    const [transactionName, setTransactionName] = useState('')
    const { addToTransactionHistory } = useTransactionHistory()

    async function buildTransaction() {
        const nonce = await safe.getNonce()
        const transaction = {
            to,
            value,
            inputInfo : null,
            functionName : 'transfer',
            nonce,
            data: '',
            type : 'simple',
            name : transactionName || ('transfer_' + to + '_' + nonce),
            safeAddress: await safe.getAddress()
        }
        setTransaction(transaction)
        addToTransactionHistory(transaction)
    }
    return <div>
        <label htmlFor="to">To</label>
        <input className="input" type="text" id="to" value={to} onChange={e => setTo(e.target.value)} />
        <label htmlFor="value">Value (wei)</label>
        <input className="input" type="text" id="value" value={value} onChange={e => setValue(e.target.value)} />
        <label htmlFor="transactionName">Transaction Name (will not be saved on-chain)</label>
        <input id="transactionName" className="input" type="text" value={transactionName} onChange={e => setTransactionName(e.target.value)} />
        <button className="button is-primary" onClick={buildTransaction}>Build Transaction</button>
    </div>
}