import { Injectable } from '@angular/core';
import { WarehouseInbetweenMode } from '../models/whs/WarehouseInbetweenMode';
import { UrlSegment } from '@angular/router';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Injectable()
export class WarehouseInbetweenBehaviorFactoryService {

  constructor() { }

  public create(path: UrlSegment[]): WarehouseInbetweenMode {
    let mode = {} as WarehouseInbetweenMode

    var _path = path[0].path

    switch (_path) {
      case 'inbetween-warehouse-edit':
        if (path.length === 1) {
          throw Error('Azonosító kitöltése szükséges a szerkesztőfelület útvonalában!')
        }
        mode = this.forEdit(HelperFunctions.ToInt(path[1].path))
        break
      case 'inbetween-warehouse':
        mode = this.forCreate()
        break
      default:
        throw new Error('Unsupported mode based on path: ' + path)
    }

    return mode
  }

  private forCreate(): WarehouseInbetweenMode {
    return {
      edit: false,
      title: 'Raktárközi átadás bizonylat'
    } as WarehouseInbetweenMode
  }

  private forEdit(id: number): WarehouseInbetweenMode {
    return {
      edit: true,
      title: 'Raktárközi átadás bizonylat módosítása',
      id: id
    } as WarehouseInbetweenMode
  }
}
