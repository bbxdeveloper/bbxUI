export interface IPartnerLock {
    lockCustomer(customerId: number|string): Promise<unknown>

    unlockCustomer(): Promise<unknown>

    switchCustomer(customerId: number|string): Promise<unknown>
}
