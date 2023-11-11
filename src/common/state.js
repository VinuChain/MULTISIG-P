import { atom, useRecoilState } from 'recoil'
import { recoilPersist } from 'recoil-persist'

const ethers = require('ethers')

function customReplace(value) {
    // Recursively replaces instances of BigNumber with their parsed value

    if (!value) {
        return value
    } else if (value instanceof Array) {
        return value.map(customReplace)
    } else if (value.type == 'BigNumber') {
        return ethers.BigNumber.from(value)
    } else if (value instanceof Object) {
        for (const [key, val] of Object.entries(value)) {
            value[key] = customReplace(val)
        }
        return value
    } else {
        return value
    }
}

const customConverter = {
    stringify: (value) => {
        return JSON.stringify(value)
    },
    parse: (value) => {
        const parsed = JSON.parse(value)

        return customReplace(parsed)
    }
}

const { persistAtom } = recoilPersist({ converter : customConverter })

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