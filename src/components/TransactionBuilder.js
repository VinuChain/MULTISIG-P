import { useEffect, useState } from "react"

import { useTransactionHistory } from "@/common/state"

export default function TransactionBuilder ( { contract, setTransaction, safe, setError } ) {
    const [chosenFunction, setChosenFunction] = useState('')
    const [value, setValue] = useState('0')
    const [inputs, setInputs] = useState([])
    const [transactionName, setTransactionName] = useState('')
    const { addToTransactionHistory } = useTransactionHistory()

    useEffect(() => {
        if (!chosenFunction && contract.interface.functions) {
            setChosenFunction(Object.keys(contract.interface.functions)[0])
        }
    }, [contract])

    useEffect(() => {
        if (inputs && contract.interface.functions[chosenFunction]) {
            setInputs(Array(contract.interface.functions[chosenFunction].inputs.length).fill(''))
        } else {
            setInputs([])
        }
    }, [chosenFunction])
    
    const functions = contract?.interface?.functions || {}

    function updateInput(i, value) {
        const newInputs = [...inputs]
        newInputs[i] = value
        setInputs(newInputs)
    }

    async function buildTransaction() {
        let encodedTransaction = null
        
        try {
            encodedTransaction = contract.interface.encodeFunctionData(chosenFunction, inputs)
            setError(null)
        } catch (e) {
            setError(e)
            return
        }

        const inputInfo = []
        for (let i = 0; i < inputs.length; i++) {
            inputInfo.push({
                'name': functions[chosenFunction].inputs[i].name,
                'type': functions[chosenFunction].inputs[i].type,
                'value': inputs[i]
            })
        }

        const nonce = await safe.getNonce()

        const transaction = {
            to : contract.address,
            value,
            inputInfo,
            functionName : chosenFunction,
            nonce,
            data: encodedTransaction,
            name : transactionName || (chosenFunction + '_' + nonce),
            safeAddress: await safe.getAddress()
        }

        setTransaction(transaction)
        addToTransactionHistory(transaction)
    }

    return (
        <div>
            <p className="is-success">ABI loaded successfully. Choose the function to call.</p>
            
            <p className="is-warning">Note: All numerical values must be inserted in integer format!</p>
            <select className="select" onChange={e => setChosenFunction(e.target.value)} value={chosenFunction}>
                {(
                    Object.keys(functions))
                        .filter(f => functions[f].stateMutability == 'nonpayable' || functions[f].stateMutability == 'payable')
                        .map(funcName => (
                            <option key={funcName} value={funcName}>{funcName}</option>
                        )
                )}
            </select>
            {chosenFunction && <div>
                <div className="box">
                    {functions[chosenFunction].inputs.map((input, i) =>
                        <div key={i}>
                            <label htmlFor={input.name || 'input' + i}>{(input.name || 'Input ' + i) + ' (' + input?.type + ') '}</label>
                            <input className="input" type="text" value={inputs[input]} onChange={e => updateInput(i, e.target.value)}/>
                        </div>
                    )}
                </div>
                <label htmlFor="value">Tokens to be sent with the transaction (wei)</label>
                <input id="value" className="input" type="text" value={value} onChange={e => setValue(e.target.value)} />
                <label htmlFor="transactionName">Transaction Name (will not be saved on-chain)</label>
                <input id="transactionName" className="input" type="text" value={transactionName} onChange={e => setTransactionName(e.target.value)} />
                <button className="button is-primary" onClick={buildTransaction}>Build Transaction</button>
            </div>}
        </div>
    )
}