import { BigNumber } from "@0x/utils";
import * as _ from "lodash";
import { Provider } from "web3/providers";
import { Asset } from "../domain/Asset";
import { TradeTokenKey } from "../domain/TradeTokenKey";

import { erc20Contract } from "../contracts/erc20";
import { iTokenContract } from "../contracts/iTokenContract";
import { pTokenContract } from "../contracts/pTokenContract";
import { ReferencePriceFeedContract } from "../contracts/ReferencePriceFeedContract";
import { TokenizedRegistryContract } from "../contracts/TokenizedRegistryContract";

import erc20Json from "./../assets/artifacts/kovan/erc20.json";
import iTokenJson from "./../assets/artifacts/kovan/iToken.json";
import pTokenJson from "./../assets/artifacts/kovan/pToken.json";
import ReferencePriceFeedJson from "./../assets/artifacts/kovan/ReferencePriceFeed.json";
import TokenizedRegistryJson from "./../assets/artifacts/kovan/TokenizedRegistry.json";

interface ITokenContractInfo {
  token: string;
  asset: string;
  name: string;
  symbol: string;
  tokenType: BigNumber;
  index: BigNumber;
}

export class ContractsSource {
  private readonly provider: Provider;
  private readonly tokenizedRegistryContract: TokenizedRegistryContract;
  private readonly networkId: number;

  private iTokensContractInfos: Map<string, ITokenContractInfo> = new Map<string, ITokenContractInfo>();
  private pTokensContractInfos: Map<string, ITokenContractInfo> = new Map<string, ITokenContractInfo>();

  public constructor(provider: Provider, networkId: number) {
    this.provider = provider;
    this.networkId = networkId;
    this.tokenizedRegistryContract = new TokenizedRegistryContract(
      TokenizedRegistryJson.abi,
      this.getTokenizedRegistryAddress().toLowerCase(),
      provider
    );
  }

  public async Init() {
    const step = 100;
    let pos = 0;
    let next: ITokenContractInfo[] = [];
    do {
      next = await this.tokenizedRegistryContract.getTokens.callAsync(
        new BigNumber(pos),
        new BigNumber(step),
        new BigNumber(1)
      );
      next.forEach(e => {
        this.iTokensContractInfos.set(e.symbol, e);
      });
      pos += step;
    } while (next.length > 0);

    pos = 0;
    next = [];
    do {
      next = await this.tokenizedRegistryContract.getTokens.callAsync(
        new BigNumber(pos),
        new BigNumber(step),
        new BigNumber(2)
      );
      next.forEach(e => {
        this.pTokensContractInfos.set(e.symbol, e);
      });
      pos += step;
    } while (next.length > 0);
  }

  private getTokenizedRegistryAddress(): string {
    let address: string = "";
    switch (this.networkId) {
      case 3:
        address = "0xD3A04EC94B32Dc4EDBFc8D3bE4cd44850E6Df246";
        break;
      case 42:
        address = "0x730df5c1e0a4b6ba7a982a585c1ec55187fbb3ca";
        break;
    }

    return address;
  }

  private getReferencePriceFeedAddress(): string {
    let address: string = "";
    switch (this.networkId) {
      case 3:
        address = "0x207056a6acB2727F834C9Bc987722B08628e5943";
        break;
      case 42:
        address = "0x325946B0ed8c5993E36BfCA1f218E22c2b10adf9";
        break;
    }

    return address;
  }

  private getErc20ContractRaw(addressErc20: string): erc20Contract {
    return new erc20Contract(erc20Json.abi, addressErc20.toLowerCase(), this.provider);
  }

  private getITokenContractRaw(asset: Asset): iTokenContract | null {
    const tokenContractInfo = this.iTokensContractInfos.get(`i${asset}`) || null;
    return tokenContractInfo ? new iTokenContract(iTokenJson.abi, tokenContractInfo.token, this.provider) : null;
  }

  private getPTokenContractRaw(key: TradeTokenKey): pTokenContract | null {
    const tokenContractInfo = this.pTokensContractInfos.get(key.toString()) || null;
    return tokenContractInfo ? new pTokenContract(pTokenJson.abi, tokenContractInfo.token, this.provider) : null;
  }

  private getReferencePriceFeedContractRaw(): ReferencePriceFeedContract {
    return new ReferencePriceFeedContract(
      ReferencePriceFeedJson.abi,
      this.getReferencePriceFeedAddress().toLowerCase(),
      this.provider
    );
  }

  public getPTokensAvailable(): TradeTokenKey[] {
    const result = new Array<TradeTokenKey>();
    this.pTokensContractInfos.forEach(e => {
      const tradeTokenKey = TradeTokenKey.fromString(e.symbol);
      if (tradeTokenKey) {
        result.push(tradeTokenKey);
      }
    });

    return result;
  }

  public getITokenErc20Address(asset: Asset): string | null {
    const tokenContractInfo = this.iTokensContractInfos.get(`i${asset}`) || null;
    return tokenContractInfo ? tokenContractInfo.token : null;
  }

  public getPTokenErc20Address(key: TradeTokenKey): string | null {
    const tokenContractInfo = this.pTokensContractInfos.get(key.toString()) || null;
    return tokenContractInfo ? tokenContractInfo.token : null;
  }

  public getErc20Contract = _.memoize(this.getErc20ContractRaw);
  public getITokenContract = _.memoize(this.getITokenContractRaw);
  public getPTokenContract = _.memoize(this.getPTokenContractRaw);
  public getReferencePriceFeedContract = _.memoize(this.getReferencePriceFeedContractRaw);
}
