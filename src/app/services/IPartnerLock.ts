export interface IPartnerLock {
    lockCustomer(customerId: number|string): Promise<unknown>

    unlockCustomer(): Promise<unknown>
}
