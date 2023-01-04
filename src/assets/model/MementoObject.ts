interface Dictionary<T> {
    [Key: string]: T
}

export class MementoObject<T = any> {
    public DeafultFieldList: string[] = [];

    private FieldMemory: Dictionary<T> = {};
    private get t(): any { return this as any; }

    constructor() {

    }

    public SaveDefault(): void {
        this.DeafultFieldList.forEach(x => {
            this.FieldMemory[x] = this.t[x];
        });
    }

    public RestoreDefault(): void {
        this.DeafultFieldList.forEach(x => {
            this.t[x] = this.FieldMemory[x];
        });
    }

    public Save(key?: string, val?: T): void {
        console.log("[MementoObject] Save: ", key, val, this.FieldMemory, this.t);
        console.trace();

        if (key) {
            if (val !== undefined) {
                this.FieldMemory[key] = val;
            } else {
                this.FieldMemory[key] = this.t[key];
            }
        } else {
            Object.keys(this).forEach((key: string) => {
                this.FieldMemory[key] = this.t[key];
            });
        }
    }

    public Restore(key?: string): void {
        console.log("[MementoObject] Restore: ", key, this.FieldMemory, this.t);
        console.trace();

        if (key ){
            this.t[key] = this.FieldMemory[key];
        } else {
            Object.keys(this.FieldMemory).forEach((key: string) => {
                this.t[key] = this.FieldMemory[key];
            });
        }
    }
}