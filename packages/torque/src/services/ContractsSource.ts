import * as _ from "lodash";

import { erc20Contract } from "../contracts/erc20";
import { iBZxContract } from "../contracts/iBZxContract";
import { iTokenContract } from "../contracts/iTokenContract";
import { Asset } from "../domain/Asset";

const ethNetwork = process.env.REACT_APP_ETH_NETWORK;

export class ContractsSource {
  private readonly provider: any;

  private erc20Json: any;
  private iBZxJson: any;
  private iTokenJson: any;

  public networkId: number;
  public canWrite: boolean;

  public constructor(provider: any, networkId: number, canWrite: boolean) {
    this.provider = provider;
    this.networkId = networkId;
    this.canWrite = canWrite;
  }

  private getiBZxAddress(): string {
    let address: string = "";
    switch (this.networkId) {
      case 1:
        address = "0x1cf226e9413addaf22412a2e182f9c0de44af002";
        break;
      case 42:
        address = "0x9009e85a687b55b5d6C314363C228803fAd32d01";
        break;
    }

    return address;
  }

  private async getiBZxContractRaw(): Promise<iBZxContract> {
    return new iBZxContract(
      this.iBZxJson.abi,
      this.getiBZxAddress().toLowerCase(),
      this.provider
    );
  }

  private getiTokenAddress(asset: Asset): string {
    let address: string = "";
    switch (asset) {
      case Asset.ETH:
      case Asset.WETH:
        switch (this.networkId) {
          case 1:
            address = "0x77f973fcaf871459aa58cd81881ce453759281bc";
            break;
          case 42:
            address = "0x54be07007c680ba087b3fcd8e675d1c929b6aaf5";
            break;
        }
        break;
      case Asset.DAI:
        switch (this.networkId) {
          case 1:
            address = "0x14094949152eddbfcd073717200da82fed8dc960";
            break;
          case 42:
            address = "0xa1e58f3b1927743393b25f261471e1f2d3d9f0f6";
            break;
        }
        break;
      case Asset.BAT:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
          case 42:
            address = "";
            break;
        }
        break;
      case Asset.KNC:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
          case 42:
            address = "";
            break;
        }
        break;
      case Asset.LINK:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
          case 42:
            address = "";
            break;
        }
        break;
      case Asset.MKR:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
          case 42:
            address = "";
            break;
        }
        break;
      case Asset.REP:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
        }
        break;
      case Asset.USDC:
        switch (this.networkId) {
          case 1:
            address = "0xf013406a0b1d544238083df0b93ad0d2cbe0f65f";
            break;
        }
        break;
      case Asset.WBTC:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
        }
        break;        
      case Asset.ZRX:
        switch (this.networkId) {
          case 1:
            address = "";
            break;
        }
        break;
      }

    return address;
  }

  private getAssetFromAddressRaw(addressErc20: string): Asset {
    let asset: Asset = Asset.UNKNOWN;

    switch (this.networkId) {
      case 1:
        switch (addressErc20) {
          case "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2":
            asset = Asset.WETH;
            break;
          case "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359":
            asset = Asset.DAI;
            break;
          case "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
            asset = Asset.USDC;
            break;
        }
        break;
      case 42:
        switch (addressErc20) {
          case "0xd0a1e359811322d97991e03f863a0c30c2cf029c":
            asset = Asset.WETH;
            break;
          case "0xc4375b7de8af5a38a93548eb8453a498222c4ff2":
            asset = Asset.DAI;
            break;
        }
        break;
    }

    return asset;
  }

  private async getiTokenContractRaw(asset: Asset): Promise<iTokenContract> {
    return new iTokenContract(
      this.iTokenJson.abi,
      this.getiTokenAddress(asset).toLowerCase(),
      this.provider
    );
  }

  public async Init() {
    this.erc20Json = await import(`./../assets/artifacts/${ethNetwork}/erc20.json`);
    this.iBZxJson = await import(`./../assets/artifacts/${ethNetwork}/iBZx.json`);
    this.iTokenJson = await import(`./../assets/artifacts/${ethNetwork}/iToken.json`);
  }

  private async getErc20ContractRaw(addressErc20: string): Promise<erc20Contract> {
    return new erc20Contract(this.erc20Json.abi, addressErc20.toLowerCase(), this.provider);
  }

  public getErc20Contract = _.memoize(this.getErc20ContractRaw);
  public getiBZxContract = _.memoize(this.getiBZxContractRaw);
  public getiTokenContract = _.memoize(this.getiTokenContractRaw);
  public getAssetFromAddress = _.memoize(this.getAssetFromAddressRaw);
}
