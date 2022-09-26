import { IResponse } from "src/assets/model/IResponse";
import { Stock } from "./Stock";

export interface GetStocksResponse extends IResponse<Stock> {}