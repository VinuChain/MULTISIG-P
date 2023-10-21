import { atom, useRecoilState } from 'recoil'
import { recoilPersist } from 'recoil-persist'

const { persistAtom } = recoilPersist()

const multisigHistoryState = atom({
    key: 'multisigHistory',
    default: [],
    effects_UNSTABLE: [persistAtom],
})

const transactionHistoryState = atom({
    key: 'transactionHistory',
    default: [],
    effects_UNSTABLE: [persistAtom],
})

function useMultisigHistory() {
    const [multisigHistory, setMultisigHistory] = useRecoilState(multisigHistoryState)

    function removeFromMultisigHistory(address) {
        const index = multisigHistory.indexOf(address)
        if (index > -1) {
            let newHistory = [...multisigHistory]
            newHistory.splice(index, 1)
            setMultisigHistory(newHistory)
        }
    }

    function addToMultisigHistory(address) {
        // If it exists, remove from history
        const index = multisigHistory.indexOf(address)
        let newHistory = [...multisigHistory]
        if (index > -1) {
            newHistory.splice(index, 1)
        }

        // Add to history
        newHistory.unshift(address)
        setMultisigHistory(newHistory)
    }

    return {
        multisigHistory,
        addToMultisigHistory,
        removeFromMultisigHistory
    }
}

function useTransactionHistory() {
    const [transactionHistory, setTransactionHistory] = useRecoilState(transactionHistoryState)

    function addToTransactionHistory(transaction) {
        setTransactionHistory([transaction, ...transactionHistory])
    }

    function removeFromTransactionHistory(transaction) {
        const index = transactionHistory.indexOf(transaction)
        if (index > -1) {
            let newHistory = [...transactionHistory]
            newHistory.splice(index, 1)
            setTransactionHistory(newHistory)
        }
    }

    return {
        transactionHistory,
        addToTransactionHistory,
        removeFromTransactionHistory
    }
}

export {
    multisigHistoryState,
    useMultisigHistory,
    useTransactionHistory
}