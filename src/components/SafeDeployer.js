import { useMultisigHistory } from "@/common/state"
import { useEffect, useState } from "react"

export default function SafeDeployer ({safeFactory, setSafe, setError}) {
    const [owners, setOwners] = useState([])
    const [numOwners, setNumOwners] = useState(1)
    const [threshold, setThreshold] = useState(1)
    const [newSafe, setNewSafe] = useState(null)
    const { addToMultisigHistory } = useMultisigHistory()
    async function deploy() {
        const safeAccountConfig = {
            owners,
            threshold
          }
          
        try {
            const safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
            setNewSafe(safeSdk)
            setError(null)
            addToMultisigHistory(await safeSdk.getAddress())
        } catch (e) {
            setError(e)
        }
    }

    useEffect(() => {
        if (threshold > numOwners) {
            setThreshold(numOwners)
        } else if (threshold == 0) {
            setThreshold(1)
        }
    })

    return (
        <div className="box">
            <h2>Multisig Deployer</h2>
            <p>Deploy a new multisig</p>

            <label htmlFor="numOwners">Number of owners</label>
            <input className="input" type="number" min={1} id="numOwners" value={numOwners} onChange={e => setNumOwners(parseInt(e.target.value))} />

            <label htmlFor="threshold">Threshold</label>
            <input className="input" type="number" min={1} id="threshold" value={threshold} onChange={e => setThreshold(e.target.value)} />

            {
                [...Array(numOwners || 1).keys()].map(i => (
                    <div key={i}>
                        <label htmlFor={`owner${i}`}>Owner {i + 1}</label>
                        <input className="input" type="text" id={`owner${i}`} value={owners[i]} onChange={e => {
                            const newOwners = [...owners]
                            newOwners[i] = e.target.value
                            setOwners(newOwners)
                        }} />
                    </div>
                ))
            }

            <button className="button" onClick={deploy}>Deploy</button>
            { newSafe && (<>
                <p>Multisig deployed.</p>
                <button className="button is-primary" onClick={() => setSafe(newSafe)}>Connect to deployed multisig</button>
            </>)}
        </div>
    )
}