import { useEffect, useState } from "react"
import ExecuteTransaction from "./ExecuteTransaction"
import ContractManager from "./ContractManager"
import SimpleTransfer from "./SimpleTransfer"
import DepositEther from "./DepositEther"
import { useTransactionHistory } from "@/common/state"

export default function TransactionManager ({ safe, setError, provider }) {
    const [transaction, setTransaction] = useState(null)
    const [showChoice, setShowChoice] = useState('none')
    const [callChoice, setCallChoice] = useState('none')
    const [success, setSuccess] = useState(false)
    const [showExplainer, setShowExplainer] = useState(false)
    const { transactionHistory, addToTransactionHistory, removeFromTransactionHistory } = useTransactionHistory()

    const [safeAddress, setSafeAddress] = useState('')

    useEffect(() => {
        async function loadSafeAddress() {
            setSafeAddress(await safe.getAddress())
        }
        loadSafeAddress()
    }, [safe])

    async function handleFileTransactionChange(e) {
        try {
            const file = e.target.files[0]
            const text = await file.text()
            const transaction = JSON.parse(text)
            addToTransactionHistory(transaction)
            setTransaction(transaction)
            setError(null)
        } catch (e) {
            setError(e)
        }
    }

    const relevantCachedTransactions =
        transactionHistory ? transactionHistory.filter(transaction => transaction?.safeAddress == safeAddress) : []

    return (
        <div>
            { transaction ? <div>
                    <ExecuteTransaction provider={provider} safe={safe} transaction={transaction} setSuccess={setSuccess} setError={setError} />
                    <button className="button" onClick={() => {setTransaction(null); setError(null)}}>Back to Transaction Selection</button>
                </div> : <div>
                    <p>You are currently connected to the multisig. To execute a transaction, you can either build a new transaction or load an existing transaction from a file.</p>
                    <p>You can also use this interface to deposit native tokens to the multisig.</p>
                    <a onClick={() => setShowExplainer(!showExplainer)}>Why can&apos;t I use Metamask to deposit funds directly?</a>
                    <p></p>
                    {showExplainer && <>
                        <p>It&apos;s a complex topic that has to do with <a href="https://eips.ethereum.org/EIPS/eip-2930">EIP-2929</a> and the Berlin hardfork, but the summary is that there are two ways to transfer funds: one is correct, the other is slightly flawed. </p>
                        <p>Metamask implements the slightly flawed one, and <a href="https://github.com/MetaMask/metamask-extension/issues/11863">doesn&apos;t implement the necessary workarounds to make it work correctly</a>. This makes the multisig deposits fail.</p>
                        <p>Refer to <a href="https://web.archive.org/web/20230322001522/https://help.safe.global/en/articles/5249851-why-can-t-i-transfer-eth-from-a-contract-into-a-safe">Safe Global&apos;s FAQ</a> for additional info.</p>
                    
                    </>}
                    <select className="select" value={showChoice} onChange={e => setShowChoice(e.target.value)}>
                        <option value="none">Select an option</option>
                        <option value="abi">Build a new transaction</option>
                        <option value="transaction">Load a transaction file</option>
                        <option value="deposit">Deposit native tokens to the multisig</option>
                    </select>
                    
                    {
                    showChoice == 'abi' && <div>
                        <div>
                            <p>Which type of call do you want to perform?</p>
                            <select className="select" value={callChoice} onChange={e => setCallChoice(e.target.value)}>
                                <option value="none">Select an option</option>
                                <option value="contract">Call a contract</option>
                                <option value="transfer">Transfer native tokens from the multisig</option>
                            </select>
                        </div>
                        {callChoice == 'contract' && <ContractManager provider={provider} safe={safe} setTransaction={setTransaction} setError={setError} />}
                        {callChoice == 'transfer' && <SimpleTransfer safe={safe} setTransaction={setTransaction} />}
                    </div>}
                    {showChoice == 'transaction' && <div className="file">
                    <label className="file-label">
                        <input className="file-input" type="file" onChange={handleFileTransactionChange} accept=".json" />
                        <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            Choose a file…
                        </span>
                        </span>
                    </label>
                </div>}
                    {showChoice == 'deposit' && <DepositEther provider={provider} safe={safe} setSuccess={setSuccess} setError={setError} />}

                </div>
            }
            {relevantCachedTransactions?.length > 0 && !transaction && <>
                <p>Or use a cached transaction:</p>
                <div>
                    {relevantCachedTransactions.map((transaction, index) => {
                        return <span key={index}>
                            <p style={{verticalAlign: 'center'}}>{transaction?.name || 'N/A'}</p>
                            <button className="button is-success" onClick={() => setTransaction(transaction)}>Use</button>
                            <button className="button is-warning" onClick={() => removeFromTransactionHistory(transaction)}>Remove</button>
                        </span>
                    })}
                </div>
            </>
            }
            {success && 
                <article className="message is-success">
                <div className="message-header">
                    <p>Info</p>
                    <button className="delete" aria-label="delete" onClick={() => setSuccess(false)}></button>
                </div>
                <div className="message-body">
                    Transaction successfully executed!
                </div>
                </article>
            }
        </div>
    )
}
