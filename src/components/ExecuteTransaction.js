import { useEffect, useRef, useState } from "react"

function formatTransactionFilename(transaction) {
    if (!transaction) return 'transaction.json'
    if (!transaction.functionName) return 'transaction_' + transaction.nonce + '.json'
    return transaction.functionName.replace(' ', '_').replace(/\(.+\)/g, '') + '_' + transaction.nonce + '.json'
}

export default function ExecuteTransaction({ safe, provider, transaction: transactionInfo, setError }) {
    const [safeTransaction, setSafeTransaction] = useState(null)
    const [threshold, setThreshold] = useState(null)
    const [transactionHash, setTransactionHash] = useState(null)
    const [approvers, setApprovers] = useState([])
    const [signerAddress, setSignerAddress] = useState(null)

    async function updateTransactionFields() {
        if (!transactionInfo) return

        try {
            const safeTransactionData = {
                to: transactionInfo.to,
                value: transactionInfo.value,
                nonce : transactionInfo.nonce
            }
            if (transactionInfo.type == 'contract') {
                safeTransactionData.data = transactionInfo.data
            } else {
                safeTransactionData.data = '0x'
            }
            const newSafeTransaction = await safe.createTransaction({safeTransactionData})
            setSafeTransaction(newSafeTransaction)

            const safeTxHash = await safe.getTransactionHash(newSafeTransaction)
            setTransactionHash(safeTxHash)

            const newApprovers = await safe.getOwnersWhoApprovedTx(safeTxHash)
            setApprovers(newApprovers)

            const newThreshold = await safe.getThreshold()
            setThreshold(newThreshold)
        } catch (e) {
            setError(e)
        }
    }

    useEffect(() => {
        updateTransactionFields()
    }, [safe])

    async function updateSignerAddress() {
        const signer = await provider.getSigner()
        setSignerAddress(await signer.getAddress())
    }

    useEffect(() => {
        updateSignerAddress()
    }, [provider])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (safeTransaction) {
                const transactionHash = await safe.getTransactionHash(safeTransaction)
                const newApprovers = await safe.getOwnersWhoApprovedTx(transactionHash)
                setApprovers(newApprovers)
            }
        }, 3000)
        return () => clearInterval(interval)
      }, []);

    const alreadySigned = approvers && approvers.includes(signerAddress)
    const canSign = signerAddress && !approvers.includes(signerAddress) && safeTransaction && threshold && approvers.length < threshold - 1
    const canExecute = threshold && signerAddress && 
        (approvers.length >= threshold - 1 && !approvers.includes(signerAddress)) ||
        (approvers.length >= threshold && approvers.includes(signerAddress))

    async function signOnChain () {
        if (!canSign) return
        setError(null)
        try {
            const transactionHash = await safe.getTransactionHash(safeTransaction)
            await safe.approveTransactionHash(transactionHash)
            const newApprovers = await safe.getOwnersWhoApprovedTx(transactionHash)
            setApprovers(newApprovers)
            setError(null)
        } catch (e) {
            setError(e)
        }
    }

    async function execute() {
        if (!canExecute) return

        try {
            await safe.executeTransaction(safeTransaction)
            setError(null)
        } catch (e) {
            console.log(e)
            setError(e)
        }
    }

    return (
        <div>
            <div className="content box">            
                <h4>Transaction Info</h4>
                        <p>Name: {transactionInfo?.name || 'N/A'}</p>
                        <p>Type: {transactionInfo?.type == 'simple' ? 'Transfer' : 'Contract call'}</p>
                        <p>Tokens with transaction (wei): {transactionInfo.value}</p>
                        <p>To: {transactionInfo.to}</p>
                        <p>Nonce: {transactionInfo.nonce}</p>
                        <p>Hash: {transactionHash}</p>
                        <p>Signers: {
                            (approvers ? 'None' : approvers.join(', '))
                            + ' (' + approvers.length + '/' + threshold + ')'
                        }</p>
                {
                    transactionInfo?.type == 'contract' && <>
                        <p>Arguments:</p>
                        <ul>
                            {
                                transactionInfo.inputInfo.map((input, i) => (
                                    <li key={i}>{(input.name || 'Input ' + i) + ' (' + input.type + ')'}: {input.value}</li>
                                ))
                            }
                        </ul>
                    </>
                }
                
                
            </div>
            { alreadySigned ? 
                <p>You have already signed this transaction. Export the transaction and send it to the other members of the multisig.</p>
                : (
                    canSign ? (<div>
                        <p>You can now sign the transaction.</p>
                        <button className="button is-primary" onClick={signOnChain}>Sign On-Chain</button>
                    </div>) : (
                        canExecute ? (<div>
                            <p>There are enough signatures to execute the transaction.</p>
                            <p className="is-info">Note: Executing the transaction counts as signing it.</p>
                            <button className="button is-primary" onClick={execute}>Execute</button>
                        </div>)
                     : <p className="is-error">Error interfacing with the multisig.</p>
                    )
                )
            }
            
            <a className="button" download={formatTransactionFilename(transactionInfo)} href={'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactionInfo))}>Export Transaction</a>
            
        </div>
    )
}