import { BigNumber } from "@0x/utils";
import React, { Component } from "react";
import TagManager from "react-gtm-module";
import { Asset } from "../domain/Asset";
import { AssetDetails } from "../domain/AssetDetails";
import { AssetsDictionary } from "../domain/AssetsDictionary";
import { IPriceDataPoint } from "../domain/IPriceDataPoint";
import { PositionType } from "../domain/PositionType";
import { TradeRequest } from "../domain/TradeRequest";
import { TradeTokenKey } from "../domain/TradeTokenKey";
import { TradeType } from "../domain/TradeType";
import { FulcrumProviderEvents } from "../services/events/FulcrumProviderEvents";
import { ProviderChangedEvent } from "../services/events/ProviderChangedEvent";
import { TradeTransactionMinedEvent } from "../services/events/TradeTransactionMinedEvent";
import { FulcrumProvider } from "../services/FulcrumProvider";
import configProviders from "./../config/providers.json";
// import { Change24HMarker, Change24HMarkerSize } from "./Change24HMarker";
import { LeverageSelector } from "./LeverageSelector";
import { PositionTypeMarker } from "./PositionTypeMarker";
// const tagManagerArgs = {
//     gtmId: configProviders.Google_TrackingID
// }
// TagManager.initialize(tagManagerArgs)


export interface ITradeTokenGridRowFooterMBProps {
  selectedKey: TradeTokenKey;
  isMobile: boolean;
  asset: Asset;
  defaultUnitOfAccount: Asset;
  positionType: PositionType;
  defaultLeverage: number;
  defaultTokenizeNeeded: boolean;

  onSelect: (key: TradeTokenKey) => void;
  onTrade: (request: TradeRequest) => void;
  onShowMyTokensOnlyChange: (value: boolean) => void;
}

interface ITradeTokenGridRowState {
  assetDetails: AssetDetails | null;
  leverage: number;
  version: number;
  asset:Asset;
  latestPriceDataPoint: IPriceDataPoint;
  interestRate: BigNumber;
  balance: BigNumber;
  isLoading: boolean;
}

