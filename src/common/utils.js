const ethers = require('ethers')

function maybeFormatEther(value) {
    try {
        return ethers.utils.formatEther(value.toString()).toString()
    } catch {
        return 'N/A'
    }
}

export { maybeFormatEther }