import moment from "moment"

export class NavLine {
    id: number = 0
    createTime: Date = new Date
    invoiceID: number = 0
    invoiceNumber: string = ''
    status: string = ''
    statusX: string = ''
    operation: string = ''
    operationX: string = ''
    notice: string|null = null
    tokenTime: Date = new Date
    token: string = ''
    tokenFuncCode: string = ''
    tokenMessage: string = ''
    sendTime: Date = new Date
    sendFuncCode: string = ''
    sendMessage: string = ''
    queryTime: Date = new Date
    queryFuncCode: string = ''
    queryMessage: string = ''
    transactionID: string = ''
    navxResultsCount: number = 0
    navxResults = []

    public static create(object: NavLine): NavLine {
        if (!object) {
            throw new Error('object cannot be null or undefined')
        }

        const navLine = new NavLine()

        const objectKeys = Object.getOwnPropertyNames(object)
        const navLineKeys = Object.getOwnPropertyNames(navLine)

        if (objectKeys.length !== navLineKeys.length) {
            throw new Error('Have one or more missmatching keys')
        }

        navLine.id = object.id
        navLine.createTime = moment(object.createTime).toDate()
        navLine.invoiceID = object.invoiceID
        navLine.invoiceNumber = object.invoiceNumber
        navLine.status = object.status
        navLine.statusX = object.statusX
        navLine.operation = object.operation
        navLine.operationX = object.operationX
        navLine.notice = object.notice
        navLine.tokenTime = moment(object.tokenTime).toDate()
        navLine.token = object.token
        navLine.tokenFuncCode = object.tokenFuncCode
        navLine.tokenMessage = object.tokenMessage
        navLine.sendTime = moment(object.sendTime).toDate()
        navLine.sendFuncCode = object.sendFuncCode
        navLine.sendMessage = object.sendMessage
        navLine.queryTime = moment(object.queryTime).toDate()
        navLine.queryFuncCode = object.queryFuncCode
        navLine.queryMessage = object.queryMessage
        navLine.transactionID = object.transactionID
        navLine.navxResultsCount = object.navxResultsCount
        navLine.navxResults = object.navxResults

        return navLine
    }
}
