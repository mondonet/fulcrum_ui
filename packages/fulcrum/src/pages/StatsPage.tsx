import React, { PureComponent } from "react";
import { StatsTokenGrid } from "../components/StatsTokenGrid";
import { Footer } from "../layout/Footer";
import { HeaderOps } from "../layout/HeaderOps";
// import { FulcrumProviderEvents } from "../services/events/FulcrumProviderEvents";
// import { ProviderChangedEvent } from "../services/events/ProviderChangedEvent";
// import { FulcrumProvider } from "../services/FulcrumProvider";

export interface IStatsPageProps {
  doNetworkConnect: () => void;
  isLoading: boolean;
  isMobileMedia: boolean;
}

interface IStatsPageState {
}

export class StatsPage extends PureComponent<IStatsPageProps, IStatsPageState> {
  constructor(props: any) {
    super(props);

    // FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
  }

  /*public componentDidMount(): void {
    if (!FulcrumProvider.Instance.web3Wrapper) {
      this.props.doNetworkConnect();
    }
  }*/

  public render() {
    return (
      <div className="stats-page">
        <HeaderOps isMobileMedia={this.props.isMobileMedia} isLoading={this.props.isLoading} doNetworkConnect={this.props.doNetworkConnect} />
        <main>
          <StatsTokenGrid isMobileMedia={this.props.isMobileMedia} />
        </main>
        <Footer isMobileMedia={this.props.isMobileMedia}/>
      </div>
    );
  }

  /*private onProviderChanged = async (event: ProviderChangedEvent) => {
    this.setState({ ...this.state, selectedKey: this.state.selectedKey, priceGraphData: priceGraphData });
  };*/
}