export class TradeTokenGridRowMobileFooter extends Component<ITradeTokenGridRowFooterMBProps, ITradeTokenGridRowState> {
  constructor(props: ITradeTokenGridRowFooterMBProps, context?: any) {
    super(props, context);

    const assetDetails = AssetsDictionary.assets.get(props.asset);

    this.state = {
      leverage: this.props.defaultLeverage,
      assetDetails: assetDetails || null,
      latestPriceDataPoint: FulcrumProvider.Instance.getPriceDefaultDataPoint(),
      interestRate: new BigNumber(0),
      balance: new BigNumber(0),
      version: 2,
      asset:Asset.ETH,
      isLoading:true
    };

    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderAvailable, this.onProviderAvailable);
    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.TradeTransactionMined, this.onTradeTransactionMined);
  }

  private getTradeTokenGridRowSelectionKeyRaw(props: ITradeTokenGridRowFooterMBProps, leverage: number = this.state.leverage) {
    const key = new TradeTokenKey(props.asset, props.defaultUnitOfAccount, props.positionType, leverage, props.defaultTokenizeNeeded, 2);

    // check for version 2, and revert back to version if not found
    if (key.erc20Address === "") {
      key.setVersion(1);
    }

    return key;
  }

  private getTradeTokenGridRowSelectionKey(leverage: number = this.state.leverage) {
    return this.getTradeTokenGridRowSelectionKeyRaw(this.props, leverage);
  }

  private async derivedUpdate() {
    let version = 2;
    const tradeTokenKey = new TradeTokenKey(this.props.asset, this.props.defaultUnitOfAccount, this.props.positionType, this.state.leverage, this.props.defaultTokenizeNeeded, version);
    if (tradeTokenKey.erc20Address === "") {
      tradeTokenKey.setVersion(1);
      version = 1;
    }

    const latestPriceDataPoint = await FulcrumProvider.Instance.getTradeTokenAssetLatestDataPoint(tradeTokenKey);
    const interestRate = await FulcrumProvider.Instance.getTradeTokenInterestRate(tradeTokenKey);
    const balance = await FulcrumProvider.Instance.getPTokenBalanceOfUser(tradeTokenKey);

    this.setState({
      ...this.state,
      latestPriceDataPoint: latestPriceDataPoint,
      interestRate: interestRate,
      balance: balance,
      version: version
    });
    if(latestPriceDataPoint.price !=0){
      this.setState({
        isLoading: false,
      });
    }
  }

  private onProviderAvailable = async () => {
    await this.derivedUpdate();
  };

  private onProviderChanged = async (event: ProviderChangedEvent) => {
    await this.derivedUpdate();
  };

  private onTradeTransactionMined = async (event: TradeTransactionMinedEvent) => {
    if (event.key.toString() === this.getTradeTokenGridRowSelectionKey().toString()) {
      await this.derivedUpdate();
    }
  };

  public componentWillUnmount(): void {
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderAvailable, this.onProviderAvailable);
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.TradeTransactionMined, this.onTradeTransactionMined);
  }

  public componentDidMount(): void {
    this.derivedUpdate();
  }

  public componentDidUpdate(
    prevProps: Readonly<ITradeTokenGridRowFooterMBProps>,
    prevState: Readonly<ITradeTokenGridRowState>,
    snapshot?: any
  ): void {
    const currentTradeTokenKey = this.getTradeTokenGridRowSelectionKey(this.state.leverage);
    const prevTradeTokenKey = this.getTradeTokenGridRowSelectionKeyRaw(prevProps, prevState.leverage);

    if (
      prevState.leverage !== this.state.leverage ||
      (prevProps.selectedKey.toString() === prevTradeTokenKey.toString()) !==
        (this.props.selectedKey.toString() === currentTradeTokenKey.toString())
    ) {
      this.derivedUpdate();
    }
  }

  public render() {
    if (!this.state.assetDetails) {
      return null;
    }

    const tradeTokenKey = this.getTradeTokenGridRowSelectionKey(this.state.leverage);
    const bnPrice = new BigNumber(this.state.latestPriceDataPoint.price);
    const bnLiquidationPrice = new BigNumber(this.state.latestPriceDataPoint.liquidationPrice);
    /*if (this.props.positionType === PositionType.SHORT) {
      bnPrice = bnPrice.div(1000);
      bnLiquidationPrice = bnLiquidationPrice.div(1000);
    }*/
    // bnPrice = bnPrice.div(1000);
    // bnLiquidationPrice = bnLiquidationPrice.div(1000);

    // const bnChange24h = new BigNumber(this.state.latestPriceDataPoint.change24h);
    // console.log("this.props.asset - ",this.props.asset)
    // console.log("this.state.asset = "+this.props.selectedKey.asset)
    // console.log("this.props.selectedKey.asset - ",this.props.selectedKey.asset)
    const isActiveClassName =
      this.props.asset === this.props.selectedKey.asset ? 
      this.props.isMobile ? "trade-footer-grid--active" : "trade-token-grid-tab-item--active"
      : "";

    const classNamePrefix = this.props.isMobile ? "trade-token-grid-row" : "trade-token-grid-tab-item"
    return (

      <div className={`${this.props.isMobile ? "trade-footer-grid" : classNamePrefix} ${isActiveClassName}`}  onClick={this.onSelectClick}>

        {/*<div className="trade-token-grid-row__col-token-name">*/}
          {/*/!*<span className="rounded-mark">?</span>*!/*/}
          {/*{this.state.assetDetails.displayName}*/}
        {/*</div>*/}
        {/*<div className="trade-token-grid-row__col-position-type">*/}
          {/*<PositionTypeMarker value={this.props.positionType} />*/}
        {/*</div>*/}
        <div
            className={`${classNamePrefix}__col-token-image`}
            style={{backgroundColor: this.state.assetDetails.bgColor, borderLeftColor: this.state.assetDetails.bgColor}}
          >
            <img src={this.state.assetDetails.logoSvg} alt={this.state.assetDetails.displayName}/>
          </div>
        {/*<div className="trade-token-grid-row__col-leverage">*/}
          {/*{this.state.leverage+'x'}*/}
          {/*<LeverageSelector*/}
            {/*value={this.state.leverage}*/}
            {/*minValue={this.props.positionType === PositionType.SHORT ? 1 : 2}*/}
            {/*maxValue={4}*/}
            {/*onChange={this.onLeverageSelect}*/}
          {/*/>*/}
        {/*</div>*/}
        {/*<div title={`$${bnPrice.toFixed(18)}`} className="trade-token-grid-row__col-price">*/}
          {/*{!this.state.isLoading ?`$${bnPrice.toFixed(2)}` : 'Loading...'}*/}
          {/*</div>*/}
        {/*<div title={this.state.interestRate.gt(0) ? `${this.state.interestRate.toFixed(18)}%` : ``} className="trade-token-grid-row__col-profit">*/}
          {/*{this.state.interestRate.gt(0) ? `${this.state.interestRate.toFixed(4)}%` : "Loading..."}*/}
        {/*</div>*/}
        {/*<div title={`$${bnLiquidationPrice.toFixed(18)}`} className="trade-token-grid-row__col-price">*/}
          {/*{!this.state.isLoading ? `$${bnLiquidationPrice.toFixed(2)}` : 'Loading...' }*/}
          {/*</div>*/}
        {/*<div className="trade-token-grid-row__col-change24h">
          <Change24HMarker value={bnChange24h} size={Change24HMarkerSize.MEDIUM} />
        </div>*/}

        {/*{this.renderActions(this.state.balance.eq(0))}*/}
      </div>
    );
  }

  private renderActions = (isBuyOnly: boolean) => {
    return isBuyOnly ? (
      <div className="trade-token-grid-row__col-action">
        <button className="trade-token-grid-row__buy-button trade-token-grid-row__button--size-full" onClick={this.onBuyClick}>
          {TradeType.BUY}
        </button>
      </div>
    ) : (
      <div className="trade-token-grid-row__col-action">
        <button className="trade-token-grid-row__buy-button trade-token-grid-row__button--size-half" onClick={this.onBuyClick}>
          {TradeType.BUY}
        </button>
        <button className="trade-token-grid-row__sell-button trade-token-grid-row__button--size-half" onClick={this.onSellClick}>
          {TradeType.SELL}
        </button>
      </div>
    );
  };

  public onLeverageSelect = (value: number) => {
    const key = this.getTradeTokenGridRowSelectionKey(value);

    this.setState({ ...this.state, leverage: value, version: key.version });

    this.props.onSelect(this.getTradeTokenGridRowSelectionKey(value));
  };

  public onSelectClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    this.props.onSelect(this.getTradeTokenGridRowSelectionKey());
  };

  public onBuyClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const tagManagerArgs = {
                            dataLayer: {
                                name:this.state.leverage + 'x' + this.props.asset +'-'+ this.props.positionType +'-'+ this.props.defaultUnitOfAccount,
                                sku:this.state.leverage + 'x' + this.props.asset +'-'+ this.props.positionType,
                                category:this.props.positionType,
                                price:'0',
                                status:"In-progress"
                            },
                            dataLayerName: 'PageDataLayer'
                        }
    // console.log("tagManagerArgs = "+tagManagerArgs)
    TagManager.dataLayer(tagManagerArgs)

    this.props.onTrade(
      new TradeRequest(
        TradeType.BUY,
        this.props.asset,
        this.props.defaultUnitOfAccount, // TODO: depends on which one they own
        Asset.ETH,
        this.props.positionType,
        this.state.leverage,
        new BigNumber(0),
        this.props.defaultTokenizeNeeded, // TODO: depends on which one they own
        this.state.version
      )
    );
  };

  public onSellClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    this.props.onTrade(
      new TradeRequest(
        TradeType.SELL,
        this.props.asset,
        this.props.defaultUnitOfAccount, // TODO: depends on which one they own
        this.props.selectedKey.positionType === PositionType.SHORT ? this.props.selectedKey.asset : Asset.DAI,
        this.props.positionType,
        this.state.leverage,
        new BigNumber(0),
        this.props.defaultTokenizeNeeded, // TODO: depends on which one they own
        this.state.version
      )
    );
  };
}
