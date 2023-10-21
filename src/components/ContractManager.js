const ethers = require('ethers')

import TransactionBuilder from "./TransactionBuilder"
import { useState } from "react"

export default function ContractManager ({ provider, safe, setError, setTransaction }) {    
    const [contract, setContract] = useState(null)
    const [contractAddress, setContractAddress] = useState('')
    const [abiText, setAbiText] = useState('')

    async function handleFileChange(e) {
        try {
            const file = e.target.files[0]
            const text = await file.text()
            setAbiText(text)
            setError(null)
        } catch (e) {
            setError(e)
        }
    }

    async function connectToContract () {
        try {
            let abi
            try {
                abi = JSON.parse(abiText)
            } catch {
                throw new Error('Failed to parse JSON ABI')
            }

            // Sometimes the ABI is wrapped in an 'abi' field
            if (abi.abi) {
                abi = abi.abi
            }

            const newContract = new ethers.Contract(contractAddress, abi, await provider.getSigner())
            setContract(newContract)
            setError(null)
        } catch (e) {
            setError(e)
        }
    }

    return (
        contract ? (
            <TransactionBuilder contract={contract} setTransaction={setTransaction} safe={safe} setError={setError}/>
        ) :
        <div className="box">
            <p>First, insert the ABI of the contract and the address</p>
            <div>
                <label htmlFor="contractAddress">Contract address</label>
                <input className="input" type="text" id="contractAddress" value={contractAddress} onChange={e => setContractAddress(e.target.value)} />
            </div>
            <div>
                <label htmlFor="abi">ABI</label>
                <textarea className="textarea" id="abi" value={abiText} onChange={e => setAbiText(e.target.value)} />
                <p>You can also load the ABI from a .json file. Note: That is not the same file as a transaction file!</p>
                <div className="file">
                    <label className="file-label">
                        <input className="file-input" type="file" onChange={handleFileChange}
                        accept=".json" />
                        <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            Choose a file…
                        </span>
                        </span>
                    </label>
                </div>
            </div>
            <button className="button is-primary" disabled={!abiText || !contractAddress} onClick={connectToContract}>Connect to Contract</button>
        </div>
    )
}