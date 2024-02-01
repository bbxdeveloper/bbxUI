export interface CreateUserRequest {
    name: string
    email: string
    loginName: string
    password: string
    comment: string
    active: boolean
    warehouseID: number
    userLevel: string
}
