import { useEffect, useState } from "react"

export default function TransactionBuilder ( { contract, setTransaction, safe, setError } ) {
    const [chosenFunction, setChosenFunction] = useState('')
    const [value, setValue] = useState('0')
    const [inputs, setInputs] = useState([])
    console.log(contract.interface.functions)
    console.log(chosenFunction)
    console.log(contract.interface.functions['parameters()'])

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
        console.log(contract.interface.encodeFunctionData)
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

        setTransaction({
            'to' : contract.address,
            'value': value,
            'inputInfo' : inputInfo,
            'functionName' : chosenFunction,
            'nonce' : await safe.getNonce(),
            'data': encodedTransaction
        })
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
                <input className="input" type="text" value={value} onChange={e => setValue(e.target.value)} />
                <button className="button is-primary" onClick={buildTransaction}>Build Transaction</button>
            </div>}
        </div>
    )
}