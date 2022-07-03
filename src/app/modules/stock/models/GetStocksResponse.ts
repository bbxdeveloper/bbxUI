import { Response } from "src/assets/model/Response";
import { Stock } from "./Stock";

export interface GetStocksResponse extends Response<Stock> {}