import { DynamicObject, JsonIgnore } from "./navigation/DynamicObject";

interface Dictionary<T> {
    [Key: string]: T
}

/**
 * Saves and restores values for fields
 */
export class MementoObject<T = any> extends DynamicObject {
    /**
     * Default field list for save and restore
     */
    @JsonIgnore
    public DeafultFieldList: string[] = [];

    /**
     * Cache
     */
    @JsonIgnore
    private FieldMemory: Dictionary<T> = {};

    /**
     * For indexing this object as a dictionary
     * Works well with inheritance
     */
    @JsonIgnore
    private get t(): any { return this as any; }

    constructor() {
        super()
    }

    /**
     * Save values for fields in @see this.DeafultFieldList
     */
    public SaveDefault(): void {
        this.DeafultFieldList.forEach(x => {
            this.FieldMemory[x] = this.t[x];
        });
    }

    /**
     * Restore values for fields in @see this.DeafultFieldList
     */
    public RestoreDefault(): void {
        this.DeafultFieldList.forEach(x => {
            this.t[x] = this.FieldMemory[x];
        });
    }

    /**
     * Save - a specific value for - a field.
     * @param key field name in object: not given: saves every field
     * @param val value to save - not given: saves value from actual field
     */
    public Save(key?: string, val?: T): void {
        console.log(`Save key ${key}, value ${val}`)
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

    /**
     * Restore value for field.
     * @param key field name in object: not given: restores every field
     */
    public Restore(key?: string): void {
        console.log(`Restore key ${key}, value ${this.FieldMemory[key!]}`)
        if (key){
            this.t[key] = this.FieldMemory[key];
        } else {
            Object.keys(this.FieldMemory).forEach((key: string) => {
                this.t[key] = this.FieldMemory[key];
            });
        }
    }
}