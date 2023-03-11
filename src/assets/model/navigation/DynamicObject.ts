import 'reflect-metadata'

export const MetadataKey = Symbol("JsonIgnore");

export class DynamicObject {
    @JsonIgnore
    public JsonIgnoreList: string[] = [];

    public Replacer(key: string, value: any): any {
        if (value !== this && typeof value == 'object' && value?.JsonIgnoreList !== undefined) {
            this.JsonIgnoreList = this.JsonIgnoreList.concat(value.GetIgnoredPropertyKeys())
        }

        if (value !== this && Array.isArray(value) && value.length > 0 && value[0]?.JsonIgnoreList !== undefined) {
            this.JsonIgnoreList = this.JsonIgnoreList.concat(value[0].GetIgnoredPropertyKeys())
        }

        var valueKey = (typeof value === "string")

        var hasJsonIgnore = valueKey ? 
            (Reflect.getMetadataKeys(this, key).includes(MetadataKey) || Reflect.getMetadataKeys(this, value).includes(MetadataKey)) :
            Reflect.getMetadataKeys(this, key).includes(MetadataKey)
        
        var isInJsonIgnore = valueKey ?
            (this.JsonIgnoreList.indexOf(key) > -1 || this.JsonIgnoreList.indexOf(value) > -1) :
            this.JsonIgnoreList.indexOf(key) > -1 

        if (hasJsonIgnore || isInJsonIgnore) {
            return undefined
        }

        return value
    }

    public GetIgnoredPropertyKeys(): string[] {
        Object.keys(this).forEach((key: string) => {
            var property = (this as any)[key]

            if (property !== undefined) {
                if (Reflect.getMetadataKeys(this, key).includes(MetadataKey)) {
                    this.JsonIgnoreList = this.JsonIgnoreList.concat(key)
                } else if (typeof property == 'object' && property?.JsonIgnoreList !== undefined) {
                    this.JsonIgnoreList = this.JsonIgnoreList.concat(property.GetIgnoredPropertyKeys())
                } else if (Array.isArray(property) && property.length > 0 && property[0]?.JsonIgnoreList !== undefined) {
                    this.JsonIgnoreList = this.JsonIgnoreList.concat(property[0].GetIgnoredPropertyKeys())
                }
            }

        });
        return this.JsonIgnoreList;
    }

    public JsonStringify(): string {
        return JSON.stringify(this, this.Replacer.bind(this))
    }
}

export function JsonIgnore(target?: Object, propertyKey?: string, descriptor?: PropertyDescriptor): void {
    Reflect.defineMetadata(MetadataKey, "JsonIgnore", target!, propertyKey!)
}