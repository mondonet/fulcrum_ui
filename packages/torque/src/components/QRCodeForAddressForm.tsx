import QRCode from "qrcode.react";
import React, { Component } from "react";

export interface IQRCodeForAddressFormProps {
  address: string;

  onDecline: () => void;
}

export class QRCodeForAddressForm extends Component<IQRCodeForAddressFormProps> {
  public render() {
    return (
      <div className="borrow-via-transfer-address-qr-form">
        <section className="dialog-content">
          <div className="borrow-via-transfer-address-qr-form__qr-container">
            <QRCode
              value={this.props.address}
              size={240}
              level={"L"}
              renderAs={"svg"}
            />
          </div>
          <div className="borrow-via-transfer-address-qr-form__address-container">
            {this.props.address}
          </div>
        </section>
        <section className="dialog-actions">
          <div className="borrow-via-transfer-address-qr-form__actions-container">
            <button className="btn btn-size--small" onClick={this.props.onDecline}>Close</button>
          </div>
        </section>
      </div>
    )
  }
}
