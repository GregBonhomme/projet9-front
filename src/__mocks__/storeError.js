const mockedBills = {
    list() {
        return Promise.reject(new Error('404 files not found'))
    },
}

export default {
    bills() {
        return mockedBills
        //return {}
    },
}